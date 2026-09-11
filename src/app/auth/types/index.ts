/**
 * State server action auth untuk `useActionState`. Password tidak pernah
 * dikembalikan di `values` — jangan kirim ulang rahasia ke client.
 */
export type SignInActionState = {
  errors?: Partial<Record<"email" | "password" | "form", string[]>>
  values?: { email: string }
}

export type ChangePasswordActionState = {
  ok?: boolean
  errors?: Partial<
    Record<
      "currentPassword" | "newPassword" | "passwordConfirmation" | "form",
      string[]
    >
  >
}
