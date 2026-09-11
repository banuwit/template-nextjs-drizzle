import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import * as schema from "@/db/schema"

/**
 * Konfigurasi Better Auth. Satu-satunya tempat library ini dikonfigurasi;
 * route handler `src/app/api/auth/[...all]/route.ts`, server action di
 * `src/app/auth/actions.ts`, dan DAL `src/lib/session.ts` semuanya memakai
 * instance ini.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    // Model `user` → export `users`, `session` → `sessions`, dst.
    usePlural: true,
    schema,
  }),
  advanced: {
    // Semua id (users.id = kolom uuid, sessions/accounts/verifications.id)
    // dibuat Postgres lewat `uuidv7()`. Jangan pakai "uuid": transform-nya
    // membuang nilai id dan regex-nya menolak UUID versi 7.
    database: { generateId: false },
  },
  user: {
    additionalFields: {
      // Dibaca oleh requireUser() untuk menolak user yang di-soft-delete.
      deletedAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // User yang di-soft-delete tidak boleh login lagi: `false` membatalkan
        // pembuatan sesi, sehingga signInEmail gagal dengan APIError.
        before: async (session) => {
          const [user] = await db
            .select({ deletedAt: schema.users.deletedAt })
            .from(schema.users)
            .where(eq(schema.users.id, session.userId))
            .limit(1)

          if (!user || user.deletedAt) {
            return false
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Tidak ada registrasi publik: akun dibuat admin lewat /users/new.
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // perpanjang paling sering sekali sehari
  },
  // Harus plugin terakhir: meneruskan Set-Cookie dari auth.api.* ke cookies()
  // Next.js supaya login/logout dari Server Action benar-benar menulis cookie.
  plugins: [nextCookies()],
})
