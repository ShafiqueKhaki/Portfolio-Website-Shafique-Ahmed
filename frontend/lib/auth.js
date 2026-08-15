"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "./api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchUser is async; every setState happens after its first await, not synchronously in this effect
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    const user = await authApi.login({ email, password });
    setUser(user);
    router.push("/admin/dashboard");
    return user;
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state and redirect regardless
    }
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  return { user, loading, login, logout, refetch: fetchUser };
}
