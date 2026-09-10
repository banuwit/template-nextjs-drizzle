import type { MenuParentOption } from "../types"

/**
 * Id sebuah menu beserta seluruh turunannya, dihitung dari daftar opsi induk.
 *
 * Dipakai form untuk menyembunyikan pilihan induk yang pasti ditolak server
 * (menu tidak boleh jadi induk dirinya sendiri atau turunannya).
 */
export function collectSubtreeIds(
  options: MenuParentOption[],
  id: number,
): number[] {
  const collected = [id]

  for (let index = 0; index < collected.length; index += 1) {
    const current = collected[index]

    options.forEach((option) => {
      if (option.parentId === current && !collected.includes(option.id)) {
        collected.push(option.id)
      }
    })
  }

  return collected
}
