"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Zap } from "lucide-react";
import { SKILL_LABELS } from "@/lib/utils";

const EMPTY = { name: "", category: "Languages", level: 3, icon: "", order: 0, is_active: true };
const CATEGORIES = ["Languages", "Frameworks", "Tools", "Concepts", "Other"];

function SkillsContent() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  const fetchData = () => {
    setLoading(true);
    adminApi.getSkills().then(setSkills).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); reset(s); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, level: parseInt(data.level), order: parseInt(data.order) };
      if (editing) await adminApi.updateSkill(editing.id, payload);
      else await adminApi.createSkill(payload);
      toast.success(editing ? "Skill updated!" : "Skill added!");
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteTarget.id);
      toast.success("Skill deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  // Group by category for display
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const uncategorized = skills.filter(s => !CATEGORIES.includes(s.category));
  if (uncategorized.length) grouped["Other"] = uncategorized;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Skills</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {loading ? <LoadingSpinner /> : skills.length === 0 ? <EmptyState message="No skills yet." icon={Zap} /> : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">{category}</h2>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <table className="w-full admin-table">
                  <thead className="border-b border-[var(--border)]">
                    <tr>
                      {["Name", "Level", "Icon", "Order", "Active", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {items.sort((a, b) => a.order - b.order).map((skill) => (
                      <tr key={skill.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{skill.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(d => (
                                <div key={d} className={`w-2 h-2 rounded-full ${d <= skill.level ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">{SKILL_LABELS[skill.level]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{skill.icon || "—"}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-muted)] font-mono">{skill.order}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${skill.is_active ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-[var(--text-muted)] border-[var(--border)]"}`}>
                            {skill.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(skill)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteTarget(skill)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name *</label>
            <input {...register("name", { required: true })} className={InputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select {...register("category")} className={InputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Level (1–5)</label>
              <select {...register("level")} className={InputClass}>
                {[1,2,3,4,5].map(l => <option key={l} value={l}>{l} — {SKILL_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Icon (emoji)</label>
              <input {...register("icon")} placeholder="🐍" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Order</label>
              <input {...register("order")} type="number" className={InputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input {...register("is_active")} type="checkbox" className="accent-[var(--accent)]" /> Show publicly
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-subtle)] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {saving ? <InlineSpinner size={14} /> : null} {editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Skill" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}

export default function AdminSkillsPage() {
  return <AdminGuard><AdminShell><SkillsContent /></AdminShell></AdminGuard>;
}
