import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/lib/auth"

// Endpoint HTTP Better Auth (/api/auth/*). Form di aplikasi ini memakai server
// action, tapi handler tetap dibutuhkan untuk getSession dari client, plugin,
// dan fitur lanjutan (OAuth callback, reset password, dll).
export const { GET, POST } = toNextJsHandler(auth)
