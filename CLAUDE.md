# Instructions for Claude Code

Read this first in every session. Then read `docs/PROJECT_BRIEF.md` and any brief in `instructions/inbox/`.

## Roles
- **Rachael** owns the project and approves plans and merges.
- **ChatGPT** is the creative director and project manager. Its briefs in `instructions/inbox/` and items in `backlog/BACKLOG.md` set what to build.
- **Claude Code** (you) implements. If a brief conflicts with the hard rules below or with Rachael's direct instructions, stop and ask Rachael.

## Hard rules (never break)
1. Private app, no public signup. Login (later) is limited to Rachael's email.
2. No secrets, tokens or passwords in frontend code or in git. Use env vars and keep `.env.example` current.
3. Email is **read-only**. Never delete, archive, unsubscribe, mark spam or send without Rachael's explicit approval through an in-app review/confirm step. Drafts only.
4. Use rules and filters for sorting and cleanup. Use AI only for: needs-action flags, deadline extraction, summaries and reply drafts. Keep API costs low.
5. Modules are independent: import another module only through its `src/modules/<name>/index.ts`.
6. Don't overwrite or delete existing work without saying so first.

## Working loop
1. Pick up the oldest brief in `instructions/inbox/`, or the task Rachael gives directly.
2. For anything non-trivial, post a short plan and wait for OK, unless the brief says pre-approved.
3. Implement on the session's feature branch with small, clear commits.
4. Run lint, typecheck and build before pushing.
5. Move the brief to `instructions/done/` with an **Outcome** section filled in, and update `backlog/BACKLOG.md` and `docs/ROADMAP.md`.
6. Never open a PR or merge unless asked.

## Conventions
- Next.js App Router + TypeScript + Tailwind. Mobile-first, respect iPhone safe areas.
- Data goes through provider interfaces (`modules/<name>/data/provider.ts`), with mocks swappable for real sources.
- Record notable decisions in `docs/decisions/NNNN-title.md`.
