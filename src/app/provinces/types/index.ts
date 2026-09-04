import type { NewProvince } from "@/db/schema"

export type ProvinceFormFields = Pick<NewProvince, "name" | "code">

export type ProvinceFormErrors = Partial<
  Record<keyof ProvinceFormFields | "form", string[]>
>

export type ProvinceActionState = {
  errors?: ProvinceFormErrors
  values?: ProvinceFormFields
  ok?: boolean
}

export type ProvinceListParams = {
  q: string
  page: number
}
