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

## Automated (GitHub issues)
ChatGPT opens an issue with the **Claude-ready spec** template and the `claude-ready` label. Claude builds it and opens a draft PR. Full setup and safeguards: [`AUTOMATION.md`](AUTOMATION.md).

## Manual fallback
Rachael pastes a brief into `instructions/inbox/` or straight into a Claude Code session.

Rachael stays the approval gate in every version: no merge, deploy or real-account action without her.
