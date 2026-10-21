import { expect, test } from "./helpers";

async function openSearch(page: import("@playwright/test").Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Search everything" }).first().click();
  else await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeVisible();
  await expect(page.getByRole("combobox")).toBeFocused();
}

test("search finds one situation across emails, tasks, threads and appointments", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("dental");
  const list = page.getByRole("listbox", { name: "Results" });
  for (const kind of ["Life Thread", "Email", "Task", "Appointment"]) {
    await expect(list.getByRole("option").filter({ hasText: kind }).first()).toBeVisible();
  }
  await expect(page.getByRole("dialog", { name: "Search everything" }).getByRole("status")).toContainText("results");
});

test("opening an email result opens that email in the Inbox", async ({ page, isMobile }) => {
  await page.goto("/tasks");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("faucet estimate");
  await page.getByRole("option", { name: /Estimate for your kitchen faucet/ }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Estimate for your kitchen faucet" })).toBeVisible();
});

test("keyboard: arrows move, Enter opens a task in its editor, Escape closes", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("furnace");
  const options = page.getByRole("option");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("combobox")).toHaveAttribute("aria-activedescendant", /.+/);
  await page.keyboard.press("ArrowUp");
  await expect(options.first()).toHaveAttribute("aria-selected", "true"); // ArrowUp really moved back
  await page.getByRole("combobox").fill("replace the furnace");
  await expect(options.first()).toContainText("Replace the furnace filter");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("dialog").getByLabel("Title")).toHaveValue("Replace the furnace filter");
  await page.keyboard.press("Escape");

  await openSearch(page, isMobile);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeHidden();
});

test("a page, an empty search, and a search with no matches", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  // Nothing typed: quick links.
  await expect(page.getByText("Quick links")).toBeVisible();
  await page.getByRole("combobox").fill("settings");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings$/);

  await openSearch(page, isMobile);
  // Recent now leads with what we opened.
  await expect(page.getByText("Recent and quick links")).toBeVisible();
  await expect(page.getByRole("option").first()).toContainText("Settings");
  await page.getByRole("combobox").fill("zzzzqq");
  await expect(page.getByText(/No matches for/)).toBeVisible();
});

test("the typed text is never stored, only opened results", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("private-looking words");
  await page.keyboard.press("Escape");
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(stored).not.toContain("private-looking");
});

test("opening an email or task while already on that page still opens it", async ({ page, isMobile }) => {
  await page.goto("/inbox");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("estimate for your kitchen");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Estimate for your kitchen faucet" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/tasks");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("approve the faucet");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog").getByLabel("Title")).toHaveValue("Approve the faucet repair estimate");
});

test("arrows wrap around, Enter does nothing with no results, and each open starts fresh", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  const options = page.getByRole("option");
  const count = await options.count();
  await page.keyboard.press("ArrowUp"); // first → last
  await expect(options.nth(count - 1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown"); // last → first
  await expect(options.first()).toHaveAttribute("aria-selected", "true");

  await page.getByRole("combobox").fill("zzzzqq");
  await expect(page.getByRole("combobox")).toHaveAttribute("aria-expanded", "false"); // no list, so not "expanded"
  await expect(page.getByRole("combobox")).not.toHaveAttribute("aria-controls", /.+/);
  const url = page.url();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeVisible();

  await page.keyboard.press("Escape");
  await openSearch(page, isMobile);
  await expect(page.getByRole("combobox")).toHaveValue(""); // not the old query
  await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
});

test("clicking the backdrop closes the dialog and focus goes back to where you were", async ({ page, isMobile }) => {
  await page.goto("/tasks");
  const trigger = isMobile ? page.getByRole("button", { name: "Search everything" }).first() : page.getByRole("textbox", { name: "New task" });
  await trigger.focus();
  if (isMobile) await trigger.click();
  else await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeVisible();
  await page.mouse.click(4, 4); // outside the panel: the backdrop
  await expect(page.getByRole("dialog", { name: "Search everything" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("only ids of opened results are remembered, never what was typed", async ({ page, isMobile }) => {
  await page.goto("/");
  await openSearch(page, isMobile);
  await page.getByRole("combobox").fill("private-looking furnace");
  await page.getByRole("combobox").fill("replace the furnace");
  await page.keyboard.press("Enter"); // opens a result, which is remembered
  await expect(page).toHaveURL(/\/tasks$/);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(stored).toContain("task:k12");
  expect(stored).not.toContain("private-looking");
  expect(stored).not.toContain("replace the furnace");
});

test("the demo banner stays on one line next to the search button on a small phone", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout");
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  const note = page.getByRole("note", { name: "Demo mode: fictional data" });
  await expect(note).toBeVisible();
  const { bannerHeight, textHeight, buttonWidth } = await page.evaluate(() => {
    const n = document.querySelector('[role="note"]')!;
    return { bannerHeight: n.getBoundingClientRect().height, textHeight: n.querySelector("p")!.getBoundingClientRect().height, buttonWidth: n.querySelector("button")!.getBoundingClientRect().width };
  });
  expect(textHeight).toBeLessThan(20); // one line
  expect(bannerHeight).toBeLessThan(40);
  expect(buttonWidth).toBeGreaterThanOrEqual(44); // a comfortable tap target
});
