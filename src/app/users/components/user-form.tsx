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
  withPassword = false,
}: {
  action: (
    prevState: UserActionState,
    formData: FormData
  ) => Promise<UserActionState>
  defaultValues?: UserFormFields
  submitLabel: string
  cancelHref?: string
  /** Tampilkan field password awal — hanya untuk create. */
  withPassword?: boolean
}) {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(
    action,
    {}
  )

  const nameErrors = state.errors?.name
  const emailErrors = state.errors?.email

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
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
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
            placeholder="john.doe@example.com"
            autoComplete="email"
            aria-invalid={emailErrors ? true : undefined}
            defaultValue={state.values?.email ?? defaultValues?.email}
          />
          <FieldError errors={toFieldErrors(emailErrors)} />
        </Field>

        {withPassword && (
          <>
            <Field data-invalid={state.errors?.password ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={state.errors?.password ? true : undefined}
              />
              <FieldError errors={toFieldErrors(state.errors?.password)} />
            </Field>

            <Field
              data-invalid={
                state.errors?.passwordConfirmation ? true : undefined
              }
            >
              <FieldLabel htmlFor="password-confirmation">
                Konfirmasi Password
              </FieldLabel>
              <Input
                id="password-confirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={
                  state.errors?.passwordConfirmation ? true : undefined
                }
              />
              <FieldError
                errors={toFieldErrors(state.errors?.passwordConfirmation)}
              />
            </Field>
          </>
        )}
      </FieldGroup>

      <FieldError errors={toFieldErrors(state.errors?.form)} />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
        {/* Saat pending render <button disabled>: `disabled` pada <a> diabaikan browser. */}
        {pending ? (
          <Button variant="outline" disabled>
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={cancelHref} />}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
