# 0002: Automate issues → draft PRs with Claude Code GitHub Actions

- **Date:** 2026-10-20
- **Status:** Accepted (takes effect when merged to `main`)

## Context
ChatGPT writes specs and Claude Code implements them. The repo is public, so anyone can open issues or comments.

## Decision
- Use the official `anthropics/claude-code-action@v1`.
- Trigger on the `claude-ready` label, only when both the issue author and the labeler are trusted (`rachaelm7`).
- Allow `@claude` follow-ups only from `rachaelm7`; filter other people's comments out of Claude's context; no bots allowed.
- Claude opens **draft** PRs and is denied merge, ready, review, workflow, secret and deploy commands.
- CI runs lint, typecheck, build and a gitleaks secret scan on every PR.

## Consequences
The owner is the only path to `main` and to deployment. If ChatGPT acts as a bot account rather than as the owner, the trusted list needs a reviewed update.
