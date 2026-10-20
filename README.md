# kitty-glitter

**Life Hub**: Rachael's private, mobile-first personal dashboard and assistant. It starts with an Email Command Center.

> Status: **Phase 1 planned, awaiting approval.** No application code yet. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Who does what

| Role | Who | Responsibility |
|---|---|---|
| Owner | Rachael | Final say. Approves plans, merges, anything touching real accounts. |
| Creative director & project manager | ChatGPT | Vision, design direction, priorities, writes instruction briefs and backlog items. |
| Implementation | Claude Code | Builds, tests, commits and pushes; reports back. |

How work moves between them: [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Repository map

```
README.md            ← you are here
CLAUDE.md            ← standing rules Claude Code follows in every session
docs/
  PROJECT_BRIEF.md   ← vision, hard rules, design language
  ROADMAP.md         ← phases and their status
  ARCHITECTURE.md    ← planned code structure and data layer
  WORKFLOW.md        ← ChatGPT → Claude Code → Rachael loop
  decisions/         ← short records of decisions (ADRs)
backlog/
  BACKLOG.md         ← single shared backlog (prioritised)
instructions/
  TEMPLATE.md        ← format for a brief from ChatGPT to Claude Code
  inbox/             ← briefs waiting to be implemented
  done/              ← briefs that have been completed (kept for history)
.github/             ← issue + PR templates (for future automation)
```

Application code (Next.js) will live in `src/` once Phase 1 is approved.
