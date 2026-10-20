import { chromium } from "@playwright/test";
const out = process.argv[2]; const pages = process.argv[3].split(",");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, opts] of [["m375", { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ["d1280", { viewport: { width: 1280, height: 860 } }]]) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ ...opts, colorScheme: scheme });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto("http://localhost:3100" + p, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${name}-${scheme}${p.replace(/\//g, "_") || "_"}.png`, fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
