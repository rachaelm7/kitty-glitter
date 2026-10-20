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
| 2 | `claude/app-foundation` | #1 | Next.js PWA: Today, Inbox, Cleanup, Tasks, More | PR open |

## Increments

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
| 1 | Brain Dump / Quick Capture | Not started |
| 2 | Appointment Concierge | Not started |
| 3 | Email Rescue Mode | Not started |
| 4 | Travel & Home with Life Threads | Not started |
| 5 | UI/UX polish (widgets, states, motion) | Not started |
