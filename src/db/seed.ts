import { loadEnvConfig } from "@next/env"
import { hashPassword } from "better-auth/crypto"
import { and, eq, inArray } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import {
  accounts,
  cities,
  countries,
  menus,
  parameters,
  provinces,
  users,
} from "./schema"

loadEnvConfig(process.cwd())

/** Akun login untuk development. Ganti password segera di lingkungan bersama. */
const ADMIN_USER = { name: "Administrator", email: "admin@example.com" }
const DEFAULT_PASSWORD = "password123"

const SAMPLE_USERS = [
  { name: "Budi Santoso", email: "budi.santoso@example.com" },
  { name: "Siti Rahayu", email: "siti.rahayu@example.com" },
  { name: "Agus Wijaya", email: "agus.wijaya@example.com" },
  { name: "Dewi Lestari", email: "dewi.lestari@example.com" },
  { name: "Eko Prasetyo", email: "eko.prasetyo@example.com" },
  { name: "Rina Kusuma", email: "rina.kusuma@example.com" },
  { name: "Andi Pratama", email: "andi.pratama@example.com" },
  { name: "Maya Sari", email: "maya.sari@example.com" },
  { name: "Hendra Gunawan", email: "hendra.gunawan@example.com" },
  { name: "Lina Marlina", email: "lina.marlina@example.com" },
  { name: "Fajar Nugroho", email: "fajar.nugroho@example.com" },
  { name: "Putri Ayu", email: "putri.ayu@example.com" },
  { name: "Dimas Saputra", email: "dimas.saputra@example.com" },
  { name: "Anisa Fitri", email: "anisa.fitri@example.com" },
  { name: "Rizky Maulana", email: "rizky.maulana@example.com" },
  { name: "Wulan Handayani", email: "wulan.handayani@example.com" },
  { name: "Yoga Permana", email: "yoga.permana@example.com" },
  { name: "Citra Anggraini", email: "citra.anggraini@example.com" },
  { name: "Bayu Kurniawan", email: "bayu.kurniawan@example.com" },
  { name: "Nia Septiani", email: "nia.septiani@example.com" },
] as const

