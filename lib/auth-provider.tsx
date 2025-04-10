"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";

type User = {
	id: number;
	name: string;
	email: string;
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
			try {
				const res = await fetch("/api/auth/session");
				if (res.ok) {
					const data = await res.json();
					if (data.user) {
						setUser(data.user);
					}
				}
			} catch (error) {
				console.error("Failed to load user session:", error);
			} finally {
				setLoading(false);
			}
		}

		loadUserFromSession();
	}, []);

	const login = async (
		identifier: string,
		password: string
	): Promise<boolean> => {
		try {
			setLoading(true);
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ identifier, password }),
			});

			if (!res.ok) {
				return false;
			}

			const data = await res.json();
			setUser(data.user);
			console.log("AuthProvider: User logged in", data.user);

			// If it's a member, fetch additional member details
			if (data.user.role === "MEMBER") {
				const memberDetailsRes = await fetch(
					`/api/members/${data.user.etNumber}`
				);
				if (memberDetailsRes.ok) {
					const memberData = await memberDetailsRes.json();
					console.log("AuthProvider: Member details fetched", memberData);
				}
			}

			return true;
		} catch (error) {
			console.error("Login failed:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		try {
			setLoading(true);
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			setUser(null);
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setLoading(false);
		}
	};

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
