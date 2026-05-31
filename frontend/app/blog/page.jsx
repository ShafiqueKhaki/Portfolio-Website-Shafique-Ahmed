"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import BlogCard from "@/components/ui/BlogCard";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    Promise.all([publicApi.getBlogPosts(), publicApi.getCategories("blog")])
      .then(([p, c]) => { setPosts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();

  const filtered = posts.filter((p) => {
    if (activeCategory && p.category_id !== activeCategory) return false;
    if (activeTag && !(p.tags || []).includes(activeTag)) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader title="Writing" subtitle="Notes, tutorials, and opinions on software development, learning, and life as a CS student." accent="Blog" />

      {/* Search */}
      <div className="mb-8 relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory(null)}
          className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
            !activeCategory ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]")}>
          All Categories
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
            className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
              activeCategory === c.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]")}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn("text-xs px-2.5 py-1 rounded-full transition-colors",
                activeTag === tag ? "bg-[var(--accent)] text-[#0f0f0c]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text)]")}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message="No posts found." icon={FileText} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
