"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Download, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { publicApi } from "@/lib/api";
import ProjectCard from "@/components/ui/ProjectCard";
import BlogCard from "@/components/ui/BlogCard";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SkillBar from "@/components/ui/SkillBar";
import { groupBy } from "@/lib/utils";

// ─── Typed text hook ─────────────────────────────────────────────
const ROLES = [
  "Software Engineer",
  "Full-Stack Developer",
  "CS Student",
  "Problem Solver",
  "Open Source Contributor",
];

function useTyped(words, speed = 80, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout;
    if (typing) {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setTyping(false), pause);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
      } else {
        setWordIndex((i) => i + 1);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, typing, wordIndex, words, speed, pause]);

  return text;
}

export default function HomePage() {
  const typedText = useTyped(ROLES);
  const [profile, setProfile] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [skills, setSkills] = useState({});
  const [blogPosts, setBlogPosts] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    publicApi.getProfile().then(setProfile).catch(() => {});
    publicApi.getProjects({ featured: true }).then((d) => setFeaturedProjects(d.slice(0, 3))).catch(() => {});
    publicApi.getSkills().then((d) => setSkills(groupBy(d.slice(0, 12), "category"))).catch(() => {});
    publicApi.getBlogPosts().then((d) => setBlogPosts(d.slice(0, 3))).catch(() => {});
    publicApi.getEducation().then((d) => setEducation(d.slice(0, 1))).catch(() => {});
    publicApi.getExperiences().then((d) => setExperience(d.slice(0, 1))).catch(() => {});
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-6">
              Available for opportunities
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] mb-6">
              Shafique<br />
              <span className="italic font-light text-[var(--text-muted)]">Ahmed</span>
            </h1>
            <div className="flex items-center gap-2 mb-6 h-10">
              <span className="font-mono text-xl text-[var(--accent)]">&gt;</span>
              <span className="font-mono text-xl">{typedText}</span>
              <span className="w-0.5 h-6 bg-[var(--accent)] animate-blink" />
            </div>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-4 max-w-lg">
              {profile?.headline || "7th semester CS student building full-stack web applications. Based in Sukkur, Pakistan — learning in public, shipping in private."}
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-10">
              <MapPin size={14} className="text-[var(--accent)]" />
              {profile?.location || "Sukkur, Sindh, Pakistan"}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-full hover:opacity-90 transition-opacity text-sm">
                View Projects <ArrowRight size={15} />
              </Link>
              <Link href="/contact"
                className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-full text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                Contact Me
              </Link>
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-full text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                  <Download size={14} /> Résumé
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 mt-8">
              {[
                { href: profile?.github || "#", icon: Github },
                { href: profile?.linkedin || "#", icon: Linkedin },
                { href: profile?.twitter || "#", icon: Twitter },
                { href: `mailto:${profile?.email || "#"}`, icon: Mail },
              ].map(({ href, icon: Icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Right side decorative */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border border-[var(--border)] opacity-30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border border-[var(--border)] opacity-20 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                {profile?.avatar ? (
                  <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[var(--accent)]">
                    <Image src={profile.avatar} alt="Shafique Ahmed" width={192} height={192} className="object-cover" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full bg-[var(--bg-subtle)] border-2 border-[var(--accent)] flex items-center justify-center">
                    <span className="font-display text-6xl font-semibold text-[var(--accent)]">SA</span>
                  </div>
                )}
              </div>
              {/* Floating badges */}
              {[
                { label: "Python", top: "5%", left: "5%" },
                { label: "Next.js", top: "5%", right: "5%" },
                { label: "FastAPI", bottom: "15%", left: "0%" },
                { label: "PostgreSQL", bottom: "5%", right: "0%" },
              ].map(({ label, ...pos }) => (
                <div key={label} style={{ position: "absolute", ...pos }}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1 text-xs font-mono text-[var(--accent)] shadow-sm">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRENT STATUS SNAPSHOT ──────────────────────────── */}
      {(education.length > 0 || experience.length > 0) && (
        <section className="px-6 py-16 border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {education[0] && (
              <RevealOnScroll>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] flex-shrink-0 mt-1">
                    🎓
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mb-1">Currently Studying</p>
                    <p className="font-semibold">{education[0].degree} in {education[0].field_of_study}</p>
                    <p className="text-sm text-[var(--text-muted)]">{education[0].institution}</p>
                  </div>
                </div>
              </RevealOnScroll>
            )}
            {experience[0] && (
              <RevealOnScroll delay={100}>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] flex-shrink-0 mt-1">
                    💼
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mb-1">Currently Working</p>
                    <p className="font-semibold">{experience[0].role}</p>
                    <p className="text-sm text-[var(--text-muted)]">{experience[0].company}</p>
                  </div>
                </div>
              </RevealOnScroll>
            )}
          </div>
        </section>
      )}

      {/* ── FEATURED PROJECTS ─────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-3">Selected Work</p>
                <h2 className="font-display text-3xl md:text-4xl font-semibold">Featured Projects</h2>
              </div>
              <Link href="/projects" className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                All projects <ArrowRight size={14} />
              </Link>
            </div>
          </RevealOnScroll>

          {featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <RevealOnScroll key={project.id} delay={i * 100}>
                  <ProjectCard project={project} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-center py-12">Projects coming soon.</p>
          )}

          <div className="mt-8 md:hidden text-center">
            <Link href="/projects" className="text-sm text-[var(--accent)]">View all projects →</Link>
          </div>
        </div>
      </section>

      {/* ── SKILLS SNAPSHOT ───────────────────────────────────── */}
      {Object.keys(skills).length > 0 && (
        <section className="px-6 py-24 bg-[var(--bg-subtle)]">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-3">Toolkit</p>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold">Skills & Technologies</h2>
                </div>
                <Link href="/skills" className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  All skills <ArrowRight size={14} />
                </Link>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {Object.entries(skills).slice(0, 3).map(([category, items], ci) => (
                <RevealOnScroll key={category} delay={ci * 80}>
                  <div>
                    <h3 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">{category}</h3>
                    <div className="flex flex-col gap-4">
                      {items.map((skill) => (
                        <SkillBar key={skill.id} name={skill.name} level={skill.level} icon={skill.icon} />
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST BLOG POSTS ─────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-3">Writing</p>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold">Latest Posts</h2>
                </div>
                <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  All posts <ArrowRight size={14} />
                </Link>
              </div>
            </RevealOnScroll>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <RevealOnScroll key={post.id} delay={i * 100}>
                  <BlogCard post={post} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--border)]">
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-6">Let's connect</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Have a project in mind?
            </h2>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              I'm always open to interesting collaborations, internship opportunities,
              or just a good conversation about tech.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-full hover:opacity-90 transition-opacity">
              Get in touch <ArrowRight size={16} />
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
