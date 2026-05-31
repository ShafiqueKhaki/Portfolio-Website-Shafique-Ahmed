"use client";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Play, ArrowLeft, Calendar, Tag } from "lucide-react";
import { publicApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    publicApi.getProject(slug)
      .then(setProject)
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (notFoundState) return (
    <div className="max-w-6xl mx-auto px-6 pt-32 text-center">
      <h1 className="font-display text-3xl mb-4">Project not found</h1>
      <Link href="/projects" className="text-[var(--accent)]">← Back to projects</Link>
    </div>
  );

  const { title, description, role, year, status, cover_image, gallery, demo_url, repo_url, video_url, tech_stack, category } = project;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-8">
        <ArrowLeft size={14} /> All Projects
      </Link>

      {/* Cover */}
      {cover_image && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-10 border border-[var(--border)]">
          <Image src={cover_image} alt={title} width={1200} height={675} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-[var(--text-muted)]">
          {category && <span className="flex items-center gap-1"><Tag size={12} /> {category.name}</span>}
          {year && <span className="flex items-center gap-1"><Calendar size={12} /> {year}</span>}
          <span className="capitalize px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-xs">{status}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">{title}</h1>
        {role && <p className="text-[var(--text-muted)]">Role: <span className="text-[var(--text)]">{role}</span></p>}

        {/* Links */}
        <div className="flex flex-wrap gap-3 mt-6">
          {demo_url && (
            <a href={demo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[#0f0f0c] rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
          {repo_url && (
            <a href={repo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-full text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              <Github size={14} /> View Code
            </a>
          )}
          {video_url && (
            <a href={video_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-full text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              <Play size={14} /> Watch Demo
            </a>
          )}
        </div>
      </div>

      {/* Tech stack */}
      {(tech_stack || []).length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-lg font-semibold mb-3">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {tech_stack.map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-sm text-[var(--text-muted)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">About this project</h2>
          <div className="text-[var(--text-muted)] leading-relaxed space-y-4">
            {description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}

      {/* Gallery */}
      {(gallery || []).length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-[var(--border)]">
                <Image src={img} alt={`${title} screenshot ${i + 1}`} width={600} height={340} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-8 mt-12">
        <Link href="/projects" className="text-[var(--accent)] text-sm hover:underline">← Back to all projects</Link>
      </div>
    </div>
  );
}
