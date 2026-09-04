import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    casing: "snake_case",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
});

// schema menunjuk ke barrel file. Karena src/db/schema/ Anda adalah folder (bukan satu file schema.ts seperti di docs), semua tabel harus di-export ulang dari index.ts supaya drizzle-kit melihatnya. Tabel yang lupa di-export tidak akan ikut ter-migrasi — ini sumber bug yang paling sering.
// out adalah folder tempat file SQL migrasi ditulis. Folder drizzle/ ini harus di-commit ke git, termasuk subfolder drizzle/meta/ — di situlah drizzle-kit menyimpan snapshot untuk menghitung diff migrasi berikutnya. Menghapusnya membuat generate berikutnya salah.
// casing: "snake_case" membuat properti createdAt di TypeScript otomatis dipetakan ke kolom created_at di Postgres, tanpa perlu menulis nama kolom satu per satu. Nilai ini harus sama persis dengan yang dioper ke drizzle() di Langkah 7 — kalau berbeda, migrasi dan query akan menunjuk nama kolom yang berlainan.
// strict: true membuat drizzle-kit minta konfirmasi sebelum menjalankan perintah destruktif.