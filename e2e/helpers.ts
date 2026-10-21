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

/**
 * Content must fit the device width. Compare against clientWidth (the device
 * width), not innerWidth: on mobile, innerWidth grows to match overflowing
 * content and the browser zooms out, which would hide the problem.
 */
export async function noHorizontalScroll(page: Page) {
  const { overflow, offenders } = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > width + 1)
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 50)}`);
    return { overflow: document.documentElement.scrollWidth - width, offenders };
  });
  expect(overflow, `wider than the screen: ${offenders.join(" | ")}`).toBeLessThanOrEqual(1);
}

export async function expectDemoNotice(page: Page) {
  await expect(page.getByRole("note", { name: "Demo mode: fictional data" })).toBeVisible();
}
