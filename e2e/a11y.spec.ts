import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/inbox", "/inbox/cleanup", "/inbox/rescue", "/tasks", "/more", "/more/states", "/settings", "/capture", "/threads", "/threads/t-derm", "/appointments", "/travel", "/home", "/finances", "/collections"];

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

for (const scheme of ["light", "dark"] as const) {
  test(`the open search dialog has no WCAG A/AA violations (${scheme})`, async ({ page, isMobile }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Search everything" }).first().click();
    else await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("dental");
    await page.getByRole("option").first().waitFor();
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`the new appointment, trip and booking forms have no WCAG A/AA violations, errors showing (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    const check = async () => {
      const results = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
    };
    await page.goto("/appointments");
    await page.getByRole("button", { name: "New appointment" }).click();
    await page.getByRole("button", { name: "Add appointment" }).click();
    await check();
    await page.keyboard.press("Escape");

    await page.goto("/travel");
    await page.getByRole("button", { name: "New trip" }).first().click();
    await page.getByRole("button", { name: "Add trip" }).click();
    await check();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Add booking" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Add booking" }).click();
    await check();
  });
}

test("reduced motion turns animations off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.locator(".animate-rise").first().evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.01);
});
