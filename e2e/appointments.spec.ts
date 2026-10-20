import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("kg-test")) {
      localStorage.clear();
      sessionStorage.setItem("kg-test", "1");
    }
  });
});

test("Appointment Concierge: statuses, timeline, next actions, disclaimer", async ({ page }) => {
  await page.goto("/appointments");
  await expect(page.getByText("Fictional demo. Not medical advice.")).toBeVisible();

  for (const s of ["Needs Scheduling", "Scheduled", "Waiting on Office", "Results Pending", "Follow-Up Needed", "Completed"]) {
    await expect(page.getByRole("button", { name: new RegExp(`^${s} \\d`) })).toBeVisible();
  }

  await page.getByRole("button", { name: /Needs attention/ }).click();
  await expect(page.getByRole("button", { name: /Dermatology referral/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Dental cleaning/ })).toHaveCount(0);

  await page.getByRole("button", { name: /Dermatology referral/ }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByText("Where it stands")).toBeVisible();
  await expect(sheet.getByText(/Referral sent by Maple Grove/)).toBeVisible();
  await expect(sheet.getByText(/Call Brightwater Dermatology/)).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Send" })).toBeDisabled();
  await expect(sheet.getByText("Fictional demo. Not medical advice.")).toBeVisible();

  await sheet.getByRole("radio", { name: "Scheduled" }).click();
  await expect(sheet.getByRole("radio", { name: "Scheduled" })).toHaveAttribute("aria-checked", "true");
  await expect(sheet.getByText("You marked this as Scheduled")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.reload();
  await page.getByRole("button", { name: /^Scheduled \d/ }).click();
  await expect(page.getByRole("button", { name: /Dermatology referral/ })).toBeVisible();
});
