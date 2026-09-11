import { cn } from "cn"

import type { Parameter } from "@/db/schema"

/**
 * `text_color` / `bg_color` disimpan sebagai hex bebas dari user, jadi warnanya
 * tidak bisa jadi class Tailwind (JIT hanya melihat class yang literal di
 * source). Nilainya dioper lewat custom property (`--pb-fg`/`--pb-bg`) di
 * `style`, BUKAN properti `color`/`background-color` langsung — inline style
 * selalu menang atas class lewat specificity, jadi varian `dark:` di bawah
 * tidak akan pernah bisa meng-override kalau warnanya dipasang langsung.
 *
 * Di dark mode, warna dicampur (`color-mix`) ke arah `--background`/`white`
 * lewat `color-mix()` supaya hex terang pilihan user (mis. latar pastel untuk
 * light mode) tidak "meledak" kontrasnya di atas halaman gelap.
 */
export function ParameterValueBadge({
  parameter,
}: {
  parameter: Pick<Parameter, "value" | "textColor" | "bgColor">
}) {
  const hasColor = Boolean(parameter.textColor || parameter.bgColor)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        hasColor
          ? [
              "border-transparent text-(--pb-fg) bg-(--pb-bg)",
              "dark:[color:color-mix(in_oklab,var(--pb-fg)_85%,white)]",
              "dark:[background-color:color-mix(in_oklab,var(--pb-bg)_35%,var(--background))]",
              "dark:[border-color:color-mix(in_oklab,var(--pb-bg)_55%,var(--background))]",
            ]
          : "bg-muted text-muted-foreground",
      )}
      style={
        hasColor
          ? ({
              "--pb-fg": parameter.textColor ?? "var(--foreground)",
              "--pb-bg": parameter.bgColor ?? "var(--background)",
            } as React.CSSProperties)
          : undefined
      }
    >
      {parameter.value}
    </span>
  )
}
