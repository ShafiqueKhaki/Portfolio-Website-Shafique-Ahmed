"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { groupBy } from "@/lib/utils";
import SkillBar from "@/components/ui/SkillBar";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const CATEGORY_ORDER = ["Languages", "Frameworks", "Tools", "Concepts"];

export default function SkillsPage() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getSkills()
      .then((data) => setGrouped(groupBy(data, "category")))
      .finally(() => setLoading(false));
  }, []);

  const orderedKeys = [
    ...CATEGORY_ORDER.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !CATEGORY_ORDER.includes(k)),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader
        title="Skills & Technologies"
        subtitle="An honest snapshot of where I am right now. Levels are self-assessed and intentionally conservative — I'd rather be accurate than impressive."
        accent="Toolkit"
      />

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-16 mb-24">
          {orderedKeys.map((category, i) => (
            <RevealOnScroll key={category} delay={i * 80}>
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display text-xl font-semibold">{category}</h2>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-muted)] font-mono">{grouped[category].length} skills</span>
                </div>
                <div className="flex flex-col gap-6">
                  {grouped[category].map((skill) => (
                    <SkillBar key={skill.id} name={skill.name} level={skill.level} icon={skill.icon} />
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          ))}
        </div>
      )}

      {/* Legend */}
      <RevealOnScroll>
        <div className="mb-24 p-6 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl max-w-lg">
          <h3 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">Proficiency Scale</h3>
          <div className="space-y-2">
            {[
              [1, "Beginner", "Aware of the concept, can follow tutorials"],
              [2, "Elementary", "Can use it with documentation open"],
              [3, "Intermediate", "Can build projects independently"],
              [4, "Proficient", "Comfortable, fast, can mentor others"],
              [5, "Expert", "Deep knowledge, can optimize & architect"],
            ].map(([level, label, desc]) => (
              <div key={level} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-[var(--accent)] w-4">{level}</span>
                <span className="font-medium w-24">{label}</span>
                <span className="text-[var(--text-muted)] text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
