# Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Clickable single-file prototype (`prototype/life-hub-demo.html`) | **Done** |
| 1 | Port prototype to Next.js PWA on sample data: setup, PWA, themes, tab nav, Today, Inbox, Cleanup flow, Tasks, More | **Built, in review** (not deployed) |
| 1b | Secondary queue: Brain Dump, Appointment Concierge, Email Rescue, Travel & Home, polish (fictional data) | In progress, see `AI_DEVELOPMENT_STATUS.md` |
| 1c | Kitty Glitter v2: new design direction, Inbox Command Center, Tasks views and editing, Life Threads detail, More hub | **Built, in review** |
| 2 | Supabase login locked to the owner's email | Not started |
| 3 | Connect one Gmail account, read-only OAuth (secrets in a backend route) | Not started |
| 4 | Rules-based cleanup | Not started |
| 5 | AI summaries, action flags, draft replies | Not started |
| 6 | Calendar and tasks, then other modules | Not started |

## Phase 1 detail
Use `prototype/life-hub-demo.html` as the reference for layout, palette, copy and sample data.

1. Project setup, PWA basics, theme switching, tab navigation.
2. **Today:** greeting, short morning brief, "Needs you" (max 3, checkable), today's agenda, unread count per account (5), promo-review prompt, upcoming renewals and bills.
3. **Inbox:** search across accounts, account filter chips, Priority / Everything / Cleanup views; detail sheet with AI summary, deadline, editable suggested reply (Send disabled).
4. **Cleanup:** Unsubscribe / Mark spam / Keep per sender, then a confirm screen; nothing runs without confirmation.
5. **Tasks:** checklist with add, plus a "from email" tag.
6. **More:** theme toggle, email account list, planned modules.
7. Deploy to Vercel and share the preview link.
