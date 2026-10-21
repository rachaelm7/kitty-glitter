import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./helpers";

/** A real touch drag (the Inbox ignores mouse drags on purpose). */
async function swipe(page: Page, target: Locator, dx: number) {
  const box = (await target.boundingBox())!;
  const y = box.y + box.height / 2;
  const x0 = box.x + box.width * (dx < 0 ? 0.7 : 0.3);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (dx * i) / 8, y }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test("swipe right toggles read, swipe left archives, a short swipe does nothing", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch gestures");
  await page.goto("/inbox");
  const row = page.locator('[data-message-id="m2"]');
  const handle = row.locator("[data-swipe-row]");
  await expect(row.getByText("Unread:")).toHaveCount(1);

  await swipe(page, handle, 30); // too short and slow
  await expect(row.getByText("Unread:")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toHaveCount(0); // and not treated as a tap either

  await swipe(page, handle, 140); // right: mark read
  await expect(row.getByText("Unread:")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Marked as read");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(row.getByText("Unread:")).toHaveCount(1);

  await swipe(page, handle, -140); // left: archive
  await expect(page.locator('[data-message-id="m2"]')).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Archived");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.locator('[data-message-id="m2"]')).toHaveCount(1);
});

test("vertical scrolling is not hijacked by the swipe handler", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch gestures");
  await page.goto("/inbox");
  const handle = page.locator('[data-message-id="m2"] [data-swipe-row]');
  const box = (await handle.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 100, y: box.y + 20 }] });
  for (let i = 1; i <= 6; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + 104, y: box.y + 20 - i * 12 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator('[data-message-id="m2"]')).toHaveCount(1);
  await expect(page.getByRole("status")).not.toContainText("Archived");
});

test("keyboard: J/K move, U toggles read, E archives, / searches", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop shortcuts");
  await page.goto("/inbox");
  await expect(page.getByText(/Keyboard:/)).toBeVisible();

  await page.keyboard.press("j");
  const first = page.locator("li[aria-current='true']");
  await expect(first).toHaveAttribute("data-message-id", "m2");
  await page.keyboard.press("j");
  await expect(first).toHaveAttribute("data-message-id", "m1");
  await page.keyboard.press("k");
  await expect(first).toHaveAttribute("data-message-id", "m2");

  await page.keyboard.press("u");
  await expect(page.getByRole("status")).toContainText("Marked as read");
  await expect(page.locator('[data-message-id="m2"]').getByText("Unread:")).toHaveCount(0);

  await page.keyboard.press("e");
  await expect(page.locator('[data-message-id="m2"]')).toHaveCount(0);
  await expect(first).toHaveAttribute("data-message-id", "m1"); // selection moves on, it isn't lost
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.locator('[data-message-id="m2"]')).toHaveCount(1);

  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.keyboard.press("/");
  await expect(page.getByLabel("Search every account")).toBeFocused();
  await page.keyboard.type("jk"); // typing in the search box must not trigger shortcuts
  await expect(page.getByLabel("Search every account")).toHaveValue("jk");
});
