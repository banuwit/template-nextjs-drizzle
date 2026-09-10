"use client"

import { useActionState, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { toFieldErrors } from "@/lib/form"
import { slugify } from "@/lib/validations/menu"

import type {
  MenuActionState,
  MenuFormFields,
  MenuParentOption,
} from "../types"

import { MenuSwitchField } from "./menu-switch-field"

export function MenuForm({
  action,
  defaultValues,
  parentOptions,
  layouts,
  submitLabel,
  successTitle,
  onClose,
}: {
  action: (
    prevState: MenuActionState,
    formData: FormData,
  ) => Promise<MenuActionState>
  defaultValues?: Partial<MenuFormFields>
  /** Kandidat induk, sudah dibuang menu ini sendiri beserta turunannya. */
  parentOptions: MenuParentOption[]
  layouts: string[]
  submitLabel: string
  successTitle: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<
    MenuActionState,
    FormData
  >(action, {})

  const [name, setName] = useState(defaultValues?.name ?? "")
  const [slug, setSlug] = useState(defaultValues?.slug ?? "")
  // Selama user belum menyentuh slug, slug mengikuti nama. Begitu diketik
  // manual, nama berhenti menimpanya.
  const [slugTouched, setSlugTouched] = useState(
    Boolean(defaultValues?.slug),
  )

  useEffect(() => {
    if (!state.ok) {
      return
    }

    toast.add({
      type: "success",
      title: successTitle,
      description: state.values
        ? `${state.values.name} tersimpan.`
        : undefined,
    })
    onClose()
  }, [state.ok, state.values, successTitle, onClose])

  const values = state.errors ? state.values : undefined
  const errors = state.errors

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors?.name ? true : undefined}>
          <FieldLabel htmlFor="menu-name">Nama</FieldLabel>
          <Input
            id="menu-name"
            name="name"
            placeholder="Master Data"
            autoComplete="off"
            maxLength={255}
            aria-invalid={errors?.name ? true : undefined}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (!slugTouched) setSlug(slugify(event.target.value))
            }}
          />
          <FieldError errors={toFieldErrors(errors?.name)} />
        </Field>

        <Field data-invalid={errors?.slug ? true : undefined}>
          <FieldLabel htmlFor="menu-slug">Slug</FieldLabel>
          <Input
            id="menu-slug"
            name="slug"
            placeholder="master-data"
            autoComplete="off"
            maxLength={255}
            aria-invalid={errors?.slug ? true : undefined}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
          />
          <FieldDescription>
            Unik. Otomatis mengikuti nama sampai diubah manual.
          </FieldDescription>
          <FieldError errors={toFieldErrors(errors?.slug)} />
        </Field>

        <Field data-invalid={errors?.parentId ? true : undefined}>
          <FieldLabel htmlFor="menu-parent">Menu induk</FieldLabel>
          <NativeSelect
            id="menu-parent"
            name="parentId"
            className="w-full"
            defaultValue={String(
              values?.parentId ?? defaultValues?.parentId ?? "",
            )}
            aria-invalid={errors?.parentId ? true : undefined}
          >
            <NativeSelectOption value="">
              — Tanpa induk (menu utama) —
            </NativeSelectOption>
            {parentOptions.map((option) => (
              <NativeSelectOption key={option.id} value={String(option.id)}>
                {`${"\u00A0\u00A0".repeat(option.level)}${option.name}`}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldDescription>
            Level dihitung otomatis dari induk yang dipilih.
          </FieldDescription>
          <FieldError errors={toFieldErrors(errors?.parentId)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors?.icon ? true : undefined}>
            <FieldLabel htmlFor="menu-icon">Ikon</FieldLabel>
            <Input
              id="menu-icon"
              name="icon"
              placeholder="LayersIcon"
              autoComplete="off"
              maxLength={255}
              aria-invalid={errors?.icon ? true : undefined}
              defaultValue={values?.icon ?? defaultValues?.icon ?? ""}
            />
            <FieldDescription>Nama ikon lucide-react.</FieldDescription>
            <FieldError errors={toFieldErrors(errors?.icon)} />
          </Field>

          <Field data-invalid={errors?.sortOrder ? true : undefined}>
            <FieldLabel htmlFor="menu-sort-order">Urutan</FieldLabel>
            <Input
              id="menu-sort-order"
              name="sortOrder"
              type="number"
              min={0}
              step={1}
              aria-invalid={errors?.sortOrder ? true : undefined}
              defaultValue={String(
                values?.sortOrder ?? defaultValues?.sortOrder ?? 0,
              )}
            />
            <FieldError errors={toFieldErrors(errors?.sortOrder)} />
          </Field>
        </div>

        <Field data-invalid={errors?.routeName ? true : undefined}>
          <FieldLabel htmlFor="menu-route-name">Nama route</FieldLabel>
          <Input
            id="menu-route-name"
            name="routeName"
            placeholder="/master/parameters"
            autoComplete="off"
            maxLength={255}
            aria-invalid={errors?.routeName ? true : undefined}
            defaultValue={values?.routeName ?? defaultValues?.routeName ?? ""}
          />
          <FieldDescription>
            Tujuan menu. Kosongkan untuk menu induk yang hanya menampung anak.
          </FieldDescription>
          <FieldError errors={toFieldErrors(errors?.routeName)} />
        </Field>

        <Field data-invalid={errors?.routePattern ? true : undefined}>
          <FieldLabel htmlFor="menu-route-pattern">Pola route</FieldLabel>
          <Input
            id="menu-route-pattern"
            name="routePattern"
            placeholder="/master/parameters*"
            autoComplete="off"
            maxLength={255}
            aria-invalid={errors?.routePattern ? true : undefined}
            defaultValue={
              values?.routePattern ?? defaultValues?.routePattern ?? ""
            }
          />
          <FieldDescription>
            Dipakai menandai menu aktif untuk URL turunannya.
          </FieldDescription>
          <FieldError errors={toFieldErrors(errors?.routePattern)} />
        </Field>

        <Field data-invalid={errors?.layout ? true : undefined}>
          <FieldLabel htmlFor="menu-layout">Layout</FieldLabel>
          <Input
            id="menu-layout"
            name="layout"
            list="menu-layout-options"
            placeholder="sidebar"
            autoComplete="off"
            maxLength={255}
            aria-invalid={errors?.layout ? true : undefined}
            defaultValue={values?.layout ?? defaultValues?.layout ?? "sidebar"}
          />
          <datalist id="menu-layout-options">
            {layouts.map((layout) => (
              <option key={layout} value={layout} />
            ))}
          </datalist>
          <FieldDescription>
            Tempat menu ini dirender, mis. `sidebar`.
          </FieldDescription>
          <FieldError errors={toFieldErrors(errors?.layout)} />
        </Field>

        <MenuSwitchField
          id="menu-is-active"
          name="isActive"
          label="Aktif"
          description="Menu nonaktif tidak ikut dirender di sidebar."
          defaultChecked={values?.isActive ?? defaultValues?.isActive ?? true}
        />
      </FieldGroup>

      <FieldError errors={toFieldErrors(errors?.form)} />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onClose}
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
