import { SKILL_LABELS } from "@/lib/utils";

export default function SkillBar({ name, level, icon }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-sm font-medium">{name}</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{SKILL_LABELS[level] || ""}</span>
      </div>
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
          style={{ width: `${(level / 5) * 100}%` }}
        />
      </div>
      <div className="flex gap-1 mt-1.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`h-1 flex-1 rounded-full transition-colors ${dot <= level ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
