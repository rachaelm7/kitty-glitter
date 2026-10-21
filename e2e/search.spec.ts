import { expect, test } from "./helpers";

async function openSearch(page: import("@playwright/test").Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Search everything" }).first().click();
  else await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeVisible();
  await expect(page.getByRole("combobox")).toBeFocused();
}

test("search finds one situation across emails, tasks, threads and appointments", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("dental");
  const list = page.getByRole("listbox", { name: "Results" });
  for (const kind of ["Life Thread", "Email", "Task", "Appointment"]) {
    await expect(list.getByRole("option").filter({ hasText: kind }).first()).toBeVisible();
  }
  await expect(page.getByRole("dialog", { name: "Search everything" }).getByRole("status")).toContainText("results");
});

test("opening an email result opens that email in the Inbox", async ({ page, isMobile }) => {
  await page.goto("/tasks");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("faucet estimate");
  await page.getByRole("option", { name: /Estimate for your kitchen faucet/ }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Estimate for your kitchen faucet" })).toBeVisible();
});

test("keyboard: arrows move, Enter opens a task in its editor, Escape closes", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("furnace");
  const options = page.getByRole("option");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("combobox")).toHaveAttribute("aria-activedescendant", /.+/);
  await page.keyboard.press("ArrowUp");
  await page.getByRole("combobox").fill("replace the furnace");
  await expect(options.first()).toContainText("Replace the furnace filter");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("dialog").getByLabel("Title")).toHaveValue("Replace the furnace filter");
  await page.keyboard.press("Escape");

  await openSearch(page, isMobile);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeHidden();
});

test("a page, an empty search, and a search with no matches", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  // Nothing typed: quick links.
  await expect(page.getByText("Quick links")).toBeVisible();
  await page.getByRole("combobox").fill("settings");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings$/);

  await openSearch(page, isMobile);
  // Recent now leads with what we opened.
  await expect(page.getByText("Recent and quick links")).toBeVisible();
  await expect(page.getByRole("option").first()).toContainText("Settings");
  await page.getByRole("combobox").fill("zzzzqq");
  await expect(page.getByText(/No matches for/)).toBeVisible();
});

test("the typed text is never stored, only opened results", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("private-looking words");
  await page.keyboard.press("Escape");
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(stored).not.toContain("private-looking");
});
