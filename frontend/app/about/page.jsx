"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, MapPin, Mail, Github, Linkedin } from "lucide-react";
import { publicApi } from "@/lib/api";
import { formatDateRange } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import PageHeader from "@/components/ui/PageHeader";

export default function AboutPage() {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi.getProfile(),
      publicApi.getEducation(),
      publicApi.getExperiences(),
    ]).then(([p, e, ex]) => {
      setProfile(p);
      setEducation(e);
      setExperience(ex);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader
        title="About Me"
        subtitle="A bit about who I am, what I'm studying, and where I'm headed."
        accent="Background"
      />

      {/* ── INTRO ── */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-16 mb-24 print:grid-cols-2">
        <div className="flex flex-col items-center md:items-start gap-6">
          {profile?.avatar ? (
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-[var(--accent)]">
              <Image src={profile.avatar} alt={profile.full_name} width={192} height={192} className="object-cover" />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-2xl bg-[var(--bg-subtle)] border-2 border-[var(--accent)] flex items-center justify-center">
              <span className="font-display text-5xl text-[var(--accent)]">SA</span>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
            {profile?.location && <p className="flex items-center gap-2"><MapPin size={14} className="text-[var(--accent)]" /> {profile.location}</p>}
            {profile?.email && <p className="flex items-center gap-2"><Mail size={14} className="text-[var(--accent)]" /> {profile.email}</p>}
            {profile?.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--accent)] transition-colors"><Github size={14} /> GitHub</a>}
            {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--accent)] transition-colors"><Linkedin size={14} /> LinkedIn</a>}
          </div>

          {profile?.resume_url && (
            <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
              className="no-print flex items-center gap-2 px-5 py-2.5 border border-[var(--accent)] text-[var(--accent)] rounded-full text-sm hover:bg-[var(--accent)] hover:text-[#0f0f0c] transition-colors">
              <Download size={14} /> Download Résumé
            </a>
          )}
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <RevealOnScroll>
            <h2 className="font-display text-2xl font-semibold mb-4">Hello, I'm Shafique.</h2>
            <div className="text-[var(--text-muted)] leading-relaxed space-y-4">
              {profile?.bio ? (
                profile.bio.split("\n").map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>I'm a final-year Computer Science student at Sukkur IBA University, based in Sukkur, Sindh, Pakistan. I'm passionate about building software that solves real problems — clean, maintainable, and fast.</p>
                  <p>I specialize in full-stack web development with Python (FastAPI) on the backend and Next.js on the frontend. I love the entire stack: databases, APIs, UIs, and the infrastructure that holds it all together.</p>
                  <p>Outside of coding, I enjoy reading about system design, contributing to open-source projects, and documenting what I learn through blog posts.</p>
                </>
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <div className="mt-8 p-5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)]">
              <h3 className="font-display text-lg font-semibold mb-3">What I'm working on now</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2">
                <li>🔨 Building this portfolio — learning in public</li>
                <li>📚 7th semester coursework at Sukkur IBA</li>
                <li>🌐 Freelance web projects for local clients</li>
                <li>📖 Reading <em>Designing Data-Intensive Applications</em></li>
              </ul>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      {/* ── EDUCATION ── */}
      {education.length > 0 && (
        <RevealOnScroll>
          <section className="mb-20 print-break">
            <h2 className="font-display text-2xl font-semibold mb-8">Education</h2>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="flex gap-6 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-lg flex-shrink-0">🎓</div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <h3 className="font-semibold">{edu.degree} in {edu.field_of_study}</h3>
                      {edu.grade && <span className="text-xs text-[var(--accent)] font-mono">{edu.grade}</span>}
                    </div>
                    <p className="text-[var(--text-muted)] text-sm">{edu.institution} · {edu.location}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatDateRange(edu.start_date, edu.end_date, edu.is_current)}</p>
                    {edu.description && <p className="text-sm text-[var(--text-muted)] mt-3">{edu.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ── EXPERIENCE ── */}
      {experience.length > 0 && (
        <RevealOnScroll>
          <section className="mb-20">
            <h2 className="font-display text-2xl font-semibold mb-8">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="flex gap-6 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-lg flex-shrink-0">💼</div>
                  <div>
                    <h3 className="font-semibold">{exp.role}</h3>
                    <p className="text-[var(--text-muted)] text-sm">{exp.company} · {exp.location} · <span className="capitalize">{exp.type}</span></p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</p>
                    {exp.description && <p className="text-sm text-[var(--text-muted)] mt-3">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealOnScroll>
      )}

      <div className="pb-24 no-print flex gap-4 flex-wrap">
        <Link href="/projects" className="text-[var(--accent)] text-sm hover:underline">→ See my projects</Link>
        <Link href="/skills" className="text-[var(--accent)] text-sm hover:underline">→ My skills</Link>
        <Link href="/contact" className="text-[var(--accent)] text-sm hover:underline">→ Get in touch</Link>
      </div>
    </div>
  );
}
