import { expect, test } from "./helpers";

/** A local YYYY-MM-DD this many days from today, as a date input wants it. */
function isoIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

test("appointments: add with validation, edit, delete and undo", async ({ page }) => {
  await page.goto("/appointments");
  await page.getByRole("button", { name: "New appointment" }).click();
  const sheet = page.getByRole("dialog", { name: "New appointment" });

  // A scheduled appointment needs a name, an office and a date.
  await sheet.getByLabel("Where it stands").selectOption({ label: "Scheduled" });
  await sheet.getByRole("button", { name: "Add appointment" }).click();
  await expect(sheet.getByText("Give it a short name")).toBeVisible();
  await expect(sheet.getByLabel("What is it?")).toBeFocused();
  await expect(sheet.getByText("Scheduled appointments need a date")).toBeVisible();

  await sheet.getByLabel("What is it?").fill("Hearing test");
  await sheet.getByLabel("Office or provider").fill("Willow Audiology");
  await sheet.getByLabel("Date").fill(isoIn(1));
  await sheet.getByLabel("Time").fill("9:15 AM");
  await sheet.getByRole("button", { name: "Add appointment" }).click();

  // Saving opens its details, with next steps worked out from the date.
  const detail = page.getByRole("dialog", { name: "Hearing test" });
  await expect(detail.getByText(/Coming up in 1 day/)).toBeVisible();
  await detail.getByRole("button", { name: "Edit details" }).click();
  const edit = page.getByRole("dialog", { name: "Hearing test" });
  await expect(edit.getByLabel("Date")).toHaveValue(isoIn(1));
  await edit.getByLabel("What is it?").fill("Hearing check");
  await edit.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog", { name: "Hearing check" }).getByRole("heading", { name: "Hearing check" })).toBeVisible();
  await page.keyboard.press("Escape");

  const card = page.getByRole("button", { name: /Hearing check/ });
  await expect(card).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible(); // kept on this device

  await card.click();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(card).toHaveCount(0);
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(card).toBeVisible();
});

test("travel: create a trip, add and edit a booking", async ({ page }) => {
  await page.goto("/travel");
  await page.getByRole("button", { name: "New trip" }).click();
  const sheet = page.getByRole("dialog", { name: "New trip" });
  await sheet.getByLabel("Nights away").fill("2.5");
  await sheet.getByRole("button", { name: "Add trip" }).click();
  await expect(sheet.getByText("Give the trip a name")).toBeVisible();
  await expect(sheet.getByText(/whole number of nights/)).toBeVisible();

  await sheet.getByLabel("Trip name").fill("Autumn in Kyoto");
  await sheet.getByLabel("Destination").fill("Kyoto, Japan");
  await sheet.getByLabel("Leaving on").fill(isoIn(10));
  await sheet.getByLabel("Nights away").fill("4");
  await expect(sheet.getByText(/^Back /)).toBeVisible();
  await sheet.getByRole("button", { name: "Add trip" }).click();

  await expect(page.getByRole("heading", { name: "Autumn in Kyoto" })).toBeVisible();
  await expect(page.getByText("Leaves in 10 days")).toBeVisible();
  await expect(page.getByRole("button", { name: "Autumn in Kyoto", pressed: true })).toBeVisible();
  await expect(page.getByText("ID or passport", { exact: true })).toBeVisible(); // starter packing list
  await expect(page.getByText("Still to pack: ID or passport, booking confirmations.")).toBeVisible();
  await expect(page.getByText(/No bookings yet/)).toBeVisible();

  await page.getByRole("button", { name: "Add booking" }).click();
  const res = page.getByRole("dialog", { name: "Add a booking" });
  await res.getByLabel("Day").selectOption({ index: 1 });
  await res.getByLabel("Name").fill("Hotel Sakura");
  await res.getByLabel("Confirmation code").fill("HS-2210");
  await res.getByRole("button", { name: "Add booking" }).click();
  await expect(page.getByText("Day 2 ·")).toBeVisible();
  await expect(page.getByText("HS-2210")).toBeVisible();

  await page.getByRole("button", { name: "Edit booking: Hotel Sakura" }).click();
  const editRes = page.getByRole("dialog", { name: "Edit booking" });
  await editRes.getByLabel("Name").fill("Hotel Sakura, garden room");
  await editRes.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Hotel Sakura, garden room")).toBeVisible();

  // Shortening the trip keeps bookings (they move to the last day rather than vanish).
  await page.getByRole("button", { name: "Edit trip" }).click();
  await page.getByRole("dialog", { name: "Edit trip" }).getByLabel("Nights away").fill("0");
  await page.getByRole("dialog", { name: "Edit trip" }).getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Hotel Sakura, garden room")).toBeVisible();
});

