import { NextResponse, type NextRequest } from "next/server"

const USER_SESSION = "__agrimind_session"
const ADMIN_SESSION = "__agrimind_admin_session"

const publicRoutes = ["/", "/login"]
const authRoutes = ["/login"]
const adminPublicRoutes = ["/admin/login"]

function hasSessionCookie(request: NextRequest, name: string): boolean {
  return Boolean(request.cookies.get(name)?.value)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasUserSession = hasSessionCookie(request, USER_SESSION)
  const hasAdminSession = hasSessionCookie(request, ADMIN_SESSION)

  // Admin routes (except login)
  if (pathname.startsWith("/admin")) {
    if (adminPublicRoutes.includes(pathname)) {
      if (hasAdminSession) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.next()
    }

    if (!hasAdminSession) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // User dashboard — protected
  if (pathname.startsWith("/dashboard")) {
    if (!hasUserSession) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Auth pages — redirect if already logged in
  if (authRoutes.includes(pathname) && hasUserSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
  ],
}
