import { loadEnvConfig } from "@next/env"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { cities, countries, provinces, users } from "./schema"

loadEnvConfig(process.cwd())

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
      .onConflictDoNothing({ target: countries.code })
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
      .onConflictDoNothing({ target: provinces.code })
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
      .onConflictDoNothing({ target: cities.code })
      .returning({ code: cities.code })

    console.log(
      `Seed cities: ${insertedCities.length} baris baru (${SAMPLE_CITIES.length} sample).`
    )
  } finally {
    await pool.end()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
