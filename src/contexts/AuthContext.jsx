import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // Skip /auth/me if no token + no cookie (avoids noisy 401 on first paint)
    const hasToken = typeof window !== "undefined" && localStorage.getItem("ybex_token");
    const hasCookie = typeof document !== "undefined" && (document.cookie.includes("session_token=") || document.cookie.includes("has_session="));
    
    if (!hasToken && !hasCookie) {
      setUser(null);
      setLoading(false);
      return null;
    }
    
    try {
      const { data } = await api.get("/auth/me");
      // Map dev user user_id to just id to fit standard schema if parsing needed
      const mappedUser = { ...data, id: data.user_id || data.id };
      setUser(mappedUser);
      return mappedUser;
    } catch (e) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If returning from OAuth callback, skip /me check (AuthCallback will exchange first)
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const signup = async (name, email, password, role, phone) => {
    const { data } = await api.post("/auth/signup", { name, email, password, role, phone });
    if (data.token) localStorage.setItem("ybex_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("ybex_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) { /* ignore */ }
    localStorage.removeItem("ybex_token");
    setUser(null);
  };

  const refreshUser = async () => {
    return await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
