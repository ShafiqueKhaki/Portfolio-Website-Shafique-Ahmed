"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/**
 * AdminGuard:
 * - /admin/login → accessible when NOT logged in; redirects to dashboard when logged in
 * - All other /admin/* → requires login; redirects to /admin/login when not logged in
 */
export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (isLoginPage && user) {
      router.replace("/admin/dashboard");
    } else if (!isLoginPage && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) return <LoadingSpinner />;
  if (isLoginPage && user) return null;   // redirecting
  if (!isLoginPage && !user) return null; // redirecting
  return children;
}
