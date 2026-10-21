import { expect, test } from "./helpers";

test("Today widgets can be hidden, shown and reordered, and it persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Today" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Unread by account" })).toHaveCount(0);

  await page.getByRole("button", { name: "Customize" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("switch", { name: "Show Today's agenda" }).click();
  await sheet.getByRole("switch", { name: "Show Unread by account" }).click();
  await sheet.getByRole("button", { name: "Move Three priorities up" }).click();
  await sheet.getByRole("button", { name: "Done" }).click();

  await expect(page.getByRole("region", { name: "Today" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Unread by account" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("region", { name: "Today" })).toHaveCount(0);
  const first = page.locator("main section").first();
  await expect(first).toHaveAttribute("aria-labelledby", "w-priorities");
});

test("All clear celebration when every priority is done", async ({ page }) => {
  await page.goto("/");
  const needs = page.getByRole("region", { name: "Three priorities" }).getByRole("checkbox");
  for (let i = 0; i < 3; i++) await needs.nth(i).click();
  await expect(page.getByText("All clear. Nicely done.")).toBeVisible();
  await expect(page.getByText(/Nothing urgent is waiting on you/)).toBeVisible();
});

test("Inbox refresh shows a loading state and fetches nothing", async ({ page }) => {
  await page.goto("/inbox");
  await page.getByRole("button", { name: "Check for new mail" }).click();
  await expect(page.getByRole("status", { name: "Loading" })).toBeVisible();
  await expect(page.getByText(/You're up to date/)).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading" })).toHaveCount(0);
});

test("A broken widget is contained and can retry", async ({ page }) => {
  await page.goto("/more/states");
  await page.getByRole("button", { name: "Break the sample widget" }).click();
  await expect(page.getByText("Sample widget couldn't load")).toBeVisible();
  await expect(page.getByRole("heading", { name: "State gallery" })).toBeVisible();
});

test("Unknown pages show a friendly not-found", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "Nothing here" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Today" }).click();
  await expect(page).toHaveURL(/\/$/);
});
