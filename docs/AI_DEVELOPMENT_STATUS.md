# AI development status

Living log of what Claude Code has built, how it was checked, and what is still open.
Newest increment first. Updated in every PR.

## Review status: read this first
- **External review:** none yet. No autonomous ChatGPT reviewer is connected to this repository, so **no change here has been approved by ChatGPT**. Anything listed as "reviewed" below means Claude's own self-review unless it names a person.
- **Self-review:** Claude runs lint, typecheck, unit tests (Vitest), end-to-end tests (Playwright, at iPhone 13 and 1280px desktop sizes), a production build, and looks at screenshots in light and dark mode before opening a PR.
- **Approval:** only Rachael merges. Nothing is deployed automatically.

## Branch and PR map
PRs are stacked because each builds on the last. Merge them in order; GitHub retargets the next PR automatically when its base branch is merged and deleted.

| # | Branch | Builds on | Contents | State |
|---|---|---|---|---|
| 1 | `claude/life-hub-phase-1-27ixfq` | `main` | Docs, prototype, Claude GitHub Actions | PR #1 open |
| 2 | `claude/app-foundation` | #1 | Next.js PWA: Today, Inbox, Cleanup, Tasks, More | PR #2 open |
| 3 | `claude/brain-dump` | #2 | Brain Dump, Life Threads | PR #3 open |
| 4 | `claude/appointment-concierge` | #3 | Appointment Concierge | PR #4 open |
| 5 | `claude/email-rescue` | #4 | Email Rescue Mode | PR open |

## Increments

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
| 4 | Travel & Home with Life Threads | Not started |
| 5 | UI/UX polish (widgets, states, motion) | Not started |
