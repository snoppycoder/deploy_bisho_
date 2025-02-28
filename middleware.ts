// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromRequest, hasRequiredRole } from "@/lib/auth"
// import { UserRole } from "@prisma/client"

// // Define route access patterns
// const publicRoutes = ["/login", "/register", "/"]
// const memberRoutes = ["/member"]l
// const adminRoutes = ["/dashboard"]

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname

//   // Allow public routes
//   if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
//     return NextResponse.next()
//   }

//   // Get user from request
//   const user = await getUserFromRequest(request)

//   // If no user is found, redirect to login
//   if (!user) {
//     const url = new URL("/login", request.url)
//     url.searchParams.set("callbackUrl", encodeURI(pathname))
//     return NextResponse.redirect(url)
//   }

//   // Check member routes
//   if (pathname.startsWith("/member")) {
//     if (!hasRequiredRole(user, [UserRole.MEMBER])) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url))
//     }
//   }

//   // Check admin routes
//   if (pathname.startsWith("/dashboard")) {
//     if (
//       !hasRequiredRole(user, [
//         UserRole.LOAN_OFFICER,
//         UserRole.BRANCH_MANAGER,
//         UserRole.REGIONAL_MANAGER,
//         UserRole.FINANCE_ADMIN,
//       ])
//     ) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url))
//     }
//   }

//   // Check loan officer specific routes
//   if (pathname.startsWith("/dashboard/loans/verify")) {
//     if (!hasRequiredRole(user, [UserRole.LOAN_OFFICER])) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url))
//     }
//   }

//   // Check branch manager specific routes
//   if (pathname.startsWith("/dashboard/loans/approve")) {
//     if (!hasRequiredRole(user, [UserRole.BRANCH_MANAGER, UserRole.REGIONAL_MANAGER])) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url))
//     }
//   }

//   // Check finance admin specific routes
//   if (pathname.startsWith("/dashboard/loans/disburse")) {
//     if (!hasRequiredRole(user, [UserRole.FINANCE_ADMIN])) {
//       return NextResponse.redirect(new URL("/unauthorized", request.url))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }

// import { type NextRequest, NextResponse } from "next/server";
// import { getUserFromRequest, hasRequiredRole } from "@/lib/auth";
// import { UserRole } from "@prisma/client";

// // Define route access patterns
// const publicRoutes = ["/login", "/register", "/"];
// const memberRoutes = ["/member"];
// const adminRoutes = ["/dashboard"];

// export async function middleware(request: NextRequest) {
// 	const pathname = request.nextUrl.pathname;

// 	// Allow public routes
// 	if (
// 		publicRoutes.some(
// 			(route) => pathname === route || pathname.startsWith(route + "/")
// 		)
// 	) {
// 		return NextResponse.next();
// 	}

// 	// Get user from request
// 	const user = await getUserFromRequest(request);

// 	// If no user is found, redirect to login
// 	if (!user) {
// 		const url = new URL("/login", request.url);
// 		url.searchParams.set("callbackUrl", encodeURI(pathname));
// 		return NextResponse.redirect(url);
// 	}

// 	// Check member routes
// 	if (pathname.startsWith("/member")) {
// 		if (user.role !== "MEMBER") {
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	// Check admin routes
// 	if (pathname.startsWith("/dashboard")) {
// 		if (
// 			!hasRequiredRole(user, [
// 				UserRole.LOAN_OFFICER,
// 				UserRole.BRANCH_MANAGER,
// 				UserRole.REGIONAL_MANAGER,
// 				UserRole.FINANCE_ADMIN,
// 			])
// 		) {
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	// Check loan officer specific routes
// 	if (pathname.startsWith("/dashboard/loans/verify")) {
// 		if (!hasRequiredRole(user, [UserRole.LOAN_OFFICER])) {
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	// Check branch manager specific routes
// 	if (pathname.startsWith("/dashboard/loans/approve")) {
// 		if (
// 			!hasRequiredRole(user, [
// 				UserRole.BRANCH_MANAGER,
// 				UserRole.REGIONAL_MANAGER,
// 			])
// 		) {
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	// Check finance admin specific routes
// 	if (pathname.startsWith("/dashboard/loans/disburse")) {
// 		if (!hasRequiredRole(user, [UserRole.FINANCE_ADMIN])) {
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };
// -----------------------------------------------------------------------------------

// import { type NextRequest, NextResponse } from "next/server";
// import { getUserFromRequest, hasRequiredRole } from "@/lib/auth";
// import { UserRole } from "@prisma/client";

