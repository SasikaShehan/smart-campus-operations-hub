import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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
  login: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setAuthData: (token: string, role: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const verifyWithBackend = async (firebaseUser: import("firebase/auth").User) => {
  const idToken = await firebaseUser.getIdToken();

  const response = await fetch("http://localhost:8084/api/auth/firebase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Backend verification failed");
  }

  return await response.json();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUserData = useCallback((data: { email: string; name: string; role: string; token: string }) => {
    localStorage.setItem("campus_token", data.token);
    const userData: User = {
      id: data.email,
      name: data.name,
      email: data.email,
      avatar: data.name?.charAt(0) || "U",
      role: data.role as Role,
    };
    setUser(userData);
    localStorage.setItem("campus_user", JSON.stringify(userData));
  }, []);

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
      localStorage.removeItem("campus_token");
      localStorage.removeItem("campus_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Google redirect result when the page reloads after sign-in
  useEffect(() => {
    let cancelled = false;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const data = await verifyWithBackend(result.user);
          if (!cancelled) applyUserData(data);
          return; // handled — skip fetchUser
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
      }

      if (!cancelled) fetchUser();
    };

    handleRedirectResult();
    return () => { cancelled = true; };
  }, [fetchUser, applyUserData]);

  // Trigger Google redirect sign-in (no popup — works even when popups are blocked)
  const login = useCallback(async () => {
    await signInWithRedirect(auth, googleProvider);
    // Page will navigate away; result is handled in the useEffect above on return
  }, []);

  // Manual email + password login
  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const response = await fetch("http://localhost:8084/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");
    applyUserData(data);
  }, [applyUserData]);

  // Register a new local account
  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch("http://localhost:8084/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");
    applyUserData(data);
  }, [applyUserData]);

  const setAuthData = useCallback((token: string, role: string) => {
    localStorage.setItem("campus_token", token);
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

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (_) {
      // ignore firebase signout errors
    }
    setUser(null);
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithCredentials, register, setAuthData, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
