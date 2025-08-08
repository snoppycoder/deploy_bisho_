"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import {authAPI} from "@/lib/api";

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
  login: (identifier: string, password: string) => Promise<{ success: boolean; redirectUrl?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  etNumber?: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage if token exists
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; redirectUrl?: string }> => {
    try {
      setLoading(true);
      const { user } = await authAPI.login(identifier, password);

      if (user ) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        console.log("[AuthProvider] Login success:", user);

        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl") || "/dashboard";

        return { success: true, redirectUrl: callbackUrl };
      } else {
        console.warn("[AuthProvider] Login failed: no user or token");
        return { success: false };
      }
    } catch (error) {
      console.error("[AuthProvider] Login error:", error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      // Ignore error but clear data
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
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
        etNumber: user?.etNumber,
      }}
    >
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