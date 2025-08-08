"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, membersAPI } from "./api.js";

type UserRole = "MEMBER" | "ACCOUNTANT" | "MANAGER" | "SUPERVISOR" | "COMMITTEE";

type User = {
	id: number;
	name: string;
	email?: string;
	role: UserRole;
	memberId?: number;
	etNumber?: any;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	login: (identifier: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	etNumber?: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		async function loadUserFromSession() {
			console.log("[AuthProvider:loadUserFromSession] Attempting to load user session");
			try {
				const data = await authAPI.getSession();
				console.log("[AuthProvider:loadUserFromSession] Session data:", data);
				
				if (data.user) {
					setUser(data.user);
					console.log("[AuthProvider:loadUserFromSession] User loaded from session:", data.user);
				} else {
					console.log("[AuthProvider:loadUserFromSession] No user in session");
					// Only redirect to login if we're not already there and not on a public route
					const publicRoutes = ['/login', '/register', '/'];
					if (typeof window !== 'undefined' && !publicRoutes.includes(window.location.pathname)) {
						console.log("[AuthProvider:loadUserFromSession] Redirecting to login");
						router.push('/login');
					}
				}
			} catch (error) {
				console.error("[AuthProvider:loadUserFromSession] Session error:", error);
				// Only redirect to login if we're not already there and not on a public route
				const publicRoutes = ['/login', '/register', '/'];
				if (typeof window !== 'undefined' && !publicRoutes.includes(window.location.pathname)) {
					console.log("[AuthProvider:loadUserFromSession] Error occurred, redirecting to login");
					router.push('/login');
				}
			} finally {
				setLoading(false);
			}
		}

		loadUserFromSession();
	}, [router]);

	const login = async (
		identifier: string,
		password: string
	): Promise<boolean> => {
		try {
			setLoading(true);
			console.log("[AuthProvider:login] Attempting login with identifier:", identifier);
			
			const data = await authAPI.login(identifier, password);
			console.log("[AuthProvider:login] Login response:", data);
			
			if (data.user) {
				setUser(data.user);
				console.log("[AuthProvider:login] User logged in:", data.user);

				// If it's a member with etNumber, fetch additional member details
				if (data.user.role === "MEMBER" && data.user.etNumber) {
					console.log("[AuthProvider:login] Fetching member details for ET Number:", data.user.etNumber);
					try {
						const memberData = await membersAPI.getMember(data.user.etNumber);
						console.log("[AuthProvider:login] Member details fetched:", memberData);
					} catch (memberError) {
						console.error("[AuthProvider:login] Failed to fetch member details:", memberError);
					}
				} else if (data.user.role === "MEMBER") {
					console.log("[AuthProvider:login] Member logged in but no etNumber available");
				}

				// Wait a moment for the session to be established
				await new Promise(resolve => setTimeout(resolve, 100));
				
				return true;
			} else {
				console.error("[AuthProvider:login] No user data in login response");
				return false;
			}
		} catch (error) {
			console.error("[AuthProvider:login] Login failed:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		try {
			setLoading(true);
			await authAPI.logout();
			setUser(null);
			router.push("/login");
		} catch (error) {
			console.error("[AuthProvider:logout] Logout failed:", error);
			// Still clear user state even if logout fails
			setUser(null);
			router.push("/login");
		} finally {
			setLoading(false);
		}
	};

	console.log("[AuthProvider:render] Current state:", {
		user,
		loading,
		isAuthenticated: !!user,
		skipSessionCheck: false
	});

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				logout,
				isAuthenticated: !!user,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
} 