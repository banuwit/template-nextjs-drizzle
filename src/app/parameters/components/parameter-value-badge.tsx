import type { Parameter } from "@/db/schema"

/**
 * `text_color` / `bg_color` disimpan sebagai hex bebas dari user, jadi warnanya
 * tidak bisa jadi class Tailwind (JIT hanya melihat class yang literal di
 * source). Dipasang lewat style inline; kalau kosong, jatuh ke token tema.
 */
export function ParameterValueBadge({
  parameter,
}: {
  parameter: Pick<Parameter, "value" | "textColor" | "bgColor">
}) {
  const hasColor = parameter.textColor || parameter.bgColor

  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium data-[plain]:bg-muted data-[plain]:text-muted-foreground"
      data-plain={hasColor ? undefined : true}
      style={
        hasColor
          ? {
              color: parameter.textColor ?? undefined,
              backgroundColor: parameter.bgColor ?? undefined,
              borderColor: parameter.bgColor ?? undefined,
            }
          : undefined
      }
    >
      {parameter.value}
    </span>
  )
}
