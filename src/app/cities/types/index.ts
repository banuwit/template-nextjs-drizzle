import type { NewCity } from "@/db/schema"

export type CityFormFields = Pick<NewCity, "name" | "code">

export type CityFormErrors = Partial<
  Record<keyof CityFormFields | "form", string[]>
>

export type CityActionState = {
  errors?: CityFormErrors
  values?: CityFormFields
  ok?: boolean
}

export type CityListParams = {
  q: string
  page: number
}
