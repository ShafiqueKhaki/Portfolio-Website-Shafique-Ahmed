"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, User, FolderOpen, Zap, Briefcase, GraduationCap,
  Award, Trophy, FileText, Tag, MessageSquare, BarChart2,
  Settings, LogOut, ChevronRight, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/profile", icon: User, label: "Profile" },
  { href: "/admin/projects", icon: FolderOpen, label: "Projects" },
  { href: "/admin/skills", icon: Zap, label: "Skills" },
  { href: "/admin/experiences", icon: Briefcase, label: "Experience" },
  { href: "/admin/education", icon: GraduationCap, label: "Education" },
  { href: "/admin/certifications", icon: Award, label: "Certifications" },
  { href: "/admin/achievements", icon: Trophy, label: "Achievements" },
  { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
          <Link href="/admin/dashboard" className="font-mono text-lg font-semibold tracking-tight">
            <span className="text-[var(--text-muted)]">{"{"}</span>
            <span className="text-[var(--accent)]">SA</span>
            <span className="text-[var(--text-muted)]">{"}"}</span>
            <span className="text-xs text-[var(--text-muted)] font-sans font-normal ml-2">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors",
                  active
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                )}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#0f0f0c] text-sm font-semibold">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs text-center py-1.5 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              View Site
            </Link>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/30 transition-colors">
              <LogOut size={12} /> Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 flex items-center px-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[var(--text-muted)]">
            <Menu size={20} />
          </button>
          <span className="font-mono font-semibold ml-3">
            <span className="text-[var(--text-muted)]">{"{"}</span>
            <span className="text-[var(--accent)]">SA</span>
            <span className="text-[var(--text-muted)]">{"}"}</span>
          </span>
        </div>

        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
