# AGENTS.md — guidance for AI coding agents working on PitStop

This file orients any AI agent (or human) picking up work on this repository. Read it
before making changes. It points to the authoritative specs and states the working
conventions for this codebase.

## What this project is

PitStop is a **client-only** web app (React + Vite + TypeScript, deployed to GitHub
Pages) that tracks a car's fuel efficiency. It has **no backend of its own** — a
**Google Sheet is the database**, accessed directly from the browser via the Google
Sheets API, with each user authenticated as themselves via Google Identity Services.

## Source of truth documents

Always check these before inventing new behavior — they are the spec, not this file.

| Document | What it covers |
|---|---|
| **`spec.md`** | The full functional & technical spec. Sections you'll need most: |
| — `spec.md` §4 | Core architecture — client-only model, no backend, GitHub Pages deploy |
| — `spec.md` §4.1 / §4.1.1 | Google auth (`drive.file` scope), multi-user token/access model |
| — `spec.md` §5 | Tech stack decisions (React, Vite, Chart.js, GIS, Picker, vite-plugin-pwa) |
| — `spec.md` §6 | Google Sheet data model: per-car tab layout, named ranges, fuel-log columns |
| — `spec.md` §7 | Efficiency & statistics formulas (per-fill km/L, robust rolling average, stat definitions) |
| — `spec.md` §8 | The 6 screens and their behavior (Onboarding, Dashboard, Add/Edit fueling, Statistics, Settings, About) |
| — `spec.md` §9 / §9.1 | PWA/offline behavior; visual design pointer (dark-only, see DESIGN.md) |
| — `spec.md` §10 | Localization & RTL requirements |
| — `spec.md` §11 | Security & privacy constraints |
| — `spec.md` §12 | Required error/edge-case handling (table of states to support) |
| — `spec.md` §13 | Deployment/Google Cloud setup checklist |
| — `spec.md` §15 | Locked decisions log — don't re-litigate these without asking the user |
| **`DESIGN.md`** | The canonical visual design system: color tokens, typography (Rubik + JetBrains Mono), spacing/radii, shadows/glows, component specs. **Dark theme only — no light theme.** |
| **`mockups/`** | Static HTML/CSS reference implementation of the design system (dashboard gauge, add-fueling form) — use as a structural/visual reference when building the real components. |
| **`readme.md`** | Original informal brain-dump; superseded by `spec.md` but useful for background/tone. |

If a requirement here conflicts with `spec.md`/`DESIGN.md`, the dedicated doc wins —
update this file instead of drifting from it.

## Non-negotiable conventions

- **Hebrew UI, full RTL.** `<html lang="he" dir="rtl">`. Use CSS **logical properties**
  (`margin-inline-start`, `padding-inline-end`, `inset-inline`, etc.), never physical
  `left`/`right`, except where deliberately overridden for numeric fields.
- **Numbers/units stay LTR inside RTL text** (e.g. `14.2 ק״מ/ל`) — see the `.ltr-num`
  pattern in `mockups/styles.css`.
- **Dark theme only.** Do not add a light theme or theme-switching UI.
- **No backend.** Never introduce a server, database, or API route of PitStop's own.
  All persistent data goes through the Google Sheets API against the user's sheet.
- **Minimal client-side storage.** Only the chosen spreadsheet id and small UI prefs
  in `localStorage`. Access tokens live in memory only, never persisted.
- **`drive.file` OAuth scope** (not the broad `spreadsheets` scope) — see spec.md §4.1.
- **TypeScript strict mode.** Prefer explicit types for Sheet row ↔ object mapping.
- **Currency ₪ (ILS), distance km, volume liters**, dates `DD/MM/YYYY`.
- **Component-led styling.** Use Tailwind utilities via `cva` (`class-variance-authority`)
  + the shared `cn()` helper (`src/lib/cn.ts`) instead of hand-written CSS files —
  one `.tsx` per component, no separate stylesheets. Components are `const` arrow
  functions, not `function` declarations.
- **Member/key ordering is enforced by `eslint-plugin-perfectionist`:** interface and
  object-type members are sorted alphabetically with required fields before optional
  fields; object literal keys are sorted alphabetically. Run `npm run lint -- --fix`
  after writing new interfaces/objects rather than hand-ordering them.

## Mandatory verification workflow

**Every task/todo, and every phase, must be verified before being marked done:**

```
npm run lint
npm run build
```

Both must pass with no errors before a step is considered complete. If either fails,
fix the issue as part of the same step — do not defer lint/build fixes to a later
step. Phase-level "checkpoint" todos exist specifically to re-run and confirm both
commands pass before the next phase of work begins.

## Repo structure (target)

```
/                     Vite root (base: /PitStop/)
├── spec.md
├── DESIGN.md
├── AGENTS.md          (this file)
├── mockups/           static HTML/CSS design reference (not shipped)
├── src/
│   ├── app/           routing, app shell (TopBar, BottomNav)
│   ├── pages/         one folder per screen (Onboarding, Dashboard, AddEditFueling,
│   │                  Statistics, Settings, About)
│   ├── components/    shared UI primitives (Button, Card, Chip, StatTile, FuelRow,
│   │                  Gauge, inputs, SegmentedControl)
│   ├── lib/           auth (GIS), Google Picker integration, Sheets API client,
│   │                  data models/mapping, stats calculations
│   └── styles/        design tokens ported from mockups/styles.css
└── .github/workflows/ deploy-to-pages workflow
```

## When in doubt

Prefer the documented decision in `spec.md` §15 or the relevant section over
improvising. If a genuine ambiguity blocks progress, surface it back to the user
rather than silently picking an approach that contradicts the spec.
