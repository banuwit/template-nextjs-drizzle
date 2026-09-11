import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

const LOGIN_PATH = "/"
const HOME_PATH = "/dashboard"
// Pembersih cookie sesi mati (lihat src/app/auth/expired/route.ts).
const EXPIRED_PATH = "/auth/expired"

/**
 * Pengecekan optimistic: hanya melihat ada/tidaknya cookie sesi, tanpa query
 * DB (proxy jalan di setiap request termasuk prefetch). Cookie bisa saja
 * kedaluwarsa atau dicabut — validasi sungguhan ada di `requireUser()`
 * (src/lib/session.ts) yang dipanggil queries & actions.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === EXPIRED_PATH) {
    return NextResponse.next()
  }

  const hasSession = Boolean(getSessionCookie(request))
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Semua route kecuali endpoint Better Auth, aset Next.js, dan file statis.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|txt)$).*)",
  ],
}
