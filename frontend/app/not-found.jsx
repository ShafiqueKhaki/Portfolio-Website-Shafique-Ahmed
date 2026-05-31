import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-8xl font-bold text-[var(--border)] mb-6">404</p>
        <h1 className="font-display text-3xl font-semibold mb-4">Page not found</h1>
        <p className="text-[var(--text-muted)] mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-full hover:opacity-90 transition-opacity text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
