# kitty-glitter

**Life Hub**: Rachael's private, mobile-first personal dashboard and assistant. It starts with an Email Command Center.

> Status: **Phase 1 demo built** as a Next.js PWA with fictional data (in review). Progress log: [`docs/AI_DEVELOPMENT_STATUS.md`](docs/AI_DEVELOPMENT_STATUS.md).

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
  AI_DEVELOPMENT_STATUS.md ← what's built, how it was tested, what's open
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

## Run it locally
```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
npx playwright test    # end-to-end, iPhone and desktop sizes (after a build)
```

App code lives in `src/`: `app/` holds thin routes, `core/` shared UI, theme and store, and `modules/` one folder per feature. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
