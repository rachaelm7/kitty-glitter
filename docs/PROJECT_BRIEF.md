# Project brief: Life Hub

A private, mobile-first personal dashboard and assistant for the owner, installable on iPhone as a PWA. It starts with an **Email Command Center** across 5 accounts, then grows into tasks, calendar, home, finances, travel, health and projects.

## Stack
- Next.js (TypeScript, App Router) + Tailwind
- Installable PWA (manifest, icons, service worker)
- Hosted on Vercel; Supabase later for database, auth and sync
- One folder per module

## Hard rules
See `CLAUDE.md` → *Hard rules*. In short: private, no secrets in the frontend, email read-only with review-before-action, rules first and AI only where it earns its cost, independent modules.

## Design language (approved direction, v2)
Sophisticated, feminine, calming, polished and slightly whimsical. Like a carefully designed consumer product, and like a premium personal assistant rather than a generic productivity dashboard.

- **Palette:** warm ivory and pearl backgrounds, dusty rose accent, muted lavender, soft champagne details, subtle neutral greys, dark charcoal text. Avoid bright pink, heavy gradients, harsh colours, clutter and childish graphics. Urgent items use a deeper berry-rose, always paired with a label.
- **Type:** Fraunces (headings) and Figtree (body).
- **Shape:** beautifully proportioned cards, soft shadows, generous rounded corners, generous whitespace.
- **Detail:** delicate line icons, subtle animation (off under reduced motion), restrained sparkle and cat touches.
- **Layout:** bottom navigation on mobile (Today · Inbox · Tasks · More, with a centred capture button) and a sidebar on desktop. Comfortable tap targets, readable text, WCAG AA contrast.
- **Every screen** shows **DEMO MODE — FICTIONAL DATA**.

## Product principles
Beautiful enough to enjoy opening. Intelligent enough to reduce mental load. Simple enough to see at once what needs attention.
