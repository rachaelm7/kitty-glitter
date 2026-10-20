---
name: continuous-improvement
description: Use at the start of every Kitty Glitter development session and whenever a task looks "already done". Inspects what exists, finds the highest-value improvement, implements and tests it, repeats, and leaves a handoff for the next session. Also covers acting autonomously instead of asking the owner to do things Claude can do itself.
---

# Continuous improvement for Kitty Glitter

The spec is a starting point, not a finite checklist. Your objective is not to complete a checklist; it is to keep making Kitty Glitter an exceptional, polished, genuinely useful app.

## Autonomy rule
**Never ask the owner to do something you can do yourself.** Run the command, open the PR, fix the test, subscribe to the PR, update the docs. Only hand something to the owner when it truly needs them: their accounts or credentials (Vercel, secrets, GitHub settings), merging, deploying, or a decision that changes product direction. When that happens, say exactly what to do, once, and keep working on everything else.

You have authority to make routine product refinements and technical decisions within the approved design direction (`docs/PROJECT_BRIEF.md`). Don't ask the owner to pick colors, fonts, frameworks or what to do next when a reasonable choice can be made.

## The loop
1. **Inspect.** Read `docs/AI_DEVELOPMENT_STATUS.md` (especially "Next up"), run the app, and look at what exists and what actually works. Never rebuild something that exists.
2. **Evaluate.** Find weaknesses in usability, visual design, functionality, performance, accessibility or code quality. "Implemented" is not "finished": is it intuitive, reliable, cohesive and genuinely useful?
3. **Prioritize.** Pick the single improvement with the most benefit to the user.
4. **Implement.** Change the app directly, in small commits on a feature branch.
5. **Test.** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npx playwright test` (375px-class iPhone and 1280px desktop, both themes, axe accessibility). Look at screenshots. Never claim a test ran if it didn't.
6. **Repeat** with the next highest-value improvement for as long as the environment allows.

Order of work: primary screens → secondary queue → the next most valuable improvements consistent with the product vision.

Examples: a built Inbox → better filtering, search, prioritization, interactions, hierarchy. A working Today → a smarter, more actionable, more polished briefing. Working Tasks → editing, recurrence, categories, email links. Existing Life Threads → clearer connections, display and updates. A beautiful app → responsiveness, accessibility, performance, microinteractions.

## Guardrails
- Don't redesign working features without a clear improvement. Don't add complexity to stay busy. Don't spend a session planning without implementing.
- Preserve existing functionality. Follow every privacy, GitHub, testing and deployment rule in `CLAUDE.md`: public repo, fictional data only (example.com addresses), no merging or deploying.

## End of session handoff
Update `docs/AI_DEVELOPMENT_STATUS.md` with: what you improved, what you tested (with real results), and **the next three highest-value improvements** so the next session can start immediately.