test("saved dates move forward with the calendar", async ({ page }) => {
  await page.goto("/appointments");
  // Pretend the sample appointments were saved two days ago, when the dental cleaning was "in 2 days".
  await page.evaluate((savedOn) => {
    localStorage.setItem(
      "kg:appointments:v1",
      JSON.stringify({
        savedOn,
        state: [
          {
            id: "apx", title: "Dental cleaning", kind: "visit", provider: "Harbor Smiles Dental", contact: "", status: "scheduled", statusSince: -20,
            when: { dayOffset: 2, time: "3:30 PM", place: "Harbor Smiles Dental" }, events: [],
          },
        ],
      }),
    );
  }, isoIn(-2));
  await page.reload();
  await page.getByRole("button", { name: /Dental cleaning/ }).click();
  await expect(page.getByRole("dialog").getByText(/Coming up today/)).toBeVisible();
});

test("brain dump understands repeats and waiting on others", async ({ page }) => {
  await page.goto("/capture");
  await page
    .getByRole("textbox", { name: "Brain dump" })
    .fill("Remind me every Sunday to water the plants. Still waiting on the plumber to send a quote. Buy stamps");
  await page.getByRole("button", { name: "Sort it out" }).click();

  const titles = page.getByLabel("Title");
  await expect(titles).toHaveCount(3);
  await expect(titles.nth(0)).toHaveValue("Water the plants");
  await expect(page.getByLabel("Repeats").nth(0)).toHaveValue("7");
  await expect(page.getByText("from “every sunday”")).toBeVisible();
  await expect(titles.nth(1)).toHaveValue("The plumber to send a quote");
  await expect(page.getByLabel("Waiting on")).toHaveValue("the plumber");

  // Mark "Buy stamps" as waiting too, then change your mind.
  await page.getByRole("button", { name: "Waiting on someone?" }).click();
  await expect(page.getByLabel("Waiting on")).toHaveCount(2);
  await page.getByRole("button", { name: "Not waiting" }).nth(1).click();

  await page.getByRole("button", { name: "Add 3 items" }).click();
  await expect(page.getByText(/Including 1 waiting on someone else and 1 repeating/)).toBeVisible();

  await page.getByRole("link", { name: "Open Tasks" }).click();
  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: /Waiting/ }).click();
  await expect(page.getByText("The plumber to send a quote")).toBeVisible();
  await expect(page.getByText("Waiting on the plumber")).toBeVisible();
});

test("search: actions, filters and opening a trip directly", async ({ page, isMobile }) => {
  await page.goto("/");
  const box = page.getByRole("combobox", { name: /^Search emails/ });
  const open = async () => {
    if (isMobile) await page.getByRole("button", { name: "Search everything" }).first().click();
    else await page.keyboard.press("Control+k");
    await expect(box).toBeFocused();
  };

  // ">" lists actions; Enter opens the new appointment form on its own screen.
  await open();
  await box.fill(">");
  await expect(page.getByRole("button", { name: "Actions", pressed: true })).toBeVisible();
  await expect(page.getByRole("option").first()).toContainText("New task");
  await box.fill("> appointment");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/appointments$/);
  await expect(page.getByRole("dialog", { name: "New appointment" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "New appointment" })).toBeHidden();

  // A filter chip limits results to one kind.
  await open();
  await box.fill("dental");
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  const options = page.getByRole("option");
  await expect(options.first()).toBeVisible();
  for (const text of await options.allTextContents()) expect(text).toMatch(/Task$/);
  await expect(box).toBeFocused();

  // "#trip" with nothing else lists trips; choosing one opens that trip, not just the page.
  await box.fill("#trip");
  await page.getByRole("option", { name: /Lake cabin weekend/ }).click();
  await expect(page).toHaveURL(/\/travel$/);
  await expect(page.getByRole("heading", { name: "Lake cabin weekend" })).toBeVisible();

  // Theme actions apply at once.
  await open();
  await box.fill("> dark");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("status").filter({ hasText: "Dark theme on" })).toBeVisible();
});
