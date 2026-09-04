/** Turn a snake_case column id into a Title Cased label, e.g. "sort_order" → "Sort Order". */
export function formatColumnId(id: string) {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