const SAMPLE_COUNTRIES = [
  { name: "Indonesia", code: "ID" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Thailand", code: "TH" },
  { name: "Vietnam", code: "VN" },
  { name: "Philippines", code: "PH" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Australia", code: "AU" },
  { name: "New Zealand", code: "NZ" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Netherlands", code: "NL" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Brazil", code: "BR" },
] as const

const SAMPLE_PROVINCES = [
  { name: "Aceh", code: "AC" },
  { name: "Sumatera Utara", code: "SU" },
  { name: "Sumatera Barat", code: "SB" },
  { name: "Riau", code: "RI" },
  { name: "Jambi", code: "JA" },
  { name: "Sumatera Selatan", code: "SS" },
  { name: "Bengkulu", code: "BE" },
  { name: "Lampung", code: "LA" },
  { name: "Kepulauan Bangka Belitung", code: "BB" },
  { name: "Kepulauan Riau", code: "KR" },
  { name: "DKI Jakarta", code: "JK" },
  { name: "Jawa Barat", code: "JB" },
  { name: "Jawa Tengah", code: "JT" },
  { name: "DI Yogyakarta", code: "YO" },
  { name: "Jawa Timur", code: "JI" },
  { name: "Banten", code: "BT" },
  { name: "Bali", code: "BA" },
  { name: "Nusa Tenggara Barat", code: "NB" },
  { name: "Nusa Tenggara Timur", code: "NT" },
  { name: "Kalimantan Barat", code: "KB" },
] as const

const SAMPLE_CITIES = [
  { name: "Jakarta", code: "JK" },
  { name: "Bandung", code: "BD" },
  { name: "Surabaya", code: "SR" },
  { name: "Medan", code: "MD" },
  { name: "Semarang", code: "SM" },
  { name: "Yogyakarta", code: "YG" },
  { name: "Makassar", code: "MK" },
  { name: "Palembang", code: "PL" },
  { name: "Denpasar", code: "DN" },
  { name: "Balikpapan", code: "BL" },
  { name: "Malang", code: "ML" },
  { name: "Bogor", code: "BG" },
  { name: "Depok", code: "DP" },
  { name: "Tangerang", code: "TG" },
  { name: "Bekasi", code: "BK" },
  { name: "Padang", code: "PD" },
  { name: "Pekanbaru", code: "PB" },
  { name: "Banjarmasin", code: "BJ" },
  { name: "Pontianak", code: "PN" },
  { name: "Manado", code: "MN" },
] as const

const SAMPLE_PARAMETERS = [
  {
    group: "order_status",
    code: "ORDER_DRAFT",
    value: "Draft",
    description: "Pesanan belum dikirim ke gudang.",
    textColor: "#374151",
    bgColor: "#E5E7EB",
    isSystem: true,
    sortOrder: 0,
  },
  {
    group: "order_status",
    code: "ORDER_PAID",
    value: "Sudah dibayar",
    description: "Pembayaran diterima penuh.",
    textColor: "#065F46",
    bgColor: "#D1FAE5",
    attributes: { icon: "check" },
    isSystem: true,
    sortOrder: 1,
  },
  {
    group: "order_status",
    code: "ORDER_CANCELLED",
    value: "Dibatalkan",
    textColor: "#991B1B",
    bgColor: "#FEE2E2",
    sortOrder: 2,
  },
  {
    group: "payment_method",
    code: "PAY_CASH",
    value: "Tunai",
    sortOrder: 3,
  },
  {
    group: "payment_method",
    code: "PAY_TRANSFER",
    value: "Transfer bank",
    attributes: { requires_proof: true },
    sortOrder: 4,
  },
  {
    group: "payment_method",
    code: "PAY_CARD",
    value: "Kartu kredit",
    description: "Nonaktif sementara.",
    isActive: false,
    sortOrder: 5,
  },
  {
    group: "priority",
    code: "PRIORITY_LOW",
    value: "Rendah",
    textColor: "#1E40AF",
    bgColor: "#DBEAFE",
    sortOrder: 6,
  },
  {
    group: "priority",
    code: "PRIORITY_HIGH",
    value: "Tinggi",
    textColor: "#9A3412",
    bgColor: "#FFEDD5",
    sortOrder: 7,
  },
] as const

/**
 * Menu contoh, mencerminkan sidebar yang sekarang di-hardcode di
 * `src/components/app-sidebar.tsx`. `parentSlug` diterjemahkan ke `parent_id`
 * saat seed berjalan — id-nya belum diketahui sebelum induknya di-insert.
 */
const SAMPLE_MENUS = [
  { name: "Dashboard", slug: "dashboard", icon: "LayoutDashboardIcon", routeName: "/dashboard", parentSlug: null },
  { name: "Master Data", slug: "master-data", icon: "DatabaseIcon", routeName: null, parentSlug: null },
  { name: "Users", slug: "users", icon: "UsersIcon", routeName: "/users", parentSlug: "master-data" },
  { name: "Countries", slug: "countries", icon: "GlobeIcon", routeName: "/countries", parentSlug: "master-data" },
  { name: "Provinces", slug: "provinces", icon: "MapPinnedIcon", routeName: "/provinces", parentSlug: "master-data" },
  { name: "Cities", slug: "cities", icon: "Building2Icon", routeName: "/cities", parentSlug: "master-data" },
  { name: "Parameters", slug: "parameters", icon: "SlidersHorizontalIcon", routeName: "/parameters", parentSlug: "master-data" },
  { name: "Menus", slug: "menus", icon: "MenuIcon", routeName: "/menus", parentSlug: "master-data" },
] as const

async function seed() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL belum di-set. Isi .env dulu.")
  }

  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool)

  try {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const insertedUsers = await db
      .insert(users)
      .values(
        SAMPLE_USERS.map((user, index) => ({
          ...user,
          createdAt: new Date(now - (SAMPLE_USERS.length - 1 - index) * day),
        }))
      )
      .onConflictDoNothing({ target: users.email })
      .returning({ email: users.email })

    await db
      .insert(users)
      .values(ADMIN_USER)
      .onConflictDoNothing({ target: users.email })

    // Akun credential untuk admin + sample users yang belum punya password.
    // Hash memakai hasher Better Auth supaya bisa diverifikasi saat login.
    const seededEmails = [ADMIN_USER.email, ...SAMPLE_USERS.map((u) => u.email)]
    const seededUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.email, seededEmails))
    const withPassword = await db
      .select({ userId: accounts.userId })
      .from(accounts)
      .where(
        and(
          eq(accounts.providerId, "credential"),
          inArray(
            accounts.userId,
            seededUsers.map((u) => u.id)
          )
        )
      )
    const hasPassword = new Set(withPassword.map((a) => a.userId))
    const missing = seededUsers.filter((u) => !hasPassword.has(u.id))

    if (missing.length > 0) {
      const passwordHash = await hashPassword(DEFAULT_PASSWORD)

      await db.insert(accounts).values(
        missing.map((u) => ({
          userId: u.id,
          accountId: String(u.id),
          providerId: "credential",
          password: passwordHash,
        }))
      )
    }

    console.log(
      `Seed accounts: ${missing.length} password baru (login: ${ADMIN_USER.email} / ${DEFAULT_PASSWORD}).`
    )

    const insertedCountries = await db
      .insert(countries)
      .values(
        SAMPLE_COUNTRIES.map((country, index) => ({
          ...country,
          createdAt: new Date(
            now - (SAMPLE_COUNTRIES.length - 1 - index) * day
          ),
        }))
      )
      // Tanpa `target`: `code` dijaga partial unique index (WHERE deleted_at IS
      // NULL), dan ON CONFLICT (code) tanpa predikat yang sama ditolak Postgres.
      .onConflictDoNothing()
      .returning({ code: countries.code })

    console.log(
      `Seed users: ${insertedUsers.length} baris baru (${SAMPLE_USERS.length} sample).`
    )
    console.log(
      `Seed countries: ${insertedCountries.length} baris baru (${SAMPLE_COUNTRIES.length} sample).`
    )

    const insertedProvinces = await db
      .insert(provinces)
      .values(
        SAMPLE_PROVINCES.map((province, index) => ({
          ...province,
          createdAt: new Date(
            now - (SAMPLE_PROVINCES.length - 1 - index) * day
          ),
        }))
      )
      .onConflictDoNothing()
      .returning({ code: provinces.code })

    console.log(
      `Seed provinces: ${insertedProvinces.length} baris baru (${SAMPLE_PROVINCES.length} sample).`
    )

    const insertedCities = await db
      .insert(cities)
      .values(
        SAMPLE_CITIES.map((city, index) => ({
          ...city,
          createdAt: new Date(now - (SAMPLE_CITIES.length - 1 - index) * day),
        }))
      )
      .onConflictDoNothing()
      .returning({ code: cities.code })

    console.log(
      `Seed cities: ${insertedCities.length} baris baru (${SAMPLE_CITIES.length} sample).`
    )

    const insertedParameters = await db
      .insert(parameters)
      .values(
        SAMPLE_PARAMETERS.map((parameter, index) => ({
          ...parameter,
          createdAt: new Date(
            now - (SAMPLE_PARAMETERS.length - 1 - index) * day
          ),
        }))
      )
      .onConflictDoNothing()
      .returning({ code: parameters.code })

    console.log(
      `Seed parameters: ${insertedParameters.length} baris baru (${SAMPLE_PARAMETERS.length} sample).`
    )

    // Dua tahap: induk dulu supaya `parent_id` anaknya bisa diisi. `level`
    // diturunkan dari induk, sama seperti yang dilakukan `actions.ts`.
    const existingMenus = await db
      .select({ id: menus.id, slug: menus.slug })
      .from(menus)
    const menuIdBySlug = new Map(
      existingMenus.map((menu) => [menu.slug as string, menu.id])
    )

    let insertedMenuCount = 0

    for (const [index, menu] of SAMPLE_MENUS.entries()) {
      if (menuIdBySlug.has(menu.slug)) continue

      const parentId = menu.parentSlug
        ? (menuIdBySlug.get(menu.parentSlug) ?? null)
        : null

      const [inserted] = await db
        .insert(menus)
        .values({
          name: menu.name,
          slug: menu.slug,
          icon: menu.icon,
          routeName: menu.routeName,
          routePattern: menu.routeName ? `${menu.routeName}*` : null,
          parentId,
          level: parentId === null ? 0 : 1,
          sortOrder: index,
          createdAt: new Date(now - (SAMPLE_MENUS.length - 1 - index) * day),
        })
        .onConflictDoNothing()
        .returning({ id: menus.id, slug: menus.slug })

      if (inserted) {
        menuIdBySlug.set(inserted.slug, inserted.id)
        insertedMenuCount += 1
      }
    }

    console.log(
      `Seed menus: ${insertedMenuCount} baris baru (${SAMPLE_MENUS.length} sample).`
    )
  } finally {
    await pool.end()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
