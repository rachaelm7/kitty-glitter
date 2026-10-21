import { expect, test } from "./helpers";

test("finishing a repeating task adds the next one and updates Home upkeep", async ({ page }) => {
  await page.goto("/home");
  const furnace = page.getByRole("listitem").filter({ hasText: "Replace furnace filter" });
  await expect(furnace.getByText("Overdue", { exact: true })).toBeVisible();
  await expect(furnace.getByText(/On your Tasks · every 3 months/)).toBeVisible();

  await page.goto("/tasks");
  const row = page.getByRole("listitem").filter({ hasText: "Replace the furnace filter" });
  await expect(row.getByText("Every 3 months")).toBeVisible();
  await expect(row.getByRole("link", { name: "Home upkeep" })).toBeVisible();
  await page.getByRole("checkbox", { name: /Mark done: Replace the furnace filter/ }).click();
  await expect(page.getByRole("status")).toContainText("Next one is due in 90 days");

  // The next occurrence waits in Upcoming; this one is in Done.
  const views = page.getByRole("radiogroup", { name: "Show" });
  await views.getByRole("radio", { name: /Upcoming/ }).click();
  await expect(page.getByText("Replace the furnace filter")).toHaveCount(1);
  await views.getByRole("radio", { name: /Done/ }).click();
  await expect(page.getByText("Replace the furnace filter")).toHaveCount(1);

  // Home now agrees: it's up to date.
  await page.goto("/home");
  const after = page.getByRole("listitem").filter({ hasText: "Replace furnace filter" });
  await expect(after.getByText("On track", { exact: true })).toBeVisible();
  await expect(after.getByText(/last done today/)).toBeVisible();
});

test("undo puts both screens back, with no duplicate task", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByRole("checkbox", { name: /Mark done: Replace the furnace filter/ }).click();
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Replace the furnace filter")).toHaveCount(1);
  await page.goto("/home");
  await expect(page.getByRole("listitem").filter({ hasText: "Replace furnace filter" }).getByText("Overdue", { exact: true })).toBeVisible();
});

test("Mark done on Home completes the linked task and creates the next one", async ({ page }) => {
  await page.goto("/home");
  const smoke = page.getByRole("listitem").filter({ hasText: "Test smoke and CO detectors" });
  await smoke.getByRole("button", { name: "Mark done" }).click();
  await expect(page.getByRole("status")).toContainText("marked done");
  await expect(smoke.getByText("On track", { exact: true })).toBeVisible();

  await page.goto("/tasks");
  const views = page.getByRole("radiogroup", { name: "Show" });
  await views.getByRole("radio", { name: /Done/ }).click();
  await expect(page.getByText("Test smoke and CO detectors")).toHaveCount(1);
  await views.getByRole("radio", { name: /Upcoming/ }).click();
  await expect(page.getByText("Test smoke and CO detectors")).toHaveCount(1);
});

test("any task can be set to repeat from its details", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByRole("textbox", { name: "New task" }).fill("Water the ferns");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Edit task: Water the ferns" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Repeats").selectOption({ label: "Every 2 weeks" });
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Every 2 weeks")).toBeVisible();

  await page.getByRole("checkbox", { name: /Mark done: Water the ferns/ }).click();
  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: /Upcoming/ }).click();
  await expect(page.getByText("Water the ferns")).toHaveCount(1);
  await expect(page.getByText("Every 2 weeks")).toBeVisible();
});
