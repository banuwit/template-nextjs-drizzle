"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toFieldErrors } from "@/lib/form"

import type { UserActionState, UserFormFields } from "../types"

export function UserForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref = "/users",
}: {
  action: (
    prevState: UserActionState,
    formData: FormData
  ) => Promise<UserActionState>
  defaultValues?: UserFormFields
  submitLabel: string
  cancelHref?: string
}) {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(
    action,
    {}
  )

  const nameErrors = state.errors?.name
  const emailErrors = state.errors?.email

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={nameErrors ? true : undefined}>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Budi Santoso"
            autoComplete="name"
            aria-invalid={nameErrors ? true : undefined}
            defaultValue={state.values?.name ?? defaultValues?.name}
          />
          <FieldError errors={toFieldErrors(nameErrors)} />
        </Field>

        <Field data-invalid={emailErrors ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="budi@example.com"
            autoComplete="email"
            aria-invalid={emailErrors ? true : undefined}
            defaultValue={state.values?.email ?? defaultValues?.email}
          />
          <FieldError errors={toFieldErrors(emailErrors)} />
        </Field>
      </FieldGroup>

      <FieldError errors={toFieldErrors(state.errors?.form)} />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
        {/* Saat pending render <button disabled>: `disabled` pada <a> diabaikan browser. */}
        {pending ? (
          <Button variant="ghost" disabled>
            Batal
          </Button>
        ) : (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={cancelHref} />}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
