import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function BlogCard({ post }) {
  const { title, slug, excerpt, cover_image, tags, reading_time_minutes, published_at, category } = post;

  return (
    <article className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)] transition-all duration-300">
      {cover_image && (
        <Link href={`/blog/${slug}`} className="block aspect-video relative overflow-hidden">
          <Image src={cover_image} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {category && (
            <span className="text-xs text-[var(--accent)] font-medium">{category.name}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock size={11} /> {reading_time_minutes} min read
          </span>
          {published_at && (
            <span className="text-xs text-[var(--text-muted)]">{formatDate(published_at)}</span>
          )}
        </div>
        <Link href={`/blog/${slug}`}>
          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">{excerpt}</p>
        {(tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] rounded-full text-[var(--text-muted)]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
