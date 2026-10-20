# Automation: ChatGPT → GitHub issue → Claude → draft PR → Rachael

## How it works
1. **ChatGPT** (product manager / creative director) writes a GitHub issue using the **Claude-ready spec** template.
2. The issue gets the label **`claude-ready`**, either at creation or later.
3. The **Claude – implement issue** workflow (`.github/workflows/claude-issue.yml`) starts. Claude:
   - posts a progress comment on the issue,
   - creates a branch `claude/issue-<n>-<short-title>`,
   - implements the spec following `CLAUDE.md`,
   - runs lint / typecheck / build (once the app exists),
   - opens a **draft** pull request that says `Closes #<n>`.
4. **CI** (`.github/workflows/ci.yml`) checks the PR and scans it for secrets.
5. **Rachael** reviews the PR (and its Vercel preview, once Vercel is connected). To ask for changes, comment `@claude <what to change>` on the PR. When happy, mark it ready and merge.

Nothing merges, deploys or publishes without Rachael.

## Safeguards built in
| Risk | Guard |
|---|---|
| A stranger opens an issue on this public repo | Runs only if **both** the issue author and whoever applied the label are on the trusted list (`rachaelm7`). |
| Hidden instructions in other people's comments | `@claude` follow-ups only run for comments by `rachaelm7`, and other people's comments are filtered out of Claude's context (`include_comments_by_actor`). The action also strips hidden markdown. |
| Other GitHub Apps or bots triggering runs | `allowed_bots: ""`, so no bots can. |
| Prompt injection via expressions | The workflow passes only the issue *number* into the prompt, never title or body text. |
| Auto-merge / deploy | Claude can't run `gh pr merge`, `gh pr ready`, `gh pr review`, `gh workflow`, `gh secret` or `vercel`. PRs are drafts. No deploy workflow exists. |
| Secrets in code | Credentials live only in GitHub Actions secrets. CI runs gitleaks on every PR. `CLAUDE.md` forbids real data. |
| Changing its own guardrails | Claude is told not to edit `.github/`, and every change still needs your merge. |
| Runaway cost | Max turns and job timeouts are capped. Each issue gets one run at a time. |

To trust another account (for example, if ChatGPT posts as its own bot, see below), edit the `fromJSON('["rachaelm7"]')` lists in `claude-issue.yml` in a reviewed PR.

## One-time setup (needs Rachael)
These steps need your accounts, so Claude can't do them for you.

1. **Install the Claude GitHub App** on `rachaelm7/kitty-glitter`: https://github.com/apps/claude, giving it access to *only this repository*. (You may already have done this.)
2. **Create the auth secret.** Pick one:
   - **Claude subscription (Pro/Max):** on your computer, install Claude Code and run `claude setup-token`. Copy the token, then go to GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**, name it `CLAUDE_CODE_OAUTH_TOKEN` and paste the token.
   - **API key (pay per use):** create a key at console.anthropic.com, save it as the secret `ANTHROPIC_API_KEY`, then in both `claude-*.yml` files swap the commented `anthropic_api_key` line in for `claude_code_oauth_token`.

   Never paste a token into an issue, a PR, a chat or a file.
3. **Create the label:** Issues → Labels → New label → `claude-ready`.
4. **Protect `main`:** Settings → Rules → Rulesets → New branch ruleset targeting `main`. Turn on "Require a pull request before merging" and "Block force pushes". That way nothing, Claude included, lands on `main` except through a PR you merge.
5. **Actions settings** (Settings → Actions → General):
   - *Fork pull request workflows:* "Require approval for all external contributors".
   - *Workflow permissions:* leave the default "Read repository contents" and leave "Allow GitHub Actions to create and approve pull requests" **off**. Claude opens PRs with its own app token.
6. **Merge the PR that adds these workflows.** GitHub only runs issue-triggered workflows from the default branch, so nothing triggers until this is on `main`.
7. **Later, Vercel:** when you connect Vercel, keep production deploys tied to `main` only. PR previews are fine, but remember preview links are reachable by anyone who has them.

## How ChatGPT triggers Claude
ChatGPT does either of these in `rachaelm7/kitty-glitter`:
- **Create an issue with the `claude-ready` label** already applied, or
- **Add the `claude-ready` label** to an existing issue that you or it wrote.

That's it. To re-run after editing the spec, remove the label and add it again.

**Identity check (important):** the workflow trusts `rachaelm7`. If ChatGPT's GitHub connector acts *as you*, issues show your username and everything just works. If issues show a bot name instead (for example `something[bot]`), the run will be skipped. In that case tell Claude the exact bot name. Don't add it yourself on a whim: anyone can install a public bot and open issues on a public repo, so it needs a closer look.

## Writing a good spec (for ChatGPT)
Use the **Claude-ready spec** issue template: goal, user story, requirements, design notes (layout, states, copy), fictional sample data, acceptance checks, and out of scope. One focused change per issue works best.
