/**
 * Inisial dari sebuah nama untuk `AvatarFallback` — "Andi Pratama" → "AP".
 *
 * Hanya kata pertama dan terakhir yang dipakai supaya nama panjang tidak
 * menghasilkan empat huruf yang tidak muat di avatar.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return "?"
  }

  const first = words[0]!.charAt(0)
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : ""

  return (first + last).toUpperCase()
}
