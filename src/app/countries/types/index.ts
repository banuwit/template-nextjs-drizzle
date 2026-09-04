import type { NewCountry } from "@/db/schema"

export type CountryFormFields = Pick<NewCountry, "name" | "code">

export type CountryFormErrors = Partial<
  Record<keyof CountryFormFields | "form", string[]>
>

export type CountryActionState = {
  errors?: CountryFormErrors
  values?: CountryFormFields
  ok?: boolean
}

export type CountryListParams = {
  q: string
  page: number
}
