# Architecture

```
public/                manifest.webmanifest, sw.js, icons/
src/
  app/                 thin routes: / (Today), /inbox, /inbox/cleanup, /tasks, /more
  core/                shared only: ui/, theme/, pwa/
  modules/
    today/  email/  tasks/  bills/  calendar/
      components/
      data/{types.ts, provider.ts, mock.ts}
      index.ts         ← the only import surface for other modules
  config/modules.ts    module registry (live vs. planned)
```

## Data layer
Each module exposes a **provider interface**. Phase 1 uses mock providers; later phases swap in real ones (for example a Gmail provider that calls a server route holding the OAuth secrets) without UI changes.

The email provider is read-only by design. Destructive actions are modelled as **proposals**. They run only after an explicit confirm step, and in Phase 1 they never run at all.

## Prototype
`prototype/life-hub-demo.html` holds the current design in one file: its CSS variables become the theme tokens, and its `ACCTS`, `MSGS`, `CLEAN`, `needs`, `tasks`, `AGENDA` and `UPC` arrays become the mock data in each module's `data/mock.ts`.

## Conventions learned while building
- **Client-only modules:** files that create stores or use hooks (`core/store`, `core/date`, every `modules/*/data/store.ts`) start with `"use client"`. Route files are server components that render one screen component, so a store must never be evaluated on the server.
- **Dates:** sample data stores day offsets from today. The server renders against a fixed demo date and the client switches to the real date after hydration (`useNow`).
- **Persistence:** `createStore(key, seed)` mirrors state to `localStorage` under `kg:<key>:v<version>`. Bump the version when a seed's shape changes. More → Reset demo data restores every store.
- **Next.js 16:** read `node_modules/next/dist/docs/` before using a Next API (see `AGENTS.md`). `npm run typecheck` runs `next typegen` first so `LayoutProps`/`PageProps` exist.
