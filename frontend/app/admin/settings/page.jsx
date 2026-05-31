"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

function SettingsContent() {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await authApi.changePassword({ current_password: data.current_password, new_password: data.new_password });
      toast.success("Password changed successfully!");
      reset();
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold mb-8">Settings</h1>

      {/* Account info */}
      <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-8">
        <h2 className="font-display text-base font-semibold mb-3">Account</h2>
        <div className="space-y-2 text-sm text-[var(--text-muted)]">
          <p>Name: <span className="text-[var(--text)]">{user?.name}</span></p>
          <p>Email: <span className="text-[var(--text)]">{user?.email}</span></p>
          <p>Role: <span className="text-[var(--accent)]">Admin</span></p>
        </div>
      </div>

      {/* Change password */}
      <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-8">
        <h2 className="font-display text-base font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input {...register("current_password")} type="password" className={InputClass} autoComplete="current-password" />
            {errors.current_password && <p className="text-xs text-red-400 mt-1">{errors.current_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input {...register("new_password")} type="password" className={InputClass} autoComplete="new-password" />
            {errors.new_password && <p className="text-xs text-red-400 mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input {...register("confirm_password")} type="password" className={InputClass} autoComplete="new-password" />
            {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
            {saving ? <><InlineSpinner size={14} /> Saving…</> : "Update Password"}
          </button>
        </form>
      </div>

      {/* Future stubs */}
      <div className="p-5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl opacity-60">
        <h2 className="font-display text-base font-semibold mb-2">Coming Soon</h2>
        <ul className="text-sm text-[var(--text-muted)] space-y-1">
          <li>🌐 i18n / language toggle (Urdu + English)</li>
          <li>📧 Newsletter signup feature flag</li>
          <li>💬 Blog comment moderation</li>
          <li>📡 RSS feed settings</li>
          <li>🔗 GitHub stats integration</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return <AdminGuard><AdminShell><SettingsContent /></AdminShell></AdminGuard>;
}
