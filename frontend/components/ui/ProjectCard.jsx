import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectCard({ project }) {
  const { title, slug, summary, cover_image, tech_stack, demo_url, repo_url, is_featured } = project;

  return (
    <article className={cn(
      "group relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden",
      "hover:border-[var(--accent)] transition-all duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/40"
    )}>
      {/* Cover image */}
      <Link href={`/projects/${slug}`} className="block aspect-video relative overflow-hidden bg-[var(--bg-subtle)]">
        {cover_image ? (
          <Image
            src={cover_image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-[var(--border)]">{title[0]}</span>
          </div>
        )}
        {is_featured && (
          <span className="absolute top-3 left-3 bg-[var(--accent)] text-[#0f0f0c] text-xs font-medium px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </Link>

      <div className="p-5">
        <Link href={`/projects/${slug}`}>
          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">{summary}</p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(tech_stack || []).slice(0, 4).map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-[var(--text-muted)]">
              {tech}
            </span>
          ))}
          {(tech_stack || []).length > 4 && (
            <span className="text-xs px-2 py-0.5 text-[var(--text-muted)]">+{tech_stack.length - 4}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {demo_url && (
            <a href={demo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:opacity-80 transition-opacity">
              <ExternalLink size={13} /> Demo
            </a>
          )}
          {repo_url && (
            <a href={repo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <Github size={13} /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
