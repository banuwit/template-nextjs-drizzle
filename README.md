# Next.js Dashboard Starter

Admin dashboard starter kit: **Next.js 16 (App Router) · React 19 · Drizzle ORM · PostgreSQL · Better Auth · Tailwind v4 · shadcn/ui (Base UI)**.

Ships with email/password auth, a DB-driven sidebar, and reference CRUD features you can copy for new pages.

## Requirements

- Node.js 20+
- PostgreSQL **18+** (ids use `uuidv7()`)

## Getting started

```bash
npm install
cp .env.example .env        # then fill in the values below
npm run db:migrate          # create tables
npm run db:seed             # admin user, sample data, sidebar menus
npm run dev                 # http://localhost:3000
```

`.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | App base URL, e.g. `http://localhost:3000` |

Sign in with the seeded account **`admin@example.com` / `password123`** — change it on shared environments. There is no public sign-up; new users are created at `/users/new`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, serve build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate a SQL migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Sync schema without a migration (local iteration only) |
| `npm run db:seed` | Seed admin user, sample data, and menus |
| `npm run db:studio` | Browse data in Drizzle Studio |

## Project layout

```
src/
├── app/
│   ├── page.tsx              # login
│   ├── auth/                 # sign-in/out, change password, /auth/expired
│   ├── dashboard/
│   ├── users/                # CRUD: multi-page (new / [id] / [id]/edit)
│   ├── countries/ provinces/ cities/   # CRUD: Dialog
│   ├── menus/                # CRUD: Sheet — also the sidebar source
│   └── parameters/           # CRUD: inline side panel
├── components/               # shared UI (ui/, data-table/, data-grid/, filters/)
├── config/site.ts            # app name, tagline, description
├── db/                       # Drizzle client, schema/, seed.ts
├── lib/                      # auth, session (requireUser), navigation, validations
└── proxy.ts                  # optimistic auth redirect (Next.js 16 "middleware")
```

## Customizing

- **Branding:** edit [`src/config/site.ts`](src/config/site.ts).
- **Sidebar:** managed at `/menus` (or `src/db/seed.ts`); icons are lucide-react names registered in [`src/components/app-sidebar.tsx`](src/components/app-sidebar.tsx).
- **New CRUD page:** pick one of the reference features and follow [`AGENTS.md`](AGENTS.md) and [`.agents/rules/new-page-guidelines.md`](.agents/rules/new-page-guidelines.md).

See [`AGENTS.md`](AGENTS.md) for architecture, conventions, and gotchas.
