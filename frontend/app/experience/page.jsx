"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { formatDateRange } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { Briefcase } from "lucide-react";

const TYPE_COLORS = {
  job: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  internship: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  freelance: "bg-amber-500/10 text-[var(--accent)] border-amber-500/20",
  volunteer: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getExperiences().then(setExperiences).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader title="Experience" subtitle="My professional journey so far." accent="Career" />

      {loading ? <LoadingSpinner /> : experiences.length === 0 ? (
        <EmptyState message="Experience entries coming soon." icon={Briefcase} />
      ) : (
        <div className="relative mb-24">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)] hidden md:block" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <RevealOnScroll key={exp.id} delay={i * 80}>
                <div className="md:pl-16 relative">
                  {/* Dot */}
                  <div className="hidden md:flex absolute left-0 top-6 w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--accent)] items-center justify-center">
                    <Briefcase size={16} className="text-[var(--accent)]" />
                  </div>

                  <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold">{exp.role}</h3>
                        <p className="text-[var(--text-muted)]">{exp.company} · {exp.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${TYPE_COLORS[exp.type] || ""}`}>
                          {exp.type}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                        </span>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{exp.description}</p>
                    )}

                    {(exp.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {exp.skills.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-[var(--text-muted)]">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
