# AI development status

Living log of what Claude Code has built, how it was checked, and what is still open.
Newest increment first. Updated in every PR.

## Latest session: the next three improvements (branch `claude/next-three`)

### What improved
1. **Inbox swipe actions and keyboard shortcuts.**
   - **Touch:** swipe a row right to mark read/unread, left to archive (simulated, with Undo). It's touch and pen only, so mouse users keep normal text selection. Vertical scrolling is untouched, and a short or slow swipe does nothing. The row's regular buttons remain the accessible route to the same actions.
   - **Desktop:** J/K (or arrows) move a visible selection, Enter opens, **E** archives (the selection moves to the neighbouring message), **U** toggles read, **/** jumps to search. Shortcuts are ignored while you type or when a sheet is open.
2. **Recurring tasks shared with Home upkeep.**
   - Any task can **repeat** (weekly to yearly) from its details. Finishing it adds the next one, due that many days *after you finished*, and Undo takes it back, so there's never a duplicate.
   - Furnace filter, smoke detectors and gutters are **linked** to Home upkeep. Finishing the task updates Home, and **Mark done on Home** completes the task and schedules the next one. Home's due dates are now date-based, so they no longer drift between days, and they're derived from your tasks: reopen a task and Home reverts by itself.
3. **"Since yesterday" and live thread next steps.**
   - A Today card (and a line in the brief) lists what changed: new mail that needs you, thread and appointment updates, tasks you finished, and what you're waiting on. Each line opens its email or thread, and nothing is invented.
   - A Life Thread's **next step and "waiting on" now follow its tasks.** Finish the written step and it moves to the next open task. With none left it says "All caught up" and offers to wrap the thread up. Waiting follows waiting tasks.

### What was tested (all run in this session)
- Lint, typecheck and production build: pass.
- Unit tests (Vitest): **79 passing.** New ones cover the swipe rules, keyboard focus, recurrence (no duplicates after undo), Home sharing state with tasks, the change builder, and thread next-step derivation.
- End-to-end (Playwright, iPhone 13 and 1280px desktop, CI settings): **123 passing, 3 skipped by design** (touch-only tests skip on desktop, keyboard tests skip on phones). New flows: real touch swipes (and that vertical scroll isn't hijacked), every keyboard shortcut, repeat → complete → next appears → Home agrees → undo, Mark done from Home, set-repeat-from-details, Since yesterday lines opening their sources, next step advancing then offering to wrap up, and waiting following waiting tasks. The axe WCAG 2.1 A/AA checks on all 16 screens still pass.
- Screenshots reviewed at iPhone size, including mid-swipe.

### Known gaps
- Swipe has no haptics on iPhone (Safari doesn't expose vibration); it vibrates on Android only.
- "Since yesterday" looks back one day from sample data (relative offsets), so it's fixed for the demo rather than tracking real history.
- A repeating task's rule can be edited, but changing a *linked* task's repeat doesn't change the Home schedule's interval.

### Next three highest-value improvements
1. **Global search and a quick switcher** (⌘K / a search button on phones) across emails, tasks, threads and appointments, with recent items and jump-to.
2. **Create and edit appointments and trips** (add a referral, move a booking, mark results received) so those sections aren't read-only demos, linked to Life Threads and to Tasks.
3. **Smarter Brain Dump:** understand repeats ("every month") and waiting ("waiting on Dana to reply") so captured thoughts become repeating or Waiting-on tasks, still reviewed before anything is added.

## Latest session: Kitty Glitter v2 (branch `claude/kitty-glitter-v2`)
One PR to `main` that contains everything (it builds on #1–#7, so merging it alone is enough).

### What improved
- **Rules:** `CLAUDE.md` now opens with the autonomy rule (never ask the owner to do what Claude can do) and the continuous-improvement rule, backed by `.claude/skills/continuous-improvement/SKILL.md`.
- **Privacy:**
  - The owner's real name is removed from the app, docs and the preserved prototype. The demo persona is **Juniper**.
  - Every fictional email address is now `@example.com`, enforced by a unit test and an e2e test.
  - **DEMO MODE — FICTIONAL DATA** is on every screen.
- **Design system:** warm ivory and pearl, dusty rose, muted lavender, soft champagne, charcoal text, soft shadows, rounded cards, and a cat-and-sparkle mark (new PWA icons too). Every token pair is checked for AA contrast.
- **Today:**
  - The morning brief reads like the approved example.
  - **Three priorities**, each linking to its email and Life Thread.
  - Upcoming appointments, tasks needing attention, an important-email preview and a Life Threads preview.
  - **Quick capture** button. Cards can still be customized.
- **Inbox Command Center:**
  - Category tabs: All inboxes, Needs action, Personal, Appointments, Bills, Receipts, Promotions, with unread counts.
  - Account chips and search that also matches sender addresses.
  - Read/unread state (opening marks read; mark unread in the sheet).
  - **Simulated archive with Undo** and an Archived view.
  - Grouped newsletters, "why it was sorted this way", and a bulk cleanup preview on Promotions.
  - **Make a task** from an email, linked back to it.
- **Tasks:**
  - **Today, Upcoming, Waiting on and Completed** views, with category filters.
  - Add quickly or with details, plus an **edit sheet** (title, status, waiting on, category, due date, Life Thread, notes, delete with Undo).
  - Overdue and due tags, and links to the source email and thread. Everything persists on the device.
- **Life Threads, the signature feature:**
  - Seven fictional situations: a dental confirmation, an insurance renewal, a medical referral follow-up, a home repair, a purchase return, a social event and a holiday trip.
  - Each has a **detail page** with status, Next step (opens the right email or task), Waiting on, a merged **timeline** (so far / coming up), emails, tasks, appointments, trip, notes, and Mark done / Reopen.
- **More:**
  - Navigation cards with live previews: Life Threads, Appointments, Travel, Home, **Finances** (preview), **Personal Collections** (preview) and **Settings**.
  - Settings holds theme, accounts and demo reset.
- **Quick Capture:** "I need to schedule my dentist appointment, order cat food, and check on the insurance renewal." becomes three reviewable tasks with no invented dates. It also suggests the matching threads and categories.

### What was tested (all run in this session)
- Lint, typecheck and production build: pass.
- Unit tests (Vitest): **51 passing.**
- End-to-end (Playwright, iPhone 13 and 1280px desktop): **106 passing.** That covers:
  - the demo notice and no horizontal scroll on 14 screens
  - tab navigation
  - Today links into email, thread and capture
  - every Inbox interaction
  - task add, edit, validation, complete and email link
  - Life Thread detail, notes and done
  - More, and Settings theme persistence
  - an example.com-only scan of the rendered text
  - capture, appointments, rescue, travel/home and polish flows
  - axe WCAG 2.1 A/AA on 16 screens in light and dark
- Screenshots reviewed at 375px and 1280px in light and dark mode.

### Fixed after the first CI run
- **More overflowed on iPhone:** the "Also here" rows were 20px wider than the screen, so the page zoomed out and the tab bar became hard to tap. Fixed, and the no-horizontal-scroll test now measures the real device width: the old check compared against `innerWidth`, which grows with the overflow, so it couldn't catch this.
- **Past agenda items and completed tasks failed contrast** (they were faded with opacity). They now use the muted text colour. This only showed up after mid-morning, which is why the first runs passed.

### Next three highest-value improvements (all three built in the session above)
1. **Swipe actions on Inbox rows** (archive / mark read) with haptic-style feedback on iPhone, plus keyboard shortcuts on desktop.
2. **Recurring tasks and reminders** (for example "every 90 days" for the furnace filter), shared with Home upkeep so Mark done in one place updates the other.
3. **A smarter brief and Life Thread "what changed"**: show what moved since yesterday (new emails in a thread, replies you're waiting on) and let the next step update when its task is done.

## Where things stand (end of the secondary queue)
PRs #1–#7 hold the earlier increments; the v2 PR contains all of them plus this session. **Nothing is merged or deployed.**

Needs the owner's authorization or action:
1. Review and merge the **v2 PR** into `main` (or merge #1 → #7 in order, then v2).
2. To see it on your phone: connect the repo to Vercel. Previews will then appear on each PR. Claude can't do this from here.
3. For the `claude-ready` automation: add the `CLAUDE_CODE_OAUTH_TOKEN` secret and create the `claude-ready` label (see `docs/AUTOMATION.md`).

Not done yet: manual testing on a real iPhone (install to Home Screen, offline, VoiceOver), and the later phases (Supabase login, read-only Gmail, real AI), which are out of scope for this demo.

## Review status: read this first
- **External review:** none yet. No autonomous ChatGPT reviewer is connected to this repository, so **no change here has been approved by ChatGPT**. Anything listed as "reviewed" below means Claude's own self-review unless it names a person.
- **Self-review:** Claude runs lint, typecheck, unit tests (Vitest), end-to-end tests (Playwright, at iPhone 13 and 1280px desktop sizes), a production build, and looks at screenshots in light and dark mode before opening a PR.
- **Approval:** only the owner merges. Nothing is deployed automatically.

## Branch and PR map
PRs are stacked because each builds on the last. Merge them in order; GitHub retargets the next PR automatically when its base branch is merged and deleted.

| # | Branch | Builds on | Contents | State |
|---|---|---|---|---|
| 1 | `claude/life-hub-phase-1-27ixfq` | `main` | Docs, prototype, Claude GitHub Actions | PR #1 open |
| 2 | `claude/app-foundation` | #1 | Next.js PWA: Today, Inbox, Cleanup, Tasks, More | PR #2 open |
| 3 | `claude/brain-dump` | #2 | Brain Dump, Life Threads | PR #3 open |
| 4 | `claude/appointment-concierge` | #3 | Appointment Concierge | PR #4 open |
| 5 | `claude/email-rescue` | #4 | Email Rescue Mode | PR #5 open |
| 6 | `claude/travel-home` | #5 | Travel & Home dashboards | PR #6 open |
| 7 | `claude/ui-polish` | #6 | Widgets, states, motion, accessibility | PR open |

## Increments

### Priority 5: UI/UX polish
**Branch:** `claude/ui-polish`

Built
- **Customizable Today:** Today is now made of 10 widgets: brief, Needs you, appointments, agenda, coming up, unread, promotions, next trip, home upkeep, and quick capture. **Customize** lets you show, hide and reorder them (switches plus up/down buttons, so it works with keyboard and VoiceOver, not just dragging). The layout is saved on the device and copes with widgets added later.
- **Containment:** every widget sits inside an error boundary, so one failing widget shows a calm "couldn't load" card with **Try again** and the rest of Today keeps working.
- **States:** app-wide error page, friendly not-found page, route loading skeleton, a **simulated "Check for new mail"** on Inbox with a skeleton (nothing is fetched), and a **State gallery** (More → For design review) showing every empty, loading and error state, including a live contained widget failure.
- **Motion and delight:** staggered card entrance, check "pop", sheet slide-up, and an **"All clear. Nicely done."** moment when every Needs you item is done. All of it is off under reduced motion, and a test checks that.
- **Accessibility:** automated **axe WCAG 2.1 A/AA** checks on all 12 screens, in light and dark, at iPhone and desktop sizes. The checks found real contrast failures, which are fixed: the light-mode teal accent was darkened slightly (`#2b7a74` → `#24706a`), and two small text spots on the teal cards were adjusted. The loading skeleton also got a proper status role.

Tests
- Unit: 4 layout tests (default hidden, move with edge stops, toggle, and tolerance of old saved layouts).
- End-to-end: customize, persist and reorder; the all-clear moment; the inbox loading state; a contained widget failure; not-found; plus **48 accessibility runs** and 2 reduced-motion runs.

Known gaps
- Reordering uses buttons; there's no drag-and-drop yet (buttons are the accessible baseline).
- Accessibility checks are automated only. A manual VoiceOver pass on a real iPhone is still needed.


### Priority 4: Travel & Home, connected by Life Threads
**Branch:** `claude/travel-home`

Built
- **Travel** (`/travel`): two fictional trips. The Lisbon getaway has a header with dates and a countdown, a day-by-day **itinerary** of reservations (flights, stay, activity, dinner, train) with made-up confirmation codes, and a **packing list** grouped by type with progress, check-off and add item. It also shows **trip tasks** from the Lisbon Life Thread, plus reminders drawn only from the trip's own data (for example, documents not yet packed).
- **Home** (`/home`): a **maintenance** schedule where the next due date is worked out from "every N days" and "last done", shown as Overdue / Due soon / On track, with **Mark done**. Also **insurance and warranty** reminders (auto and renters insurance, dishwasher and laptop warranties) with renewal or end dates, and **home tasks** from the Home upkeep thread.
- **Life Threads** now also gather trips (bookings and packing %), home upkeep, and insurance and warranties. Thread tags on Travel and Home link straight to the right thread.
- Each is its own module (`modules/travel`, `modules/home`) with a public `index.ts`, so either can change without touching the other.

Tests
- Unit: 7 tests (packing progress and grouping, itinerary only from booked days, reminders never invent deadlines, next-due maths, ordering, coverage window).
- End-to-end: Travel packing (check and add) and the thread link; Home overdue → Mark done → On track, plus insurance renewals. Both run at both sizes.

Known gaps
- You can't create or edit trips, bookings, maintenance items or policies yet. Packing and Mark done are the only edits.
- "Mark done" sets "last done" to today, with no history yet.


### Priority 3: Email Rescue Mode
**Branch:** `claude/email-rescue`

Built
- **Rescue Mode** (`/inbox/rescue`, plus a prompt at the top of Inbox when there are 100+ unread): a four-step flow (Overview → Sort piles → Review → Done) through a generated, fictional pile of **510 unread** emails. That matches the unread counts on Today, and the pile includes newsletters, promotions, receipts, notifications, social updates, personal mail, bills, appointments and security alerts.
- **Important-email protection is the core rule.** Bills, appointments, security alerts, mail from people you know, and anything with a deadline (such as receipts with an open return window) are pulled out first and **never included in any bulk action**. They're shown with the reason each one is protected.
- **Piles** (Promotions, Newsletters, Notifications, Social, Receipts) each have a safe default (archive promotions, mark the rest read) that you can change to Mark read, Archive or Leave. **Preview** lists the senders and recent messages, and says how many similar emails were kept out because they look important.
- **Review** shows the plan, the protected count marked "Untouched", and a before/after unread meter. **Confirm is simulated** and says that no real emails changed. Start over resets the plan.

Tests
- Unit: 5 tests (the generator is deterministic and matches the account totals, all requested kinds are present, **protected mail never appears in a pile**, the protection rules cover every important kind, and the plan totals add up with protected mail left untouched).
- End-to-end: the full flow, including the protected sheet, a pile action change, preview and simulated confirm, at both sizes.

Known gaps
- The piles act per pile, not per sender. Per-sender choices live in the existing Cleanup flow.
- Protection rules are simple keyword and category rules on fictional data. Real mail would need careful tuning and a way to mark a sender as always important.


### Priority 2: Appointment Concierge
**Branch:** `claude/appointment-concierge`

Built
- **Appointments** (`/appointments`): six fictional referrals, visits and tests, one in each status: Needs Scheduling, Scheduled, Waiting on Office, Results Pending, Follow-Up Needed and Completed.
- Filter chips with counts, plus **Needs attention**. Cards show a six-step progress bar and the next step.
- **Detail sheet:** a vertical status stepper, suggested next steps, a dated event timeline, **Update status** (your own tracker only; the change is logged in the timeline), and an editable draft to the office with Copy (**Send disabled**).
- **Next steps are rules about scheduling and paperwork only** (call to book, follow up after five quiet days, ask how results are shared, book the follow-up). They never comment on symptoms, results or treatment.
- **"Fictional demo. Not medical advice."** appears on the screen and in every sheet. Providers are made up, and phone numbers use the reserved fictional 555-01xx range.
- Appointments appear in the **Health appointments** Life Thread.
- Urgency is kept calm: rose is used only for the items that really need attention, as a left border and label.

Tests
- Unit: 5 tests (attention rules, completed has no actions, all six statuses covered, **no clinical wording in any suggestion or draft for any status**, fictional phone numbers only).
- End-to-end: statuses, filter, sheet, disclaimer, disabled Send, a status update that persists across reload, at both sizes.

Known gaps
- You can't add or edit appointments yet. Status changes are the only edits.
- Not yet shown on Today; planned as a Today widget in Priority 5.


### Priority 1: Brain Dump / Quick Capture, and Life Threads
**Branch:** `claude/brain-dump`

Built
- **Brain dump** (`/capture`): write freely, or use a **simulated** voice note that "transcribes" one of three fictional recordings word by word. The microphone is never used, and the sheet says so. The draft is kept if you leave the screen.
- **Sort it out**: a rule-based parser that runs on the device, with no AI and no network. It splits the text into thoughts and suggests a Task, Reminder or Thread note for each. It also suggests a Life Thread from keywords.
- **Review screen**: nothing is added until you press **Add**. For each suggestion you can switch it off, edit the title, change its type, pick or create a Life Thread, or set or remove a date. The original words are shown under each one.
- **No invented dates:** a date is only set when the words say one explicitly (today, tomorrow, a weekday, "in N days", "Nov 3"), and the phrase it came from is shown. Vague timing ("next week", "soon") becomes a hint only.
- **Life Threads** (`/threads`): seeded threads (Car & insurance, Health appointments, Lisbon trip, Home upkeep) gather linked tasks, emails, dates and notes from every module. Tasks show a thread tag.
- Navigation: a centred **+** in the phone tab bar, a **Brain dump** button in the desktop nav, and both modules listed under More.

Tests
- Unit: 6 parser tests (splitting, never inventing dates, explicit date reading, title clean-up, classification and thread suggestion).
- End-to-end: the review-before-add flow (with a date only where one was said, a note needing a thread, a new thread, an excluded item) and the simulated voice flow, at both sizes.

Known gaps
- The parser is deliberately simple. Long run-on sentences ("the filter is overdue, I should order one") stay as one suggestion for you to edit.
- Life Thread notes can't be edited or deleted yet.


### Foundation: prototype ported to Next.js PWA
**Branch:** `claude/app-foundation`

Built
- Next.js 16 (App Router, TypeScript, Tailwind 4), installable PWA (manifest, icons, offline app-shell service worker), security headers.
- Theme: Auto / Light / Dark, saved per device, applied before first paint.
- Phone: bottom tab bar (Today, Inbox, Tasks, More) with safe-area padding. Desktop (≥1024px): side navigation and two-column Today.
- Today: greeting, simulated morning brief composed from the data, "Needs you" (max 3, checkable), agenda with past/now states, unread per account (5 fictional accounts), promotions prompt, upcoming renewals and bills.
- Inbox: search across accounts, account chips, Priority / Everything / Cleanup views, message sheet with simulated summary, deadline found, editable reply draft (Copy works, **Send is disabled**).
- Cleanup: choose Unsubscribe / Mark spam / Keep per sender → separate review screen → Confirm, which **changes nothing** and says so.
- Tasks: add, complete, delete, filter, "From email" tag.
- More: modules, theme, fictional accounts, planned modules, Reset demo data.
- Visible demo disclosure on Today, the desktop nav and More.

Data layer
- Each module has `data/types.ts`, `data/mock.ts`, and a provider or store. The email provider interface has **no** send, delete, archive or unsubscribe methods; cleanup is a proposal only.
- Demo edits persist in `localStorage` on the device only.

Tests
- Unit: 10 tests (inbox filtering, cleanup proposals, preview has no side effects, example-domain-only addresses, brief wording, date helpers).
- End-to-end: 5 flows × 2 viewports (Today, Inbox + sheet, Cleanup confirm, Tasks, theme persistence), plus a no-horizontal-scroll check on each page.

Known gaps
- Fonts and icons are placeholders until a designer reviews them.
- The service worker is a simple cache; it has not been tested on a real iPhone.
- Not deployed. Vercel is not connected yet.

## Secondary queue
| Priority | Feature | State |
|---|---|---|
| 1 | Brain Dump / Quick Capture | Built, in review (PR from `claude/brain-dump`) |
| 2 | Appointment Concierge | Built, in review (PR from `claude/appointment-concierge`) |
| 3 | Email Rescue Mode | Built, in review (PR from `claude/email-rescue`) |
| 4 | Travel & Home with Life Threads | Built, in review (PR from `claude/travel-home`) |
| 5 | UI/UX polish (widgets, states, motion) | Built, in review (PR from `claude/ui-polish`) |
