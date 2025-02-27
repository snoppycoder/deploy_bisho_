import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hasRequiredRole } from "@/lib/auth"
import { UserRole } from "@prisma/client"

// Define route access patterns
const publicRoutes = ["/login", "/register", "/"]
const memberRoutes = ["/member"]
const adminRoutes = ["/dashboard"]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next()
  }

  // Get user from request
  const user = await getUserFromRequest(request)

  // If no user is found, redirect to login
  if (!user) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Check member routes
  if (pathname.startsWith("/member")) {
    if (!hasRequiredRole(user, [UserRole.MEMBER])) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Check admin routes
  if (pathname.startsWith("/dashboard")) {
    if (
      !hasRequiredRole(user, [
        UserRole.LOAN_OFFICER,
        UserRole.BRANCH_MANAGER,
        UserRole.REGIONAL_MANAGER,
        UserRole.FINANCE_ADMIN,
      ])
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Check loan officer specific routes
  if (pathname.startsWith("/dashboard/loans/verify")) {
    if (!hasRequiredRole(user, [UserRole.LOAN_OFFICER])) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Check branch manager specific routes
  if (pathname.startsWith("/dashboard/loans/approve")) {
    if (!hasRequiredRole(user, [UserRole.BRANCH_MANAGER, UserRole.REGIONAL_MANAGER])) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Check finance admin specific routes
  if (pathname.startsWith("/dashboard/loans/disburse")) {
    if (!hasRequiredRole(user, [UserRole.FINANCE_ADMIN])) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

