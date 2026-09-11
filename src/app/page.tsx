import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"

import { AuthLoginForm } from "./auth/components/auth-login-form"

export const metadata: Metadata = {
  title: "Login",
}

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  // Proxy sudah mengalihkan bila ada cookie; ini menangani cookie yang valid
  // namun lolos (mis. navigasi client) — cek sesi sungguhan ke DB.
  if (await getSession()) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthLoginForm />
      </div>
    </div>
  )
}
