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
  z.string().max(max, `${label} must be at most ${max} characters`).nullable()

export const menuFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be at most 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and hyphens",
    ),
  icon: optionalText(255, "Icon"),
  routeName: optionalText(255, "Route name"),
  routePattern: optionalText(255, "Route pattern"),
  // uuid menu induk (lihat `identityColumns` di src/db/schema/columns.ts).
  parentId: z.uuid("Invalid parent menu").nullable(),
  sortOrder: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .min(0, "Order must be at least 0")
    .max(2147483647, "Order is too large"),
  layout: z
    .string()
    .min(1, "Layout is required")
    .max(255, "Layout must be at most 255 characters"),
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
