<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guide

This file provides guidance to coding agents (Claude Code and others) when working with code in this repository. `CLAUDE.md` is a symlink to this file.

## Commands

```bash
npm run dev      # next dev — also regenerates the agent-rules block above
npm run build    # next build
npm start        # next start (serve the production build)
npm run lint     # eslint (flat config, no path arg needed)
npx tsc --noEmit # typecheck; there is no `typecheck` script
```

No test runner is configured — there are no test files, no test dependency, and no `test` script. If tests are needed, pick and install a runner first rather than assuming one exists.

## State of the repo

This is a **starter template**. Ada empat referensi CRUD — pilih **salah satu**, jangan dicampur. Sebelum scaffold CRUD baru: baca [.agents/rules/crud-pattern.md](.agents/rules/crud-pattern.md) dan **tanya** keempat opsi (jangan mengasumsikan). Checklist langkah demi langkah: [.agents/rules/new-page-guidelines.md](.agents/rules/new-page-guidelines.md). Penjelasan UX: [crud-pattern-laravel.md](crud-pattern-laravel.md).

- **`src/app/users/`** — CRUD multi-halaman (list / new / `[id]` / `[id]/edit`). Pakai ini kalau create/view/edit butuh URL sendiri.
- **`src/app/countries/`** — CRUD satu halaman; create/view/edit di Dialog, hapus di AlertDialog. Sukses mutasi: `revalidatePath` + `{ ok: true }`, **tanpa** `redirect()`.
- **`src/app/provinces/`** — sama seperti countries, tapi create/view/edit di Sheet (bukan Dialog). Overlay Sheet memblokir klik di belakangnya.
- **`src/app/cities/`** — panel inline (`city-side-panel` + `city-sheets`): body list menyusut (2 kolom), header/breadcrumb tetap penuh lebar. Bukan Sheet. Klik luar tidak menutup — hanya X atau Batal.

`src/app/examples/` adalah demo TanStack Table read-only atas data statis; itu *bukan* konvensi halaman baru.

## Feature folder layout

Every page/feature gets one folder under `src/app/<feature>/`, laid out like `src/app/users/`:

```
src/app/users/
├── page.tsx                 # route: list
├── loading.tsx              # skeleton saat segment loading
├── error.tsx                # error boundary (client; prop `retry`)
├── new/page.tsx             # route: create
├── [id]/page.tsx            # route: view
├── [id]/not-found.tsx       # 404 saat `notFound()` di view/edit
├── [id]/edit/page.tsx       # route: edit
├── actions.ts               # "use server" — semua mutasi (create/update/delete)
├── queries.ts               # semua baca DB (`import "server-only"`, dipanggil dari page.tsx)
├── types/                   # tipe khusus fitur (`UserActionState`, params list, dll)
├── utils/                   # helper murni khusus fitur (parse searchParams, build href)
├── hooks/                   # hook client khusus fitur ("use client")
└── components/              # komponen khusus fitur, prefix nama fitur
```

`src/app/countries/`, `src/app/provinces/`, dan `src/app/cities/` mengikuti kontrak yang sama (`actions.ts` / `queries.ts` / `types/` / `utils/` / `hooks/` / `components/`) **tanpa** `new/` dan `[id]/`. Countries memakai Dialog; provinces memakai Sheet modal; cities memakai panel inline (bukan Sheet).

Rules that make this work:

- **Only route files live at the folder root** (`page.tsx`, plus `actions.ts` / `queries.ts`). Subfolders without a `page.tsx` do not create routes, so `components/`, `hooks/`, `types/`, `utils/` are safe to colocate inside `src/app/`.
- **`actions.ts` writes, `queries.ts` reads.** A page never builds its own Drizzle query inline — it calls a named function from `queries.ts` (e.g. `listUsers`, `getUserById`) so the page stays layout-only.
- **`types/` derives from the schema.** Form field types come from `Pick<NewUser, ...>`, never hand-written — see the note in [src/db/schema/users.ts](src/db/schema/users.ts).
- **Feature-local vs shared:** helpers used by one feature go in that feature's `utils/`; helpers every feature needs go in `src/lib/` (e.g. [src/lib/db-errors.ts](src/lib/db-errors.ts) `isUniqueViolation`, [src/lib/form.ts](src/lib/form.ts) `toFieldErrors`). Same split for `components/` vs `src/components/`.
- **Component names are prefixed with the feature** (`user-table.tsx`, `user-form.tsx`) so they stay unambiguous when imported elsewhere.
- **Validation schemas live in `src/lib/validations/<feature>.ts`**, shared by create and edit.

### Form + mutation pattern

`src/app/users` establishes the pattern for forms; follow it rather than inventing another:

