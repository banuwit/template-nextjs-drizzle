"use client"

import { useActionState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

import { changePassword } from "../actions"
import type { ChangePasswordActionState } from "../types"

/** Dirender hanya saat terbuka, jadi state form selalu bersih tiap dibuka. */
export function AuthChangePasswordDialog({
  onClose,
}: {
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<
    ChangePasswordActionState,
    FormData
  >(changePassword, {})

  useEffect(() => {
    if (!state.ok) {
      return
    }

    toast.add({
      type: "success",
      title: "Password diganti",
      description: "Sesi di perangkat lain telah dikeluarkan.",
    })
    onClose()
  }, [state.ok, onClose])

  const currentErrors = state.errors?.currentPassword
  const newErrors = state.errors?.newPassword
  const confirmErrors = state.errors?.passwordConfirmation

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Ganti Password</DialogTitle>
          <DialogDescription>
            Setelah diganti, semua perangkat lain akan otomatis logout.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={currentErrors ? true : undefined}>
              <FieldLabel htmlFor="current-password">
                Password saat ini
              </FieldLabel>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={currentErrors ? true : undefined}
              />
              <FieldError errors={toFieldErrors(currentErrors)} />
            </Field>

            <Field data-invalid={newErrors ? true : undefined}>
              <FieldLabel htmlFor="new-password">Password baru</FieldLabel>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={newErrors ? true : undefined}
              />
              <FieldError errors={toFieldErrors(newErrors)} />
            </Field>

            <Field data-invalid={confirmErrors ? true : undefined}>
              <FieldLabel htmlFor="password-confirmation">
                Konfirmasi password baru
              </FieldLabel>
              <Input
                id="password-confirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={confirmErrors ? true : undefined}
              />
              <FieldError errors={toFieldErrors(confirmErrors)} />
            </Field>
          </FieldGroup>

          <FieldError errors={toFieldErrors(state.errors?.form)} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
