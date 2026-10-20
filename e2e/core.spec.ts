import { expect, test, type Page } from "@playwright/test";

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

// Start every test from the sample data (clear once per tab, not on reload).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("kg-test")) {
      localStorage.clear();
      sessionStorage.setItem("kg-test", "1");
    }
  });
});

test("Today shows the brief, needs and demo disclosure", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Good (morning|afternoon|evening)/);
  await expect(page.getByText("Demo · fictional data").first()).toBeVisible();
  const needs = page.getByRole("region", { name: "Needs you" }).getByRole("checkbox");
  await expect(needs).toHaveCount(3);
  await needs.first().click();
  await expect(needs.first()).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("2 of 3 left")).toBeVisible();
  await noHorizontalScroll(page);
});

test("Inbox search, filters and read-only message sheet", async ({ page }) => {
  await page.goto("/inbox");
  await page.getByRole("radio", { name: /Everything/ }).click();
  await page.getByLabel("Search every account").fill("dinner");
  await expect(page.getByRole("button", { name: /Dinner Saturday/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Q4 coverage plan/ })).toHaveCount(0);

  await page.getByLabel("Search every account").fill("");
  await page.getByRole("button", { name: "Work", exact: true }).click();
  await expect(page.getByRole("button", { name: /Q4 coverage plan/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Dinner Saturday/ })).toHaveCount(0);

  await page.getByRole("button", { name: /Q4 coverage plan/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Summary", { exact: true })).toBeVisible();
  await expect(dialog.getByText("By Friday", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Send" })).toBeDisabled();
  const reply = dialog.getByLabel(/Suggested reply/);
  await reply.fill("Edited draft");
  await expect(reply).toHaveValue("Edited draft");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await noHorizontalScroll(page);
});

test("Cleanup needs a review and confirm step, and changes nothing", async ({ page }) => {
  await page.goto("/inbox/cleanup");
  await expect(page.getByRole("link", { name: "Review" })).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("radiogroup", { name: "Action for Trendline Outlet" }).getByRole("radio", { name: "Unsubscribe" }).click();
  await page.getByRole("radiogroup", { name: "Action for The Daily Giggle" }).getByRole("radio", { name: "Mark spam" }).click();
  await page.getByRole("link", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review cleanup" })).toBeVisible();
  await expect(page.getByText("Unsubscribe · 14 emails")).toBeVisible();
  await expect(page.getByText("Mark as spam · 4 emails")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("No real emails were changed")).toBeVisible();
  await noHorizontalScroll(page);
});

test("Tasks: add, complete and from-email tag", async ({ page }) => {
  await page.goto("/tasks");
  await expect(page.getByText(/From email · Dana Whitfield/)).toBeVisible();
  await page.getByLabel("New task").fill("Water the plants");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Water the plants")).toBeVisible();
  await page.getByRole("checkbox", { name: /Water the plants/ }).click();
  await expect(page.getByText("Water the plants")).toBeHidden(); // moves out of the Open filter
  await page.getByRole("radio", { name: "All" }).click();
  await expect(page.getByText("Water the plants")).toBeVisible();
  await noHorizontalScroll(page);
});

test("More: theme switch persists", async ({ page }) => {
  await page.goto("/more");
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Auto" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
  await noHorizontalScroll(page);
});
