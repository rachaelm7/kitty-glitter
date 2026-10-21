import { expect, expectDemoNotice, noHorizontalScroll, test } from "./helpers";

const SCREENS = ["/", "/inbox", "/tasks", "/more", "/threads", "/threads/t-derm", "/capture", "/appointments", "/travel", "/home", "/finances", "/collections", "/settings", "/inbox/rescue"];

test("every screen shows the demo notice and fits the viewport", async ({ page }) => {
  for (const path of SCREENS) {
    await page.goto(path);
    await expectDemoNotice(page);
    await noHorizontalScroll(page);
  }
});

test("navigation moves between the four main screens", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: isMobile ? "Tabs" : "Main" });
  for (const [label, heading] of [
    ["Inbox", "Inbox"],
    ["Tasks", "Tasks"],
    ["More", "More"],
    ["Today", /Good (morning|afternoon|evening), Juniper/],
  ] as const) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
});

test("Today: brief, three linked priorities and previews", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/You have three things worth your attention today\. Your dental appointment needs confirmation/)).toBeVisible();
  const priorities = page.getByRole("region", { name: "Three priorities" });
  await expect(priorities.getByRole("checkbox")).toHaveCount(3);
  for (const name of ["Upcoming appointments", "Tasks needing attention", "Important email", "Life Threads"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }

  // A priority opens its email…
  await priorities.getByRole("button", { name: "Open email" }).first().click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Please confirm your cleaning on Thursday" })).toBeVisible();
  await page.keyboard.press("Escape");

  // …and its Life Thread.
  await page.goto("/");
  await priorities.getByRole("link", { name: "Dental cleaning" }).click();
  await expect(page).toHaveURL(/\/threads\/t-dental$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dental cleaning" })).toBeVisible();

  // Quick capture opens Brain dump.
  await page.goto("/");
  await page.getByRole("link", { name: "Quick capture" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Brain dump" })).toBeVisible();
});

test("Inbox: categories, accounts, search, read state, archive and newsletters", async ({ page }) => {
  await page.goto("/inbox");
  const tabs = page.getByRole("tablist", { name: "Category" });
  for (const t of ["All inboxes", "Needs action", "Personal", "Appointments", "Bills", "Receipts", "Promotions"]) {
    await expect(tabs.getByRole("tab", { name: new RegExp(`^${t}`) })).toBeVisible();
  }

  await tabs.getByRole("tab", { name: /^Appointments/ }).click();
  await expect(page.getByRole("button").filter({ hasText: /Please confirm your cleaning/ })).toBeVisible();
  await expect(page.getByRole("button").filter({ hasText: /Dinner Saturday/ })).toHaveCount(0);

  await tabs.getByRole("tab", { name: /^Bills/ }).click();
  await expect(page.getByRole("button").filter({ hasText: /Your statement is ready/ })).toBeVisible();

  await tabs.getByRole("tab", { name: /^Promotions/ }).click();
  await expect(page.getByRole("link", { name: "Preview cleanup" })).toBeVisible();

  await tabs.getByRole("tab", { name: /^All inboxes/ }).click();
  await page.getByRole("group", { name: "Filter by account" }).getByRole("button", { name: "Work" }).click();
  await expect(page.getByRole("button").filter({ hasText: /Q4 coverage plan/ })).toBeVisible();
  await expect(page.getByRole("button").filter({ hasText: /Dinner Saturday/ })).toHaveCount(0);
  await page.getByRole("group", { name: "Filter by account" }).getByRole("button", { name: "All accounts" }).click();

  await page.getByLabel("Search every account").fill("faucet");
  await expect(page.getByRole("button").filter({ hasText: /Estimate for your kitchen faucet/ })).toBeVisible();
  await expect(page.getByRole("button").filter({ hasText: /Dinner Saturday/ })).toHaveCount(0);
  await page.getByLabel("Search every account").fill("");

  // Opening marks read; detail shows summary, why it was sorted, deadline, editable draft with Send disabled.
  await page.getByRole("button").filter({ hasText: /Please confirm your cleaning/ }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByText("Summary", { exact: true })).toBeVisible();
  await expect(sheet.getByText(/Sorted as/)).toBeVisible();
  await expect(sheet.getByText("Confirm today", { exact: true })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Send" })).toBeDisabled();
  await sheet.getByRole("button", { name: "Mark unread" }).click();
  await expect(sheet.getByRole("button", { name: "Mark read" })).toBeVisible();

  // Simulated archive with undo, and the archived view.
  await sheet.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByRole("button").filter({ hasText: /Please confirm your cleaning/ })).toHaveCount(0);
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button").filter({ hasText: /Please confirm your cleaning/ })).toBeVisible();
  await page.getByRole("button", { name: "Archive: Up to 40% off ends tonight" }).click();
  await page.getByRole("button", { name: /View archived \(1\)/ }).click();
  await expect(page.getByRole("button").filter({ hasText: /Up to 40% off/ })).toBeVisible();
  await page.getByRole("button", { name: "Back to inbox", exact: true }).click();

  // Newsletters are grouped and expand.
  const group = page.getByRole("button", { name: /Newsletters/ });
  await expect(group).toHaveAttribute("aria-expanded", "false");
  await group.click();
  await expect(page.getByRole("button").filter({ hasText: /Five things to know today/ })).toBeVisible();
});

test("Tasks: views, add, edit details, complete, email and thread links", async ({ page }) => {
  await page.goto("/tasks");
  const views = page.getByRole("radiogroup", { name: "Show" });
  await expect(page.getByText("Confirm your dental appointment")).toBeVisible();

  await page.getByRole("textbox", { name: "New task" }).fill("Water the ferns");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("Water the ferns")).toBeVisible();

  await page.getByRole("button", { name: "Edit task: Water the ferns" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Title").fill("Water the ferns and the basil");
  await sheet.getByLabel("Category").selectOption("Home");
  await sheet.getByRole("radio", { name: "Waiting on" }).click();
  await sheet.getByLabel("Waiting on", { exact: true }).fill("the plant sitter");
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await views.getByRole("radio", { name: /Waiting/ }).click();
  await expect(page.getByText("Water the ferns and the basil")).toBeVisible();
  await expect(page.getByText("Waiting on the plant sitter")).toBeVisible();

  // Empty title is rejected.
  await page.getByRole("button", { name: "Add with details" }).click();
  await sheet.getByRole("button", { name: "Add task" }).click();
  await expect(sheet.getByText("Give the task a short title.")).toBeVisible();
  await page.keyboard.press("Escape");

  await views.getByRole("radio", { name: /Today/ }).click();
  await page.getByRole("checkbox", { name: /Mark done: Reply to Jamie/ }).click();
  await views.getByRole("radio", { name: /Done/ }).click();
  await expect(page.getByText("Reply to Jamie about Saturday")).toBeVisible();

  await views.getByRole("radio", { name: /Today/ }).click();
  await page.getByRole("button", { name: "Harbor Smiles Dental" }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: /Please confirm your cleaning/ })).toBeVisible();
});

test("Life Threads: list, detail timeline, next step, notes and done", async ({ page }) => {
  await page.goto("/threads");
  for (const name of ["Dental cleaning", "Auto insurance renewal", "Skin check follow-up", "Kitchen faucet repair", "Lamp return & refund", "Priya's birthday picnic", "Holiday trip to Lisbon"]) {
    await expect(page.getByRole("link", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeVisible();
  }
  await page.getByRole("link", { name: /Skin check follow-up/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Skin check follow-up" })).toBeVisible();
  await expect(page.getByText("Call Brightwater Dermatology to book").first()).toBeVisible();
  await expect(page.getByText(/Email from Maple Grove Family Clinic/)).toBeVisible();
  await expect(page.getByText("Waiting on", { exact: true })).toBeVisible();

  await page.getByLabel("Add a note").fill("Ask about a Saturday slot");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Note: Ask about a Saturday slot")).toBeVisible();

  await page.getByRole("button", { name: "Mark thread done" }).click();
  await expect(page.getByText("Wrapped up", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Open the task" }).waitFor({ state: "detached" });

  await page.goto("/threads/t-car");
  await expect(page.getByText("Harborline to send a higher-deductible quote", { exact: true })).toBeVisible();
});

test("More: navigation cards and settings theme switch", async ({ page }) => {
  await page.goto("/more");
  for (const name of ["Life Threads", "Appointments", "Travel", "Home", "Finances", "Personal Collections", "Settings"]) {
    await expect(page.getByRole("main").getByRole("link", { name: new RegExp(name) }).first()).toBeVisible();
  }
  await page.getByRole("main").getByRole("link", { name: /Settings/ }).first().click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Auto" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
});

test("Only fictional example.com addresses appear in the rendered app", async ({ page }) => {
  for (const path of ["/", "/inbox", "/tasks", "/threads", "/settings"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    const emails = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    for (const e of emails) expect(e).toMatch(/@example\.com$/);
  }
});