- Server action signature is `(prevState, formData) => Promise<UserActionState>`, driven by `useActionState`. Prefix `ActionState` dengan nama fitur (`UserActionState`, bukan `ActionState`) supaya tidak tabrakan saat fitur kedua di-copy. Bind extra args with `.bind(null, id)` (see [\[id\]/edit/page.tsx](src/app/users/[id]/edit/page.tsx)).
- Validate with zod inside the action and return `z.flattenError(err).fieldErrors`; return the submitted `values` too so the form can repopulate inputs after a failure.
- Render errors with `<FieldError errors={toFieldErrors(...)}>` — there is no `ui/form.tsx` / react-hook-form in this project.
- `revalidatePath()` then `redirect()` on success **untuk CRUD multi-halaman** (`users`). `redirect()` throws internally, so call it **outside** any `try` block. CRUD overlay (`countries` Dialog, `provinces` Sheet, `cities` panel inline) tidak `redirect()` — return `{ ok: true }` lalu tutup overlay/panel di client.
- Catch unique-constraint clashes with `isUniqueViolation(error)` and turn them into a field error instead of a 500.
- **A `Button` that renders a `Link` needs `nativeButton={false}`.** Base UI's `Button` defaults `nativeButton` to `true`; rendering an `<a>` without flipping it logs *"A component that acts as a button expected a native `<button>`"* and drops the `role="button"`/keyboard semantics. Vendored [ui/pagination.tsx](src/components/ui/pagination.tsx) does the same thing. This applies only to Base UI `Button` — `DropdownMenuItem` (Menu.Item) already defaults to `false`, and `SidebarMenuButton` doesn't use the prop.
- `<Button disabled render={<Link/>}>` renders `<a disabled>`, which browsers ignore — when a link-button must be inert, render a plain `<button disabled>` instead (see [components/user-pagination.tsx](src/app/users/components/user-pagination.tsx)).
- `queries.ts` starts with `import "server-only"` so a client import fails at build time. Wrap `getXById` in `React.cache()` so `generateMetadata` and the page share one query.
- Export `metadata` or `generateMetadata` on every page. Copy UI fitur ini bahasa Indonesia; nama fitur di nav/breadcrumb tetap "Users" (cocok dengan sidebar).

## Data layer (Drizzle + PostgreSQL)

`drizzle-orm@0.45.2` + `drizzle-kit@0.31.10`, dialect `postgresql`, driver `pg`. Pinned to the **stable** line on purpose — the get-started docs suggest `@rc` (v1), whose API differs (`snakeCase.table()`, `defineRelations()`); don't upgrade casually.

```bash
npm run db:generate   # write a new SQL migration into drizzle/ (database untouched)
npm run db:migrate    # apply pending migrations
npm run db:push       # sync schema straight to the DB, no migration file — local iteration only
npm run db:studio     # browse/edit rows in a GUI
```

- **Schema lives in `src/db/schema/` as a folder**, re-exported from `src/db/schema/index.ts`. `drizzle.config.ts` points at that barrel, so a table missing from it is silently skipped by migrations.
- **Column names are written by hand**, not derived via the `casing` option: single-word properties may go bare (`name`, `email`), multi-word ones must pass an explicit snake_case argument (`createdAt: timestamp("created_at")`). Nothing enforces this — check the generated SQL before committing.
- **`src/db/index.ts` caches the `pg` Pool on `globalThis` in development.** Without it, every hot reload leaks a pool until Postgres refuses connections. Keep that pattern if you touch the file.
- **`drizzle.config.ts` loads env via `@next/env`, not `dotenv`**, so drizzle-kit resolves `.env.local` / `.env` in the same order `next dev` does.
- **Pages that query the database need `export const dynamic = "force-dynamic"`**, otherwise `next build` prerenders them and freezes the query result. Verify with the build output: the route should be `ƒ`, not `○`.
- `drizzle/` — including `drizzle/meta/` — is committed; deleting it corrupts future migration diffs. `.env` is gitignored, `.env.example` is not.

## Stack specifics that differ from older Next.js

- **Next.js 16.3.3 / React 19.2** — App Router under `src/app/`. See the mandatory doc-reading rule above; the shipped docs live in `node_modules/next/dist/docs/` (`01-app/` for App Router).
- **React Compiler is enabled** ([next.config.ts](next.config.ts) `reactCompiler: true`, via `babel-plugin-react-compiler`). Don't hand-add `useMemo`/`useCallback`/`memo` for performance — the compiler handles memoization.
- **Generated route types are global**: [layout.tsx](src/app/layout.tsx) uses `LayoutProps<"/">` with no import. Use `LayoutProps<Route>` / `PageProps<Route>` from `.next/types` rather than hand-writing `params`/`searchParams` prop types. These types only exist after `next dev` or `next build` has run.
- **Tailwind v4**, configured entirely in CSS — `@import "tailwindcss"` plus an `@theme inline` block in [globals.css](src/app/globals.css). There is no `tailwind.config.js`; add design tokens as CSS variables in `:root` and expose them through `@theme inline`.
- **ESLint 9 flat config** in [eslint.config.mjs](eslint.config.mjs), composing `eslint-config-next/core-web-vitals` and `/typescript`.
- Import alias: `@/*` → `./src/*`.

## Skills

`.agents/skills/` holds vendored third-party skills (shadcn, frontend-design, tailwind-design-system, ui-ux-pro-max, vercel-react-best-practices, and others), pinned in [skills-lock.json](skills-lock.json) by source repo and content hash. `.claude/skills/*` are symlinks into it — edit neither by hand; re-pull from source and update the lock instead.