// // Define route access patterns
// const publicRoutes = ["/login", "/register", "/"];
// const memberRoutes = ["/member"];
// const adminRoutes = ["/dashboard"];

// export async function middleware(request: NextRequest) {
// 	const pathname = request.nextUrl.pathname;
// 	console.log("Middleware: Checking path", pathname);

// 	// Allow public routes
// 	if (
// 		publicRoutes.some(
// 			(route) => pathname === route || pathname.startsWith(route + "/")
// 		)
// 	) {
// 		console.log("Middleware: Public route, allowing access");
// 		return NextResponse.next();
// 	}

// 	// Get user from request
// 	const user = await getUserFromRequest(request);
// 	console.log("Middleware: User from request", user);

// 	// If no user is found, redirect to login
// 	if (!user) {
// 		console.log("Middleware: No user found, redirecting to login");
// 		const url = new URL("/login", request.url);
// 		url.searchParams.set("callbackUrl", encodeURI(pathname));
// 		return NextResponse.redirect(url);
// 	}

// 	// Check member routes
// 	if (pathname.startsWith("/member")) {
// 		console.log("Middleware: Checking member route");
// 		if (user.role !== "MEMBER") {
// 			console.log(
// 				"Middleware: User is not a member, redirecting to unauthorized"
// 			);
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 		console.log("Middleware: User is a member, allowing access");
// 		return NextResponse.next();
// 	}

// 	// Check admin routes
// 	if (pathname.startsWith("/dashboard")) {
// 		console.log("Middleware: Checking admin route");
// 		if (
// 			!hasRequiredRole(user, [
// 				UserRole.LOAN_OFFICER,
// 				UserRole.BRANCH_MANAGER,
// 				UserRole.REGIONAL_MANAGER,
// 				UserRole.FINANCE_ADMIN,
// 			])
// 		) {
// 			console.log(
// 				"Middleware: User is not an admin, redirecting to unauthorized"
// 			);
// 			return NextResponse.redirect(new URL("/unauthorized", request.url));
// 		}
// 	}

// 	// Redirect members to /member if they try to access other routes
// 	if (user.role === "MEMBER" && !pathname.startsWith("/member")) {
// 		console.log(
// 			"Middleware: Member accessing non-member route, redirecting to /member"
// 		);
// 		return NextResponse.redirect(new URL("/member", request.url));
// 	}

// 	// If we've made it this far, allow access
// 	console.log("Middleware: Allowing access");
// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };
import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasRequiredRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Define route access patterns
const publicRoutes = ["/login", "/register", "/"];
const memberRoutes = ["/member"];
const adminRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	console.log("Middleware: Checking path", pathname);

	// Allow public routes
	if (
		publicRoutes.some(
			(route) => pathname === route || pathname.startsWith(route + "/")
		)
	) {
		console.log("Middleware: Public route, allowing access");
		return NextResponse.next();
	}

	// Get user from request
	const user = await getUserFromRequest(request);
	console.log("Middleware: User from request", user);

	// If no user is found, redirect to login
	if (!user) {
		console.log("Middleware: No user found, redirecting to login");
		const url = new URL("/login", request.url);
		url.searchParams.set("callbackUrl", encodeURI(pathname));
		return NextResponse.redirect(url);
	}

	// Check member routes
	if (pathname.startsWith("/member")) {
		console.log("Middleware: Checking member route");
		if (user.role !== "MEMBER") {
			console.log(
				"Middleware: User is not a member, redirecting to unauthorized"
			);
			return NextResponse.redirect(new URL("/unauthorized", request.url));
		}
		console.log("Middleware: User is a member, allowing access");
		return NextResponse.next();
	}

	// Check admin routes
	if (pathname.startsWith("/dashboard")) {
		console.log("Middleware: Checking admin route");
		if (
			!hasRequiredRole(user, [
				UserRole.LOAN_OFFICER,
				UserRole.BRANCH_MANAGER,
				UserRole.REGIONAL_MANAGER,
				UserRole.FINANCE_ADMIN,
			])
		) {
			console.log(
				"Middleware: User is not an admin, redirecting to unauthorized"
			);
			return NextResponse.redirect(new URL("/unauthorized", request.url));
		}
		console.log("Middleware: User is an admin, allowing access");
		return NextResponse.next();
	}

	// Redirect members to /member if they try to access other routes
	if (user.role === "MEMBER" && !pathname.startsWith("/member")) {
		console.log(
			"Middleware: Member accessing non-member route, redirecting to /member"
		);
		return NextResponse.redirect(new URL("/member", request.url));
	}

	// If we've made it this far, allow access
	console.log("Middleware: Allowing access");
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
