/**
 * Warna badge (`parameters.textColor` / `bgColor`) adalah hex bebas dari user,
 * dipilih untuk latar TERANG (teks gelap di atas latar pastel). Kalau dipakai
 * apa adanya di dark mode, teks gelap di atas latar pastel yang ikut
 * di-mix ke gelap jadi nyaris tidak terbaca — kontrasnya sengaja didesain
 * untuk arah yang berlawanan.
 *
 * Dua fungsi ini menurunkan pasangan warna terang/redup dari hex APAPUN
 * (lewat HSL) supaya badge tetap "berbicara" dengan hue aslinya tapi
 * kontrasnya benar di atas latar gelap — tanpa perlu tahu nilai hex-nya
 * sebelumnya.
 */

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())

  if (!match) {
    return null
  }

  const raw = match[1]
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw
  const num = parseInt(full, 16)

  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min

  if (d === 0) {
    return [0, 0, l]
  }

  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number

  switch (max) {
    case rn:
      h = ((gn - bn) / d) % 6
      break
    case gn:
      h = (bn - rn) / d + 2
      break
    default:
      h = (rn - gn) / d + 4
  }

  h *= 60
  if (h < 0) h += 360

  return [h, s, l]
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`
}

/**
 * Versi terang dari hue `hex`, dipakai sebagai teks/border di dark mode.
 * Lightness dipatok tinggi & saturasi dijaga minimal supaya tetap kebaca di
 * atas latar gelap apa pun hex aslinya.
 */
export function accentForDark(hex: string): string | undefined {
  const rgb = parseHex(hex)
  if (!rgb) return undefined

  const [h, s] = rgbToHsl(...rgb)

  return hsl(h, Math.max(s, 0.45), 0.75)
}

/** Latar tipis bernuansa hue `hex`, dipakai sebagai background chip di dark mode. */
export function tintForDark(hex: string): string | undefined {
  const rgb = parseHex(hex)
  if (!rgb) return undefined

  const [h, s] = rgbToHsl(...rgb)

  return hsl(h, Math.max(s, 0.35), 0.24)
}
