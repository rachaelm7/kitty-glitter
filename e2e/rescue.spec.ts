import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("kg-test")) {
      localStorage.clear();
      sessionStorage.setItem("kg-test", "1");
    }
  });
});

test("Email Rescue Mode: protected mail, piles, preview, review, simulated confirm", async ({ page }) => {
  await page.goto("/inbox");
  await page.getByRole("link", { name: /Try Rescue Mode/ }).click();
  await expect(page.getByRole("heading", { name: "Rescue Mode" })).toBeVisible();
  await expect(page.getByText("510", { exact: true })).toBeVisible();
  await expect(page.getByText(/important emails are protected/)).toBeVisible();

  await page.getByRole("button", { name: "See them" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: "Protected emails" })).toBeVisible();
  await expect(sheet.getByText("Bill or payment").first()).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Start sorting" }).click();
  await page.getByRole("radiogroup", { name: "Action for Receipts" }).getByRole("radio", { name: "Leave" }).click();
  await page.getByRole("button", { name: "Preview" }).first().click();
  await expect(sheet.getByText(/Preview only: nothing changes/)).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Review plan" }).click();
  await expect(page.getByText("Untouched")).toBeVisible();
  await page.getByRole("button", { name: "Confirm (simulated)" }).click();
  await expect(page.getByText("No real emails were changed")).toBeVisible();
});
