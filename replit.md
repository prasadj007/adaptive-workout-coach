# Adaptive Workout Coach

A mobile-first fitness web app that turns a user's goal, experience, equipment, time, and schedule into a clear workout for today.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/adaptive-workout-coach/src/App.tsx` — onboarding state, plan generation, Today workout, and navigation.
- `artifacts/adaptive-workout-coach/src/index.css` — shared theme tokens, typography, responsive layout, and motion utilities.
- `artifacts/adaptive-workout-coach/package.json` — Vite app scripts and frontend dependencies.

## Architecture decisions

- The first prototype is client-side only; onboarding state persists in localStorage so the flow works without authentication or a database.
- Workout content is represented with typed local data structures so the later plan engine can replace the prototype logic without changing the UI contract.
- The app uses one responsive shell: bottom navigation on mobile and a persistent sidebar on larger screens.

## Product

- Guided five-step onboarding for goal, experience, equipment, workout duration, and training frequency.
- Derived plan summary and Today workout with adaptive metadata and actionable session controls.
- Client-side exercise completion, session start/finish, short-session and equipment-swap actions, and supporting Progress, History, and Profile views.

## User preferences

- Keep the experience simple, premium, mobile-first, and focused on the next action.

## Gotchas

- The app is intentionally not connected to auth, a database, AI, payments, nutrition, social, chat, wearables, or video content yet.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
