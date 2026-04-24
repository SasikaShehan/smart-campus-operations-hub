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
  login: (role?: string) => void;
  emailLogin: (data: any) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  setAuthData: (token: string, role: string, name: string, email: string) => void;
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

  const login = useCallback((role?: string) => {
    if (role) {
      window.location.href = `http://localhost:8084/api/auth/google?role=${role}`;
    } else {
      window.location.href = "http://localhost:8084/oauth2/authorization/google";
    }
  }, []);

  const emailLogin = useCallback(async (data: any) => {
    try {
      const response = await api.post("/auth/login", data);
      localStorage.setItem("campus_token", response.token);
      await fetchUser();
    } catch (error: any) {
      throw error;
    }
  }, [fetchUser]);

  const registerUser = useCallback(async (data: any) => {
    try {
      await api.post("/auth/register", data);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const setAuthData = useCallback((token: string, role: string, name: string, email: string) => {
    localStorage.setItem("campus_token", token);
    const tempUser: User = {
      id: email,
      name: name,
      email: email,
      avatar: name?.charAt(0) || "U",
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, emailLogin, registerUser, setAuthData, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
