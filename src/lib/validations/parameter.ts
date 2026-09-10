import { z } from "zod"

/**
 * Dipakai bersama oleh create & update parameter. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / uppercase kode / parse JSON) di
 * `src/app/parameters/actions.ts` sebelum di-`safeParse`.
 */
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const hexColor = z
  .string()
  .regex(HEX_COLOR, "Warna harus format hex, mis. #1D4ED8")
  .max(10, "Warna maksimal 10 karakter")
  .nullable()

export const parameterFormSchema = z.object({
  group: z
    .string()
    .min(1, "Grup wajib diisi")
    .max(50, "Grup maksimal 50 karakter"),
  code: z
    .string()
    .min(1, "Kode wajib diisi")
    .max(100, "Kode maksimal 100 karakter")
    .regex(
      /^[A-Z0-9_.-]+$/,
      "Kode hanya boleh huruf kapital, angka, titik, dan underscore",
    ),
  value: z
    .string()
    .min(1, "Nilai wajib diisi")
    .max(150, "Nilai maksimal 150 karakter"),
  description: z.string().max(5000, "Deskripsi terlalu panjang").nullable(),
  textColor: hexColor,
  bgColor: hexColor,
  attributes: z.record(z.string(), z.unknown()).nullable(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z
    .number("Urutan harus berupa angka")
    .int("Urutan harus bilangan bulat")
    .min(0, "Urutan minimal 0")
    .max(2147483647, "Urutan terlalu besar"),
})
