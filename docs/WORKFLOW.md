# Workflow: ChatGPT → Claude Code → the owner

```
ChatGPT (creative director / PM)
   │ writes a brief (instructions/TEMPLATE.md) or backlog item
   ▼
instructions/inbox/YYYY-MM-DD-short-title.md     backlog/BACKLOG.md
   │
   ▼
Claude Code: plan → (the owner OK) → build → push to feature branch
   │ moves brief to instructions/done/ with an Outcome section
   ▼
The owner reviews the preview, merges, gives feedback → ChatGPT
```

## Automated (GitHub issues)
ChatGPT opens an issue with the **Claude-ready spec** template and the `claude-ready` label. Claude builds it and opens a draft PR. Full setup and safeguards: [`AUTOMATION.md`](AUTOMATION.md).

## Manual fallback
The owner pastes a brief into `instructions/inbox/` or straight into a Claude Code session.

The owner stays the approval gate in every version: no merge, deploy or real-account action without her.
