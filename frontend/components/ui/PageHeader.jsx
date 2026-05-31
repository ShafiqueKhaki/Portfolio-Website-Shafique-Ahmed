export default function PageHeader({ title, subtitle, accent }) {
  return (
    <div className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
      <div className="max-w-2xl">
        {accent && (
          <p className="text-sm text-[var(--accent)] font-mono tracking-widest uppercase mb-4">{accent}</p>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-[var(--text-muted)] leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
