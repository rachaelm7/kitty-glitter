# Workflow: ChatGPT → Claude Code → Rachael

```
ChatGPT (creative director / PM)
   │ writes a brief (instructions/TEMPLATE.md) or backlog item
   ▼
instructions/inbox/YYYY-MM-DD-short-title.md     backlog/BACKLOG.md
   │
   ▼
Claude Code: plan → (Rachael OK) → build → push to feature branch
   │ moves brief to instructions/done/ with an Outcome section
   ▼
Rachael reviews the preview, merges, gives feedback → ChatGPT
```

## Today (manual)
Rachael copies a brief from ChatGPT into `instructions/inbox/` (or pastes it into Claude Code) and Claude Code takes it from there.

## Later (automated, not set up yet)
Possible next steps once the manual loop feels right:
- Backlog items become GitHub Issues using `.github/ISSUE_TEMPLATE/`.
- A GitHub Action or scheduled Claude Code routine picks up new briefs in `instructions/inbox/` or issues with a `ready` label.
- PRs use `.github/pull_request_template.md` so reviews stay consistent.

Rachael stays the approval gate in every version: no merge and no real-account action without her.
