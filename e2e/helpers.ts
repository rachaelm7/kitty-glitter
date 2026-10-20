import { expect, test as base, type Page } from "@playwright/test";

/** Every test starts from the fictional sample data (cleared once per tab, kept across reloads). */
export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("kg-test")) {
        localStorage.clear();
        sessionStorage.setItem("kg-test", "1");
      }
    });
    await run(page);
  },
});

export { expect };

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

export async function expectDemoNotice(page: Page) {
  await expect(page.getByRole("note", { name: "Demo mode: fictional data" })).toBeVisible();
}
