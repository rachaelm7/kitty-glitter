# 0004: Saved dates move with the calendar

- **Date:** 2026-10-21
- **Status:** Accepted

## Context
Sample data stores dates as day offsets from "today" (`dayOffset`, `startOffset`, `statusSince` and so on), so the demo always looks current. Once you changed anything, the whole list was saved to `localStorage` with those offsets frozen. An appointment saved as "in 2 days" still said "in 2 days" a week later, and a referral's waiting time never grew. Adding create and edit forms for appointments and trips would have made this much more visible.

## Decision
`createStore` takes an optional `shift(state, days)` function. Stores that use it save `{ savedOn: "YYYY-MM-DD", state }`, where `savedOn` is the day the offsets in memory count from (the day they were loaded, so a tab left open past midnight doesn't slip a day). On load, offsets are moved by the number of whole days since `savedOn`, counted on local calendar dates so daylight saving can't skew it. Saves from before this change (with no `savedOn`) load as they are.

Only items you **created or changed** move (`shiftChanged`). A saved item that is still identical to its sample is left alone, so it stays relative to today, like the sample emails and bills it links to. Otherwise, editing one task would age every sample task while their linked emails stayed fresh, and they'd drift apart. The stores for tasks, Life Threads, Home upkeep, appointments and trips use it.

Forms keep working in offsets: a date picked in a form becomes an offset from today, and the store keeps it current from then on.

## Consequences
- Everything you add or change keeps its real date across days, and sample data you haven't touched still looks fresh and consistent with the sample emails.
- A sample item you edit starts ageing from that day, while the sample email it came from stays fresh. That's an honest result of editing it, and it only affects demo data.
- Each store with offsets must list them in its `shift` function. A new offset field that's left out would freeze again. The unit tests cover the shared logic, and an end-to-end test loads a save from two days ago.
- When real data sources arrive (Supabase, Gmail), they'll store absolute dates, and this layer only applies to the demo's local state.
