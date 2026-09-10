import type { Menu, NewMenu } from "@/db/schema"

/**
 * Field yang diisi user. `level` tidak termasuk — diturunkan dari `parentId`
 * di server. Kolom audit (`createdBy` / `updatedBy` / `deletedBy`) dan
 * `deletedAt` juga bukan urusan form.
 */
export type MenuFormFields = Pick<
  NewMenu,
  | "name"
  | "slug"
  | "icon"
  | "routeName"
  | "routePattern"
  | "parentId"
  | "sortOrder"
  | "layout"
  | "isActive"
>

export type MenuFormErrors = Partial<
  Record<keyof MenuFormFields | "form", string[]>
>

export type MenuActionState = {
  errors?: MenuFormErrors
  values?: MenuFormFields
  ok?: boolean
}

/** Baris list beserta nama induknya — halaman menampilkan nama, bukan id. */
export type MenuListRow = Menu & { parentName: string | null }

/** Opsi induk di form; `level` dipakai untuk indentasi di dropdown. */
export type MenuParentOption = {
  id: number
  name: string
  level: number
  parentId: number | null
}

export type MenuListParams = {
  search: string
  layouts: string[]
  status: string[]
  sort: string
  direction: "asc" | "desc"
  page: number
  perPage: number
}
