import { cn } from "@/lib/utils";

export default function LoadingSpinner({ className }) {
  return (
    <div className={cn("flex items-center justify-center py-20", className)}>
      <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
    </div>
  );
}

export function InlineSpinner({ size = 16 }) {
  return (
    <div
      className="rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin inline-block"
      style={{ width: size, height: size }}
    />
  );
}
