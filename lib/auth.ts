// import { jwtVerify, SignJWT } from "jose";
// import { cookies } from "next/headers";
// import type { NextRequest, NextResponse } from "next/server";
// import type { UserRole } from "@prisma/client";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const secretKey = new TextEncoder().encode(JWT_SECRET);

// export type JWTPayload = {
// 	id: number;
// 	email: string;
// 	name: string;
// 	role: UserRole;
// 	memberId?: number;
// };

// export async function signJWT(payload: JWTPayload | any): Promise<string> {
// 	const token = await new SignJWT(payload)
// 		.setProtectedHeader({ alg: "HS256" })
// 		.setIssuedAt()
// 		.setExpirationTime("24h")
// 		.sign(secretKey);

// 	return token;
// }

// export async function verifyJWT(token: string): Promise<JWTPayload | null> {
// 	try {
// 		const { payload } = await jwtVerify(token, secretKey);
// 		return payload as JWTPayload;
// 	} catch (error) {
// 		return null;
// 	}
// }

// export async function getSession(): Promise<JWTPayload | null> {
// 	const cookieStore = cookies();
// 	const token = cookieStore.get("token")?.value;

// 	if (!token) return null;

// 	return verifyJWT(token);
// }

// export function setAuthCookie(
// 	token: string,
// 	response: NextResponse
// ): NextResponse {
// 	response.cookies.set({
// 		name: "token",
// 		value: token,
// 		httpOnly: true,
// 		path: "/",
// 		secure: process.env.NODE_ENV === "production",
// 		maxAge: 60 * 60 * 24, // 1 day
// 	});

// 	return response;
// }

// export function removeAuthCookie(response: NextResponse): NextResponse {
// 	response.cookies.set({
// 		name: "token",
// 		value: "",
// 		httpOnly: true,
// 		path: "/",
// 		secure: process.env.NODE_ENV === "production",
// 		maxAge: 0,
// 	});

// 	return response;
// }

// export function getTokenFromRequest(request: NextRequest): string | null {
// 	const token = request.cookies.get("token")?.value;
// 	return token || null;
// }

// export async function getUserFromRequest(
// 	request: NextRequest
// ): Promise<JWTPayload | null> {
// 	const token = getTokenFromRequest(request);
// 	if (!token) return null;

// 	return verifyJWT(token);
// }

// export function hasRequiredRole(
// 	user: JWTPayload | null,
// 	requiredRoles: UserRole[]
// ): boolean {
// 	if (!user) return false;
// 	return requiredRoles.includes(user.role);
// }
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export type JWTPayload = {
	id?: number;
	email?: string;
	name?: string;
	role: UserRole | "MEMBER";
	etNumber?: number;
	phone?: string;
};

export async function signJWT(payload: JWTPayload): Promise<string> {
	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(secretKey);

	return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, secretKey);
		console.log("Auth: Verified JWT payload", payload);
		return payload as JWTPayload;
	} catch (error) {
		console.error("Auth: JWT verification failed", error);
		return null;
	}
}

export async function getSession(): Promise<JWTPayload | null> {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) return null;

	return verifyJWT(token);
}

export function setAuthCookie(
	token: string,
	response: NextResponse
): NextResponse {
	response.cookies.set({
		name: "token",
		value: token,
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24, // 1 day
	});

	return response;
}

export function removeAuthCookie(response: NextResponse): NextResponse {
	response.cookies.set({
		name: "token",
		value: "",
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
	});

	return response;
}

export function getTokenFromRequest(request: NextRequest): string | null {
	const token = request.cookies.get("token")?.value;
	console.log("Auth: Token from request", token ? "Found" : "Not found");
	return token || null;
}

export async function getUserFromRequest(
	request: NextRequest
): Promise<JWTPayload | null> {
	const token = getTokenFromRequest(request);
	if (!token) return null;

	return verifyJWT(token);
}

export function hasRequiredRole(
	user: JWTPayload | null,
	requiredRoles: (UserRole | "MEMBER")[]
): boolean {
	if (!user) return false;
	const hasRole = requiredRoles.includes(user.role as UserRole);
	console.log(
		"Auth: Checking role",
		user.role,
		"against",
		requiredRoles,
		"Result:",
		hasRole
	);
	return hasRole;
}

// import { jwtVerify, SignJWT } from "jose";
// import { cookies } from "next/headers";
// import type { NextRequest, NextResponse } from "next/server";
// import type { UserRole } from "@prisma/client";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const secretKey = new TextEncoder().encode(JWT_SECRET);

// export type JWTPayload = {
// 	id?: number;
// 	email?: string;
// 	name?: string;
// 	role: UserRole | "MEMBER";
// 	etNumber?: number;
// 	phone?: string;
// 	memberId?: any;
// };

// export async function signJWT(payload: JWTPayload): Promise<string> {
// 	const token = await new SignJWT(payload)
// 		.setProtectedHeader({ alg: "HS256" })
// 		.setIssuedAt()
// 		.setExpirationTime("24h")
// 		.sign(secretKey);

// 	return token;
// }

// export async function verifyJWT(token: string): Promise<JWTPayload | null> {
// 	try {
// 		const { payload } = await jwtVerify(token, secretKey);
// 		console.log("Auth: Verified JWT payload", payload);
// 		return payload as JWTPayload;
// 	} catch (error) {
// 		console.error("Auth: JWT verification failed", error);
// 		return null;
// 	}
// }

// export async function getSession(): Promise<JWTPayload | null> {
// 	const cookieStore = cookies();
// 	const token = cookieStore.get("token")?.value;

// 	if (!token) return null;

// 	return verifyJWT(token);
// }

// export function setAuthCookie(
// 	token: string,
// 	response: NextResponse
// ): NextResponse {
// 	response.cookies.set({
// 		name: "token",
// 		value: token,
// 		httpOnly: true,
// 		path: "/",
// 		secure: process.env.NODE_ENV === "production",
// 		maxAge: 60 * 60 * 24, // 1 day
// 	});

// 	return response;
// }

// export function removeAuthCookie(response: NextResponse): NextResponse {
// 	response.cookies.set({
// 		name: "token",
// 		value: "",
// 		httpOnly: true,
// 		path: "/",
// 		secure: process.env.NODE_ENV === "production",
// 		maxAge: 0,
// 	});

// 	return response;
// }

// export function getTokenFromRequest(request: NextRequest): string | null {
// 	const token = request.cookies.get("token")?.value;
// 	console.log("Auth: Token from request", token ? "Found" : "Not found");
// 	return token || null;
// }

// export async function getUserFromRequest(
// 	request: NextRequest
// ): Promise<JWTPayload | null> {
// 	const token = getTokenFromRequest(request);
// 	if (!token) return null;

// 	return verifyJWT(token);
// }

// export function hasRequiredRole(
// 	user: JWTPayload | null,
// 	requiredRoles: (UserRole | "MEMBER")[]
// ): boolean {
// 	if (!user) return false;
// 	const hasRole = requiredRoles.includes(user.role);
// 	console.log(
// 		"Auth: Checking role",
// 		user.role,
// 		"against",
// 		requiredRoles,
// 		"Result:",
// 		hasRole
// 	);
// 	return hasRole;
// }
