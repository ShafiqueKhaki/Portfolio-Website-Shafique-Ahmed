"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const InputClass = "w-full px-4 py-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="https://res.cloudinary.com/mhk-cloud/image/upload/v1784489938/Portfolio_website_logo_e1ooep.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-xl mx-auto mb-2"
          />
          <p className="text-sm text-[var(--text-muted)]">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input {...register("email")} type="email" placeholder="admin@example.com" className={InputClass} autoComplete="email" />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`${InputClass} pr-10`} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-6">
            {loading ? <><InlineSpinner size={14} /> Signing in…</> : <><LogIn size={15} /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminGuard>
      <LoginForm />
    </AdminGuard>
  );
}
