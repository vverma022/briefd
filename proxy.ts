import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED = ["/dashboard", "/settings"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token")

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}
