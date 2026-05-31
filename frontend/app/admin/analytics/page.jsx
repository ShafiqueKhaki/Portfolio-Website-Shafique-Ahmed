"use client";
import { useEffect, useState } from "react";
import { Eye, TrendingUp, Globe, ArrowUpRight } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function Bar({ value, max, label }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs text-[var(--text-muted)] truncate max-w-40">{label}</span>
        <span className="text-xs font-mono text-[var(--accent)] w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

function MiniChart({ data }) {
  if (!data?.length) return <p className="text-sm text-[var(--text-muted)]">No data yet.</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full">
            <div
              className="w-full bg-[var(--accent)] rounded-t transition-all duration-500 hover:opacity-80"
              style={{ height: `${(d.count / max) * 64}px`, minHeight: d.count ? "2px" : "0" }}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {d.count} · {d.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-8">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Eye, label: "Total Page Views", value: data?.total_views ?? 0 },
          { icon: TrendingUp, label: "Views This Week", value: data?.week_views ?? 0 },
          { icon: Globe, label: "Unique Pages Tracked", value: data?.top_pages?.length ?? 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <Icon size={18} className="text-[var(--accent)] mb-3" />
            <p className="font-display text-3xl font-semibold">{value.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Views by day chart */}
      <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">Views Last 14 Days</h2>
        <MiniChart data={data?.views_by_day} />
        {data?.views_by_day?.length > 0 && (
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{data.views_by_day[0]?.date}</span>
            <span className="text-xs text-[var(--text-muted)]">{data.views_by_day[data.views_by_day.length - 1]?.date}</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="font-display text-lg font-semibold mb-4">Top Pages</h2>
          {data?.top_pages?.length ? (
            <div className="space-y-2.5">
              {data.top_pages.map((p, i) => (
                <Bar key={i} value={p.count} max={data.top_pages[0]?.count} label={p.page} />
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No page views recorded yet.</p>}
        </div>

        {/* Top referrers */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="font-display text-lg font-semibold mb-4">Top Referrers</h2>
          {data?.top_referrers?.length ? (
            <div className="space-y-2.5">
              {data.top_referrers.map((r, i) => (
                <Bar key={i} value={r.count} max={data.top_referrers[0]?.count} label={r.referrer} />
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No referrer data yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return <AdminGuard><AdminShell><AnalyticsContent /></AdminShell></AdminGuard>;
}
