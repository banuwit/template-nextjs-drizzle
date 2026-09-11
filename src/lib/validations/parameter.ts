import { z } from "zod"

/**
 * Dipakai bersama oleh create & update parameter. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / uppercase kode / parse JSON) di
 * `src/app/parameters/actions.ts` sebelum di-`safeParse`.
 */
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const hexColor = z
  .string()
  .regex(HEX_COLOR, "Color must be a hex value, e.g. #1D4ED8")
  .max(10, "Color must be at most 10 characters")
  .nullable()

export const parameterFormSchema = z.object({
  group: z
    .string()
    .min(1, "Group is required")
    .max(50, "Group must be at most 50 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(100, "Code must be at most 100 characters")
    .regex(
      /^[A-Z0-9_.-]+$/,
      "Code may only contain uppercase letters, numbers, dots, and underscores",
    ),
  value: z
    .string()
    .min(1, "Value is required")
    .max(150, "Value must be at most 150 characters"),
  description: z.string().max(5000, "Deskripsi terlalu panjang").nullable(),
  textColor: hexColor,
  bgColor: hexColor,
  attributes: z.record(z.string(), z.unknown()).nullable(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .min(0, "Order must be at least 0")
    .max(2147483647, "Order is too large"),
})
