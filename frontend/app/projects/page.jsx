"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import ProjectCard from "@/components/ui/ProjectCard";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTech, setActiveTech] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    Promise.all([publicApi.getProjects(), publicApi.getCategories("project")])
      .then(([p, c]) => { setProjects(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique techs
  const allTechs = [...new Set(projects.flatMap((p) => p.tech_stack || []))].sort();

  const filtered = projects
    .filter((p) => !activeCategory || p.category_id === activeCategory)
    .filter((p) => !activeTech || (p.tech_stack || []).map(t => t.toLowerCase()).includes(activeTech.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      if (sortBy === "year") return (b.year || 0) - (a.year || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader
        title="Projects"
        subtitle="A collection of things I've built — from university assignments to freelance work to side projects."
        accent="Work"
      />

      {/* Filters */}
      <div className="mb-10 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)}
            className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
              !activeCategory ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]")}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
              className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
                activeCategory === c.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]")}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <select value={activeTech} onChange={(e) => setActiveTech(e.target.value)}
            className="text-sm px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]">
            <option value="">All Tech</option>
            {allTechs.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]">
            <option value="newest">Newest</option>
            <option value="year">Year</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No projects match the current filters." icon={Layers} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
