import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/inbox", "/inbox/cleanup", "/inbox/rescue", "/tasks", "/more", "/more/states", "/capture", "/threads", "/appointments", "/travel", "/home"];

for (const scheme of ["light", "dark"] as const) {
  test.describe(`accessibility (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    for (const path of PAGES) {
      test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Let entrance animations finish so contrast is measured at full opacity.
        await page.waitForTimeout(600);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target.join(" ")} | ${v.nodes[0]?.failureSummary?.split("\n")[1] ?? ""}`);
        expect(summary).toEqual([]);
      });
    }
  });
}

test("reduced motion turns animations off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.locator(".animate-rise").first().evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.01);
});
