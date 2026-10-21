import { expect, test } from "./helpers";

test("Travel: itinerary, packing and thread link", async ({ page }) => {
  await page.goto("/travel");
  await expect(page.getByRole("heading", { name: "Lisbon getaway" })).toBeVisible();
  await expect(page.getByText("Cedar Coast Airlines CC 214")).toBeVisible();
  await expect(page.getByText("2 of 9 packed")).toBeVisible();
  await page.getByRole("checkbox", { name: "Packed: Passport" }).click();
  await expect(page.getByText("3 of 9 packed")).toBeVisible();
  await page.getByLabel("Add to packing list").fill("Sun hat");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("3 of 10 packed")).toBeVisible();

  await page.getByRole("link", { name: "Holiday trip to Lisbon" }).first().click();
  await expect(page).toHaveURL(/\/threads\/t-lisbon$/);
  await expect(page.getByRole("heading", { level: 1, name: "Holiday trip to Lisbon" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lisbon getaway/ })).toBeVisible();
});

test("Home: maintenance due states, mark done, insurance reminders", async ({ page }) => {
  await page.goto("/home");
  const filter = page.getByRole("listitem").filter({ hasText: "Replace furnace filter" });
  await expect(filter.getByText("Overdue")).toBeVisible();
  await filter.getByRole("button", { name: "Mark done" }).click();
  await expect(filter.getByText("On track")).toBeVisible();
  await expect(page.getByText("Auto insurance", { exact: true })).toBeVisible();
  await expect(page.getByText("Renews in 14 days")).toBeVisible();
  await expect(page.getByText("Dishwasher warranty")).toBeVisible();
});
