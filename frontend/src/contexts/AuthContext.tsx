import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

export type Role = "STUDENT" | "LECTURER" | "TECHNICIAN" | "MANAGER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  setAuthData: (token: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("campus_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.get("/user/profile");
      setUser({
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        avatar: data.name?.charAt(0) || "U",
        role: data.role as Role
      });
      localStorage.setItem("campus_user", JSON.stringify(data));
    } catch (error) {
      console.error("Auth error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = "http://localhost:8084/oauth2/authorization/google";
  }, []);

  const setAuthData = useCallback((token: string, role: string) => {
    localStorage.setItem("campus_token", token);
    // Create a temporary user object since we don't have a /me endpoint yet
    const tempUser: User = {
      id: "current",
      name: "Logged User",
      email: "",
      avatar: "LU",
      role: role as Role
    };
    setUser(tempUser);
    localStorage.setItem("campus_user", JSON.stringify(tempUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, setAuthData, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
