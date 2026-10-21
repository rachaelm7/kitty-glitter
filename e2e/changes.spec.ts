import { expect, test } from "./helpers";

test("Today shows what changed since yesterday, each line opens its source", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Since yesterday:/)).toBeVisible();
  await expect(page.getByText(/new emails? need(s)? you/).first()).toBeVisible();

  const region = page.getByRole("region", { name: "Since yesterday" });
  await expect(region).toBeVisible();
  await expect(region.getByText("Still waiting on 2 things")).toBeVisible();

  // Longer lists collapse and expand.
  const more = region.getByRole("button", { name: /Show \d+ more/ });
  await more.click();
  await expect(region.getByRole("button", { name: "Show fewer" })).toBeVisible();

  // An email line opens that email in the Inbox, and then drops off the list (it's read).
  await region.getByRole("button", { name: /New from Harbor Smiles Dental/ }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: /Please confirm your cleaning/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Since yesterday" }).getByText("New from Harbor Smiles Dental")).toHaveCount(0);
});

test("a thread's next step moves on as you finish tasks, then offers to wrap up", async ({ page }) => {
  // Give the faucet thread a second task.
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Add with details" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Title").fill("Book a plumber visit");
  await sheet.getByLabel("Life Thread").selectOption({ label: "Kitchen faucet repair" });
  await sheet.getByRole("button", { name: "Add task" }).click();

  await page.goto("/threads/t-house");
  await expect(page.getByText("Approve the $185 estimate")).toBeVisible();

  // Finish the step that was written down: the thread points at the next open task.
  await page.getByRole("checkbox", { name: /Done: Approve the faucet repair estimate/ }).click();
  const next = page.locator("p", { hasText: "Book a plumber visit" }).first();
  await expect(next).toBeVisible();
  await expect(page.getByText("Moved on automatically as you finished tasks.")).toBeVisible();

  // Finish the last one: nothing is invented, the thread offers to wrap up.
  await page.getByRole("checkbox", { name: /Done: Book a plumber visit/ }).click();
  const allDone = page.getByTestId("all-done");
  await expect(allDone.getByText("Every task in this thread is finished.")).toBeVisible();
  await allDone.getByRole("button", { name: "Wrap up this thread" }).click();
  await expect(page.getByText("Wrapped up", { exact: true })).toBeVisible();

  // The list and Today agree.
  await page.goto("/threads");
  await page.getByRole("group", { name: "Filter threads" }).getByRole("button", { name: /^Done/ }).click();
  await expect(page.getByRole("link", { name: /Kitchen faucet repair/ })).toBeVisible();
});

test("the waiting line follows the waiting task, and finishing it wraps up the thread", async ({ page }) => {
  await page.goto("/threads/t-car");
  await expect(page.getByText("Harborline to send a higher-deductible quote", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: /Done: Compare the insurance renewal quote/ }).click();
  await expect(page.getByTestId("all-done")).toBeVisible();
});
