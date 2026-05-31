"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "./api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Try refresh
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const tokens = await authApi.refresh(refreshToken);
            localStorage.setItem("access_token", tokens.access_token);
            localStorage.setItem("refresh_token", tokens.refresh_token);
            const me = await authApi.me();
            setUser(me);
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // const login = useCallback(async (email, password) => {
  //   const tokens = await authApi.login({ email, password });
  //   localStorage.setItem("access_token", tokens.access_token);
  //   localStorage.setItem("refresh_token", tokens.refresh_token);
  //   const me = await authApi.me();
  //   setUser(me);
  //   return me;
  // }, []);

  const login = useCallback(async (email, password) => {
  const tokens = await authApi.login({ email, password });
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  const me = await authApi.me();
  setUser(me);
  router.push("/admin/dashboard");
  return me;
}, [router]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  return { user, loading, login, logout, refetch: fetchUser };
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}
