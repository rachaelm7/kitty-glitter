# Project brief: Life Hub

A private, mobile-first personal dashboard and assistant for Rachael, installable on iPhone as a PWA. It starts with an **Email Command Center** across 5 accounts, then grows into tasks, calendar, home, finances, travel, health and projects.

## Stack
- Next.js (TypeScript, App Router) + Tailwind
- Installable PWA (manifest, icons, service worker)
- Hosted on Vercel; Supabase later for database, auth and sync
- One folder per module

## Hard rules
See `CLAUDE.md` → *Hard rules*. In short: private, no secrets in the frontend, email read-only with review-before-action, rules first and AI only where it earns its cost, independent modules.

## Design language
- Calm, uncluttered, mobile-first. Themes: auto, light, dark.
- Palette: deep teal ink text, cool light gray-green background, teal accent, **rose only for urgent items**.
- Fonts: **Fraunces** (headings), **Figtree** (body).
- Bottom tab bar: **Today · Inbox · Tasks · More**. Respect safe areas.
- Clear separation of urgent and low-priority items. No heavy shadows, no clutter.
