"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, FileText, MessageSquare, Eye, Mail } from "lucide-react";
import { adminApi, publicApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, href }) {
  const card = (
    <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <Icon size={20} className="text-[var(--accent)]" />
      </div>
      <p className="font-display text-3xl font-semibold mb-1">{value ?? "—"}</p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Parallel fetch
    adminApi.getProjects().then((d) => setStats((s) => ({ ...s, projects: d.length }))).catch(() => {});
    adminApi.getBlogPosts().then((d) => setStats((s) => ({ ...s, posts: d.length }))).catch(() => {});
    adminApi.getMessages({ unread: true }).then((d) => {
      setStats((s) => ({ ...s, unread: d.length }));
      setMessages(d.slice(0, 5));
    }).catch(() => {});
    adminApi.getAnalytics().then((d) => {
      setStats((s) => ({ ...s, views: d.week_views }));
      setAnalytics(d);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Here's what's happening with your portfolio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={FolderOpen} label="Projects" value={stats.projects} href="/admin/projects" />
        <StatCard icon={FileText} label="Blog Posts" value={stats.posts} href="/admin/blog" />
        <StatCard icon={Mail} label="Unread Messages" value={stats.unread} href="/admin/messages" />
        <StatCard icon={Eye} label="Views This Week" value={stats.views} href="/admin/analytics" />
      </div>

      {/* Recent messages */}
      {messages.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Unread Messages</h2>
            <Link href="/admin/messages" className="text-sm text-[var(--accent)]">View all →</Link>
          </div>
          <div className="space-y-3">
            {messages.map((msg) => (
              <Link key={msg.id} href="/admin/messages"
                className="flex items-start gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-sm">{msg.name}</p>
                    <span className="text-xs text-[var(--text-muted)]">{msg.email}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{msg.subject || msg.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(msg.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/projects", label: "Add Project", emoji: "🚀" },
            { href: "/admin/blog", label: "Write Post", emoji: "✍️" },
            { href: "/admin/skills", label: "Update Skills", emoji: "⚡" },
            { href: "/admin/profile", label: "Edit Profile", emoji: "👤" },
          ].map(({ href, label, emoji }) => (
            <Link key={href} href={href}
              className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-center hover:border-[var(--accent)] transition-colors">
              <p className="text-2xl mb-2">{emoji}</p>
              <p className="text-sm font-medium">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <DashboardContent />
      </AdminShell>
    </AdminGuard>
  );
}
