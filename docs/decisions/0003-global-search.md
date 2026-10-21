# 0003: Global search and quick switcher

- **Date:** 2026-10-21
- **Status:** Accepted
- **Author role:** Architect (see the multi-agent notes in `docs/AI_DEVELOPMENT_STATUS.md`)

## Problem
Finding something means knowing which screen it lives on. People remember a word ("faucet", "Harborline", "Lisbon"), not a module.

## Decision
One **quick switcher**, opened with ⌘K / Ctrl+K or a search button, that searches emails, tasks, Life Threads, appointments, trips, upkeep items and pages at once, and jumps straight to the result.

## Design

```
core/store/search.ts        open/close state (in memory)          ← core knows nothing about modules
modules/hub/data/search.ts  PURE: buildIndex(sources) → items; rank(items, query) → results
modules/hub/data/recent.ts  last 5 opened results (localStorage, per device)
modules/hub/components/
  SearchHost.tsx            tiny: global hotkey + lazy-loads the dialog on first open
  QuickSwitcher.tsx         the dialog (combobox + listbox), loaded on demand
app/layout.tsx              mounts <SearchHost/> through AppShell's `extras` slot
```

**Why the hub module:** search spans every module, and `hub` is the one place allowed to read all their public APIs. No module imports another's internals.

**Ranking (deterministic, explainable, no AI):**
- Every typed word must match (AND), case- and accent-insensitive.
- Per word: title starts with it > a title word starts with it > title contains it > subtitle > extra keywords.
- Small boosts: urgent/unread mail, open tasks, active threads. Small penalties: done tasks, archived mail, wrapped-up threads.
- Empty query shows recent items, then the main pages.

**Jumping:** an email opens its sheet in Inbox, a task opens its editor in Tasks (both through `core/store/intent`), everything else is a link.

**Accessibility:** ARIA combobox with `aria-activedescendant`; ↑/↓ to move, Enter to open, Esc to close; focus returns to where it was; a visible button for people who don't use a keyboard; works under reduced motion.

**Performance budget:** the dialog code is not in the initial bundle (loaded on first open, preloaded when the browser is idle). The index is built once per open from data already in memory, and ranking is linear over a few hundred items, so it runs on every keystroke with no debounce.

**Privacy / safety:** runs entirely on the device over fictional demo data. No network, no analytics. Recent searches store item ids only, never the typed text.

## Consequences
New modules appear in search by adding a few lines to `buildIndex`. If data grows into the thousands, ranking would move to a precomputed index or the server in a later phase.
