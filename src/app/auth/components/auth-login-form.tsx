"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toFieldErrors } from "@/lib/form"

import { signIn } from "../actions"
import type { SignInActionState } from "../types"

export function AuthLoginForm() {
  const [state, formAction, pending] = useActionState<
    SignInActionState,
    FormData
  >(signIn, {})

  const emailErrors = state.errors?.email
  const passwordErrors = state.errors?.password

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk ke akun Anda</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* key: mount ulang saat action mengembalikan nilai baru, supaya Base UI
            tidak melihat defaultValue berubah pada input yang sudah ter-mount. */}
        <form key={JSON.stringify(state.values ?? null)} action={formAction}>
          <FieldGroup>
            <Field data-invalid={emailErrors ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                aria-invalid={emailErrors ? true : undefined}
                defaultValue={state.values?.email}
              />
              <FieldError errors={toFieldErrors(emailErrors)} />
            </Field>

            <Field data-invalid={passwordErrors ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={passwordErrors ? true : undefined}
              />
              <FieldError errors={toFieldErrors(passwordErrors)} />
            </Field>

            <FieldError errors={toFieldErrors(state.errors?.form)} />

            <Field>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                Masuk
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
