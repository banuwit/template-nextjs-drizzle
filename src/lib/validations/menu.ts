import { z } from "zod"

/**
 * Dipakai bersama oleh create & update menu. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / slugify / kosong jadi null) di
 * `src/app/menus/actions.ts` sebelum di-`safeParse`.
 *
 * `level` tidak ada di sini: nilainya diturunkan dari `parentId` di server,
 * bukan diisi user.
 */
const optionalText = (max: number, label: string) =>
  z.string().max(max, `${label} maksimal ${max} karakter`).nullable()

export const menuFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(255, "Nama maksimal 255 karakter"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .max(255, "Slug maksimal 255 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  icon: optionalText(255, "Ikon"),
  routeName: optionalText(255, "Nama route"),
  routePattern: optionalText(255, "Pola route"),
  // uuid menu induk (lihat `identityColumns` di src/db/schema/columns.ts).
  parentId: z.uuid("Menu induk tidak valid").nullable(),
  sortOrder: z
    .number("Urutan harus berupa angka")
    .int("Urutan harus bilangan bulat")
    .min(0, "Urutan minimal 0")
    .max(2147483647, "Urutan terlalu besar"),
  layout: z
    .string()
    .min(1, "Layout wajib diisi")
    .max(255, "Layout maksimal 255 karakter"),
  isActive: z.boolean(),
})

/** Ubah teks bebas jadi slug: huruf kecil, spasi/simbol jadi tanda hubung. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
