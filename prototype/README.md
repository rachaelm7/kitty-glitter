# Prototype: Life Hub clickable demo

`life-hub-demo.html` is the original clickable demo of Life Hub. It's one self-contained HTML file that runs on sample data only and connects to no real accounts. It's kept here **exactly as it was** so nothing is lost.

- **Source:** Claude artifact https://claude.ai/artifact/RhN5CFkqwTfL6VwsCZPFZ8 (version `1792471503-98f0`)
- **Open it:** download the file and open it in any browser. No build step needed.

## What it already does
- **Today:** time-based greeting, AI-style morning brief, "Needs you" (3 checkable items, in rose), today's agenda with past/now states, unread bars for 5 accounts, a "46 promotional emails" review prompt, and upcoming renewals and bills.
- **Inbox:** search across accounts, account chips, Priority / Everything / Cleanup views. The message sheet shows a summary, any deadline found, and an editable reply with Copy, plus a disabled Send.
- **Cleanup:** Unsubscribe / Mark spam / Keep per sender, then a review sheet and a Confirm that changes nothing (demo).
- **Tasks:** add tasks, check them off, "From email" tag.
- **More:** Auto / Light / Dark theme (saved on the device), email account list, planned modules.
- Bottom tab bar, iPhone safe areas, light and dark palettes, Fraunces + Figtree.

## Role going forward
This is the **design and behaviour reference** for Phase 1. The Next.js app ports these screens, colors, copy and sample data into the modular structure in `docs/ARCHITECTURE.md`. Don't edit this file. Changes go into the real app.
