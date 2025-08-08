import { jwtVerify, SignJWT } from "jose";
import type { Request, Response } from "express";
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

// Sign a new JWT token
export async function signJWT(payload: JWTPayload): Promise<string> {
	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(secretKey);

	return token;
}

// Verify the token
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

// Get session from request cookies
export async function getSession(req: Request): Promise<JWTPayload | null> {
	const token = req.cookies?.token;
	if (!token) return null;
	return verifyJWT(token);
}

// Set JWT token cookie
export function setAuthCookie(token: string, res: Response): void {
	res.cookie("token", token, {
		httpOnly: true,
		// secure: process.env.NODE_ENV === "production",
		maxAge: 1000 * 60 * 60 * 24, // 1 day
		path: "/",
	});
}

// Remove JWT token cookie
export function removeAuthCookie(res: Response): void {
	res.cookie("token", "", {
		httpOnly: true,
		maxAge: 0,
		path: "/",
	});
}

// Get token from Express request
export function getTokenFromRequest(req: Request): string | null {
	const token = req.cookies?.token;
	console.log("Auth: Token from request", token ? "Found" : "Not found");
	return token || null;
}

// Get user from Express request
export async function getUserFromRequest(req: Request): Promise<JWTPayload | null> {
	const token = getTokenFromRequest(req);
	if (!token) return null;
	return verifyJWT(token);
}

// Check user role against allowed roles
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
