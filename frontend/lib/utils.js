import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    ...options,
  });
}

export function formatDateRange(start, end, isCurrent) {
  const s = formatDate(start, { month: "short", year: "numeric" });
  if (isCurrent) return `${s} — Present`;
  if (!end) return s;
  const e = formatDate(end, { month: "short", year: "numeric" });
  return `${s} — ${e}`;
}

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === "function" ? key(item) : item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function readingTime(content) {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

export const SKILL_LABELS = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Proficient",
  5: "Expert",
};
