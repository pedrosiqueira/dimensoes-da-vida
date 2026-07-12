# Dimensões da Vida

SvelteKit 5 + TypeScript, pnpm, SQLite (Drizzle + better-sqlite3), better-auth, adapter-vercel.

## Commands

| Command            | Action                                          |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Start dev server                                |
| `pnpm build`       | Production build                                |
| `pnpm preview`     | Preview production build                        |
| `pnpm check`       | Type-check (`svelte-kit sync` → `svelte-check`) |
| `pnpm lint`        | Prettier check + ESLint                         |
| `pnpm format`      | Prettier write                                  |
| `pnpm db:push`     | Push Drizzle schema to DB                       |
| `pnpm db:generate` | Generate Drizzle migration                      |
| `pnpm db:migrate`  | Run pending migrations                          |
| `pnpm db:studio`   | Open Drizzle Studio                             |
| `pnpm db:seed`     | Seed database with example surveys              |
| `pnpm auth:schema` | Generate better-auth schema                     |

**Verification order:** `pnpm lint` → `pnpm check`.  
`svelte-kit sync` (auto-runs via `prepare`, `check`, and `dev`) generates `.svelte-kit/` types — needed before type-checking works.

## Svelte 5 — Runes Mode

Forced on for all project files (not `node_modules`) via `vite.config.ts`.  
Use `$state`, `$derived`, `$props`, `$effect`, `$bindable`, `{@render children()}`, `{#snippet}`.  
No legacy `export let`, `on:`, `$:`, or `<slot>`.

## Database

- SQLite via **@libsql/client** (Turso), ORM via **Drizzle**
- Schema: `src/lib/server/db/schema.ts`
- Auth schema auto-generated to `src/lib/server/db/auth.schema.ts` via `pnpm auth:schema`
- `DATABASE_URL` in `.env` (default: `file:local.db` for local)
- For production on Vercel: set `DATABASE_URL` to Turso remote URL + `TURSO_AUTH_TOKEN`
- Dev workflow: `pnpm db:push` to sync; for migrations use `generate` + `migrate`
- **CHECK constraint** `answer.value BETWEEN 0 AND 10` enforced at DB level (migration `0000_*`)
- **Views**: `active_survey` and `active_survey_response` filter out soft-deleted rows — use them instead of raw tables for SELECT queries

## Auth (better-auth)

- Config at `src/lib/server/auth.ts`, server hook at `src/hooks.server.ts`
- **Required env vars**: `ORIGIN`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Google OAuth only (no email/password)
- Demo route: `src/routes/demo/better-auth/`
- **Route group**: all protected routes live under `(auth)/` — auth check is done once in `(auth)/+layout.server.ts`, no need to repeat per‑route

## Code Style

- **Prettier**: tabs, single quotes, no trailing commas, 100 print width
- **ESLint**: typescript-eslint recommended + svelte recommended; `no-undef` off
- **Import alias**: `$lib` → `src/lib`

## TypeScript

- `tsconfig.json` extends `.svelte-kit/tsconfig.json` (generated, not committed)
- `strict: true`, `moduleResolution: "bundler"`, `rewriteRelativeImportExtensions: true`
