import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL! });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });

// Kenapa globalThis? Saat `next dev`, hot reload mengevaluasi ulang modul setiap
// kali file disimpan. Kalau new Pool() dipanggil polos, tiap reload membuat
// connection pool baru sementara yang lama tidak ditutup — beberapa menit kemudian
// Postgres menolak koneksi dengan "too many clients already". Menyimpannya di
// globalThis membuat pool yang sama dipakai ulang lintas reload. Di produksi tidak
// ada HMR, jadi tidak perlu disimpan.
//
// Kenapa { schema } dioper ke drizzle()? Ini yang mengaktifkan relational query API
// (db.query.users.findMany(...)). Tanpa itu hanya bisa pakai query builder
// (db.select().from(users)).
//
// Tidak ada opsi `casing` di sini karena nama kolom ditulis manual di schema.
//
// Docs Drizzle memakai `import 'dotenv/config'` di file ini — jangan diikuti.
// Next.js sudah memuat .env sendiri, dan dotenv/config di dalam kode aplikasi bisa
// menimpa env produksi yang di-inject platform hosting.
