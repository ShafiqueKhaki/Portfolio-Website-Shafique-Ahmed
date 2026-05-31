"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";
import { formatDateRange } from "@/lib/utils";

const EMPTY = { role: "", company: "", location: "", type: "job", start_date: "", end_date: "", is_current: false, description: "", skills: "", order: 0 };
const TYPES = ["job", "internship", "freelance", "volunteer"];

function ExperienceContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  const fetchData = () => {
    setLoading(true);
    adminApi.getExperiences().then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setModalOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    reset({ ...e, skills: (e.skills || []).join(", "), end_date: e.end_date || "" });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        order: parseInt(data.order),
        end_date: data.is_current ? null : (data.end_date || null),
      };
      if (editing) await adminApi.updateExperience(editing.id, payload);
      else await adminApi.createExperience(payload);
      toast.success(editing ? "Updated!" : "Created!");
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteExperience(deleteTarget.id);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Experience</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon={Briefcase} message="No experience entries yet." /> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
              <div>
                <p className="font-semibold text-sm">{item.role}</p>
                <p className="text-[var(--text-muted)] text-sm">{item.company} · {item.location}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{formatDateRange(item.start_date, item.end_date, item.is_current)}</p>
                <span className="text-xs capitalize mt-1 inline-block px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full">{item.type}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Experience" : "Add Experience"} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Role *</label>
              <input {...register("role", { required: true })} className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company *</label>
              <input {...register("company", { required: true })} className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input {...register("location")} className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select {...register("type")} className={InputClass}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date *</label>
              <input {...register("start_date", { required: true })} type="date" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date</label>
              <input {...register("end_date")} type="date" className={InputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register("is_current")} type="checkbox" className="accent-[var(--accent)]" /> Currently working here
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Skills used (comma-separated)</label>
              <input {...register("skills")} placeholder="FastAPI, PostgreSQL, React" className={InputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea {...register("description")} rows={4} className={`${InputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Order</label>
              <input {...register("order")} type="number" className={InputClass} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-subtle)] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {saving ? <InlineSpinner size={14} /> : null} {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Experience" message={`Delete "${deleteTarget?.role} at ${deleteTarget?.company}"?`} />
    </div>
  );
}

export default function AdminExperiencePage() {
  return <AdminGuard><AdminShell><ExperienceContent /></AdminShell></AdminGuard>;
}
