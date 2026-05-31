"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { formatDateRange } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { GraduationCap } from "lucide-react";

export default function EducationPage() {
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi.getEducation(),
      publicApi.getCertifications(),
      publicApi.getAchievements(),
    ]).then(([e, c, a]) => { setEducation(e); setCertifications(c); setAchievements(a); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader title="Education" subtitle="Academic background, certifications, and achievements." accent="Academics" />

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Education timeline */}
          <section className="mb-20">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)] hidden md:block" />
              <div className="space-y-8">
                {education.map((edu, i) => (
                  <RevealOnScroll key={edu.id} delay={i * 80}>
                    <div className="md:pl-16 relative">
                      <div className="hidden md:flex absolute left-0 top-6 w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--accent)] items-center justify-center">
                        <GraduationCap size={16} className="text-[var(--accent)]" />
                      </div>
                      <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-display text-xl font-semibold">{edu.degree} in {edu.field_of_study}</h3>
                            <p className="text-[var(--text-muted)]">{edu.institution} · {edu.location}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {edu.grade && <span className="text-xs text-[var(--accent)] font-mono font-semibold">{edu.grade}</span>}
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              {formatDateRange(edu.start_date, edu.end_date, edu.is_current)}
                            </span>
                          </div>
                        </div>
                        {edu.description && <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-3">{edu.description}</p>}
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

          {/* Certifications */}
          {certifications.length > 0 && (
            <RevealOnScroll>
              <section className="mb-20">
                <h2 className="font-display text-2xl font-semibold mb-8">Certifications</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {certifications.map((cert) => (
                    <a key={cert.id} href={cert.credential_url || "#"} target="_blank" rel="noopener noreferrer"
                      className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-lg flex-shrink-0">🏅</div>
                      <div>
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{cert.issuer}</p>
                        {cert.issue_date && <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{cert.issue_date}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <RevealOnScroll>
              <section className="mb-24">
                <h2 className="font-display text-2xl font-semibold mb-8">Achievements</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-lg flex-shrink-0">🏆</div>
                        <div>
                          <p className="font-semibold text-sm">{ach.title}</p>
                          <p className="text-xs text-[var(--text-muted)] capitalize">{ach.category}</p>
                          {ach.description && <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{ach.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          )}
        </>
      )}
    </div>
  );
}
