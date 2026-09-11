"use client"

import { useActionState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { toFieldErrors } from "@/lib/form"

import type { ProvinceActionState, ProvinceFormFields } from "../types"

export function ProvinceForm({
  action,
  defaultValues,
  submitLabel,
  successTitle,
  onClose,
}: {
  action: (
    prevState: ProvinceActionState,
    formData: FormData
  ) => Promise<ProvinceActionState>
  defaultValues?: ProvinceFormFields
  submitLabel: string
  successTitle: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<
    ProvinceActionState,
    FormData
  >(action, {})

  useEffect(() => {
    if (!state.ok) {
      return
    }

    toast.add({
      type: "success",
      title: successTitle,
      description: state.values
        ? `${state.values.name} (${state.values.code}) saved.`
        : undefined,
    })
    onClose()
  }, [state.ok, state.values, successTitle, onClose])

  const nameErrors = state.errors?.name
  const codeErrors = state.errors?.code

  return (
    // key: mount ulang saat action mengembalikan nilai baru, supaya Base UI
    // tidak melihat defaultValue berubah pada input yang sudah ter-mount.
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <Field data-invalid={nameErrors ? true : undefined}>
          <FieldLabel htmlFor="province-name">Name</FieldLabel>
          <Input
            id="province-name"
            name="name"
            placeholder="Jawa Barat"
            autoComplete="off"
            aria-invalid={nameErrors ? true : undefined}
            defaultValue={state.values?.name ?? defaultValues?.name}
          />
          <FieldError errors={toFieldErrors(nameErrors)} />
        </Field>

        <Field data-invalid={codeErrors ? true : undefined}>
          <FieldLabel htmlFor="province-code">Code</FieldLabel>
          <Input
            id="province-code"
            name="code"
            placeholder="JB"
            maxLength={2}
            autoComplete="off"
            aria-invalid={codeErrors ? true : undefined}
            defaultValue={state.values?.code ?? defaultValues?.code}
            className="uppercase"
          />
          <FieldError errors={toFieldErrors(codeErrors)} />
        </Field>
      </FieldGroup>

      <FieldError errors={toFieldErrors(state.errors?.form)} />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
