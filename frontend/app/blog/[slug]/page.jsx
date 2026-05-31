"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, User } from "lucide-react";
import { publicApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicApi.getBlogPost(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (notFound) return (
    <div className="max-w-6xl mx-auto px-6 pt-32 text-center">
      <h1 className="font-display text-3xl mb-4">Post not found</h1>
      <Link href="/blog" className="text-[var(--accent)]">← Back to blog</Link>
    </div>
  );

  const { title, content, excerpt, cover_image, tags, reading_time_minutes, published_at, category, author } = post;

  return (
    <article className="max-w-3xl mx-auto px-6 pt-28 pb-24">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-8">
        <ArrowLeft size={14} /> All Posts
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[var(--text-muted)]">
        {category && <span className="flex items-center gap-1.5"><Tag size={12} className="text-[var(--accent)]" /> {category.name}</span>}
        {published_at && <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(published_at)}</span>}
        <span className="flex items-center gap-1.5"><Clock size={12} /> {reading_time_minutes} min read</span>
        {author && <span className="flex items-center gap-1.5"><User size={12} /> {author.name}</span>}
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">{title}</h1>

      {excerpt && <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-8 border-l-2 border-[var(--accent)] pl-5 italic font-display">{excerpt}</p>}

      {cover_image && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-10 border border-[var(--border)]">
          <Image src={cover_image} alt={title} width={900} height={506} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-[var(--text)] prose-headings:font-display prose-a:text-[var(--accent)] prose-code:font-mono">
        {content ? (
          content.split("\n").map((para, i) =>
            para.startsWith("# ") ? <h2 key={i} className="font-display text-2xl font-semibold mt-10 mb-4">{para.slice(2)}</h2> :
            para.startsWith("## ") ? <h3 key={i} className="font-display text-xl font-semibold mt-8 mb-3">{para.slice(3)}</h3> :
            para.trim() ? <p key={i} className="text-[var(--text-muted)] leading-relaxed mb-4">{para}</p> :
            <br key={i} />
          )
        ) : <p className="text-[var(--text-muted)]">Content not available.</p>}
      </div>

      {/* Tags */}
      {(tags || []).length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`}
              className="text-xs px-3 py-1 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-8 mt-12">
        <Link href="/blog" className="text-[var(--accent)] text-sm hover:underline">← Back to all posts</Link>
      </div>
    </article>
  );
}
