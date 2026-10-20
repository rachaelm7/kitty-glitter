# kitty-glitter

**Life Hub**: Rachael's private, mobile-first personal dashboard and assistant. It starts with an Email Command Center.

> Status: **Clickable prototype done** ([`prototype/`](prototype/)). **Phase 1** (porting it into a real Next.js PWA) is planned and awaiting approval. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Who does what

| Role | Who | Responsibility |
|---|---|---|
| Owner | Rachael | Final say. Approves plans, merges, anything touching real accounts. |
| Creative director & project manager | ChatGPT | Vision, design direction, priorities, writes instruction briefs and backlog items. |
| Implementation | Claude Code | Builds, tests, commits and pushes; reports back. |

How work moves between them: [`docs/WORKFLOW.md`](docs/WORKFLOW.md). Automation setup: [`docs/AUTOMATION.md`](docs/AUTOMATION.md).

> **This repository is public.** Fictional sample data only. Never commit secrets or personal information.

## Repository map

```
README.md            ← you are here
CLAUDE.md            ← standing rules Claude Code follows in every session
docs/
  PROJECT_BRIEF.md   ← vision, hard rules, design language
  ROADMAP.md         ← phases and their status
  ARCHITECTURE.md    ← planned code structure and data layer
  WORKFLOW.md        ← ChatGPT → Claude Code → Rachael loop
  AUTOMATION.md      ← GitHub Actions setup: claude-ready issues → draft PRs
  decisions/         ← short records of decisions (ADRs)
prototype/
  life-hub-demo.html ← original clickable demo (single HTML file, sample data)
backlog/
  BACKLOG.md         ← single shared backlog (prioritised)
instructions/
  TEMPLATE.md        ← format for a brief from ChatGPT to Claude Code
  inbox/             ← briefs waiting to be implemented
  done/              ← briefs that have been completed (kept for history)
.github/             ← Claude + CI workflows, issue + PR templates
```

Application code (Next.js) will live in `src/` once Phase 1 is approved.
