import type { NewParameter } from "@/db/schema"

/**
 * Field yang bisa diisi user. Diturunkan dari schema (`Pick<NewParameter, …>`)
 * — jangan ditulis tangan. Kolom audit (`createdBy`, `updatedBy`, `deletedBy`)
 * dan `deletedAt` tidak masuk sini: itu diisi server, bukan form.
 */
export type ParameterFormFields = Pick<
  NewParameter,
  | "group"
  | "code"
  | "value"
  | "description"
  | "textColor"
  | "bgColor"
  | "attributes"
  | "isSystem"
  | "isActive"
  | "sortOrder"
>

/**
 * Bentuk yang dipakai form untuk repopulate input setelah gagal validasi.
 * `attributes` di sini masih string mentah (isi textarea), bukan objek —
 * kalau JSON-nya invalid, objeknya memang belum ada.
 */
export type ParameterFormValues = Omit<ParameterFormFields, "attributes"> & {
  attributes: string
}

export type ParameterFormErrors = Partial<
  Record<keyof ParameterFormFields | "form", string[]>
>

export type ParameterActionState = {
  errors?: ParameterFormErrors
  values?: ParameterFormValues
  ok?: boolean
}
