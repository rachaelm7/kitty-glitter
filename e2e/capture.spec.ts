import { expect, test } from "./helpers";

test("Brain dump: review before adding, no invented dates", async ({ page }) => {
  await page.goto("/capture");
  await page
    .getByRole("textbox", { name: "Brain dump" })
    .fill("I need to renew the car insurance by Friday. Call the plumber about the sink. Clean the gutters next week. I'm a bit worried about the roof. Buy stamps");
  await page.getByRole("button", { name: "Sort it out" }).click();

  await expect(page.getByRole("heading", { name: "Review suggestions" })).toBeVisible();
  const titles = page.getByLabel("Title");
  await expect(titles).toHaveCount(5);
  await expect(titles.nth(0)).toHaveValue("Renew the car insurance");
  await expect(page.getByText("from “by friday”")).toBeVisible();
  // No date is set for thoughts that never mentioned one.
  await expect(page.getByText(/^\s*Due [A-Z][a-z]{2} \d+$/)).toHaveCount(1);
  await expect(page.getByText(/you said “next week”, so no exact date was set/)).toBeVisible();

  // The worry becomes a note that needs a thread; file it under a new one.
  await expect(page.getByText("Pick a Life Thread for this note")).toBeVisible();
  await expect(page.getByRole("button", { name: /Add 5 items/ })).toBeDisabled();
  await page.getByLabel("Life Thread").nth(3).selectOption({ label: "+ New Life Thread…" });
  await page.getByLabel("New Life Thread name").fill("Roof");

  // Leave "Buy stamps" out.
  await page.getByRole("checkbox", { name: "Include: Buy stamps" }).click();
  await page.getByRole("button", { name: "Add 4 items" }).click();

  await expect(page.getByText(/3 tasks, 1 thread note, 1 new Life Thread added/)).toBeVisible();
  await page.getByRole("link", { name: "Open Tasks" }).click();
  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: /Upcoming/ }).click();
  await expect(page.getByText("Renew the car insurance")).toBeVisible();
  await expect(page.getByText("Buy stamps")).toHaveCount(0);

  await page.goto("/threads");
  await page.getByRole("link", { name: /Roof/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Roof" })).toBeVisible();
  await expect(page.getByText(/worried about the roof/).first()).toBeVisible();
});

test("Simulated voice note fills the brain dump", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/capture");
  await page.getByRole("button", { name: /Voice note/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/microphone is not used/)).toBeVisible();
  await dialog.getByRole("radio", { name: "Errands" }).click();
  await dialog.getByRole("button", { name: "Start simulated recording" }).click();
  await dialog.getByRole("button", { name: "Use transcript" }).click();
  await expect(page.getByRole("textbox", { name: "Brain dump" })).toHaveValue(/Pick up the library hold in 4 days/);
});

test("Quick capture turns the approved example into three tasks for review", async ({ page }) => {
  await page.goto("/capture");
  await page.getByRole("textbox", { name: "Brain dump" }).fill("I need to schedule my dentist appointment, order cat food, and check on the insurance renewal.");
  await page.getByRole("button", { name: "Sort it out" }).click();
  const titles = page.getByLabel("Title");
  await expect(titles).toHaveCount(3);
  await expect(titles.nth(0)).toHaveValue("Schedule my dentist appointment");
  await expect(titles.nth(1)).toHaveValue("Order cat food");
  await expect(titles.nth(2)).toHaveValue("Check on the insurance renewal");
  await expect(page.getByText(/^\s*Due [A-Z][a-z]{2} \d+$/)).toHaveCount(0);
  await page.getByRole("button", { name: "Add 3 items" }).click();
  await expect(page.getByText(/3 tasks added/)).toBeVisible();
});
