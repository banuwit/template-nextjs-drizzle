import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

// Cookie sesi yang tidak valid lagi (kedaluwarsa, dicabut, DB di-reset) harus
// dihapus di sini: Server Component tidak boleh menulis cookie, dan tanpa
// penghapusan `proxy.ts` akan terus memantulkan `/` ↔ `/dashboard`.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()

  for (const { name } of cookieStore.getAll()) {
    if (name.startsWith("better-auth.") || name.startsWith("__Secure-better-auth.")) {
      cookieStore.delete(name)
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}
