# Template Rules — Next.js + ORM

## Rules
- Gunakan `src/`.
- `app/` untuk routing.
- `db/` untuk koneksi ORM dan schema — bukan tempat query halaman.
- UI tidak boleh mengakses ORM langsung. Page memanggil fungsi bernama di `queries.ts` milik fitur.

## Struktur

```text
src/
├── app/            # rute + colocation per fitur (lihat src/app/users/)
├── components/     # UI bersama (shadcn, layout, heading)
├── db/             # koneksi + schema
├── hooks/          # hook bersama (bukan hook satu fitur)
└── lib/            # helper bersama (validations, db-errors, form)
```

Query, action, tipe, dan komponen satu fitur tinggal di `src/app/<feature>/` — pola lengkapnya di [AGENTS.md](../../AGENTS.md) dan `src/app/users/`.

## ORM Layer

```text
src/db/
├── index.ts        # Pool + drizzle client
└── schema/         # tabel, di-export dari schema/index.ts
```

Baca/tulis data per fitur:

```text
src/app/<feature>/
├── queries.ts      # baca — wajib `import "server-only"`
└── actions.ts      # tulis — `"use server"`
```

Jangan buat `src/db/queries/`. Colocation di folder fitur lebih mudah di-copy untuk halaman baru, dan tetap memenuhi aturan UI tidak import `db`.

## Migrasi ke Backend API (Optional)

```text
src/db
```

menjadi

```text
src/services
```
