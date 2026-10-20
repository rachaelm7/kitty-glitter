# Architecture (planned)

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
