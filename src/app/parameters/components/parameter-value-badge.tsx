import { cn } from "cn"

import type { Parameter } from "@/db/schema"
import { accentForDark, tintForDark } from "@/lib/color"

/**
 * `text_color` / `bg_color` disimpan sebagai hex bebas dari user, jadi warnanya
 * tidak bisa jadi class Tailwind (JIT hanya melihat class yang literal di
 * source). Nilainya dioper lewat custom property (`--pb-*`) di `style`, BUKAN
 * properti `color`/`background-color` langsung — inline style selalu menang
 * atas class lewat specificity, jadi varian `dark:` di bawah tidak akan
 * pernah bisa meng-override kalau warnanya dipasang langsung.
 *
 * Hex yang dipilih user didesain untuk latar TERANG (teks gelap di atas
 * pastel) — dipakai apa adanya di dark mode, jadi nyaris tidak terbaca. Di
 * dark mode dipakai pasangan warna lain yang diturunkan dari hue yang sama
 * (`accentForDark`/`tintForDark`, lihat `src/lib/color.ts`): teks terang +
 * latar tipis, supaya tetap "berbicara" dengan warna aslinya tapi kontrasnya
 * benar di atas latar gelap.
 */
export function ParameterValueBadge({
  parameter,
}: {
  parameter: Pick<Parameter, "value" | "textColor" | "bgColor">
}) {
  const hasColor = Boolean(parameter.textColor || parameter.bgColor)
  const hueSource = parameter.textColor ?? parameter.bgColor ?? undefined

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        hasColor
          ? [
              "border-transparent text-(--pb-fg) bg-(--pb-bg)",
              "dark:text-(--pb-fg-dark) dark:bg-(--pb-bg-dark) dark:border-(--pb-fg-dark)/20",
            ]
          : "bg-muted text-muted-foreground",
      )}
      style={
        hasColor
          ? ({
              "--pb-fg": parameter.textColor ?? "var(--foreground)",
              "--pb-bg": parameter.bgColor ?? "var(--background)",
              "--pb-fg-dark": hueSource
                ? accentForDark(hueSource)
                : "var(--foreground)",
              "--pb-bg-dark": hueSource
                ? tintForDark(hueSource)
                : "var(--muted)",
            } as React.CSSProperties)
          : undefined
      }
    >
      {parameter.value}
    </span>
  )
}
