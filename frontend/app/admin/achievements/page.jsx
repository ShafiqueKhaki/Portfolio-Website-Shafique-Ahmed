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
import ImageUpload from "@/components/admin/ImageUpload";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Trophy } from "lucide-react";

const EMPTY = { title: "", description: "", date: "", category: "award", image: "", order: 0 };
const CATEGORIES = ["hackathon", "scholarship", "award", "publication", "other"];

function AchievementsContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageVal, setImageVal] = useState("");

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  const fetchData = () => { setLoading(true); adminApi.getAchievements().then(setItems).finally(() => setLoading(false)); };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setImageVal(""); setModalOpen(true); };
  const openEdit = (e) => { setEditing(e); reset({ ...e, date: e.date || "" }); setImageVal(e.image || ""); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, image: imageVal, order: parseInt(data.order), date: data.date || null };
      if (editing) await adminApi.updateAchievement(editing.id, payload);
      else await adminApi.createAchievement(payload);
      toast.success(editing ? "Updated!" : "Created!"); setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await adminApi.deleteAchievement(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); fetchData(); }
    catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Achievements</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Achievement
        </button>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon={Trophy} message="No achievements yet." /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-xl flex-shrink-0">🏆</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[var(--text-muted)] capitalize">{item.category}</p>
                {item.date && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{item.date}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Achievement" : "Add Achievement"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input {...register("title", { required: true })} className={InputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select {...register("category")} className={InputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date</label>
              <input {...register("date")} type="date" className={InputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea {...register("description")} rows={3} className={`${InputClass} resize-none`} />
          </div>
          <ImageUpload value={imageVal} onChange={setImageVal} folder="portfolio/achievements" label="Image" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Order</label>
            <input {...register("order")} type="number" className={InputClass} />
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
        title="Delete Achievement" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}

export default function AdminAchievementsPage() {
  return <AdminGuard><AdminShell><AchievementsContent /></AdminShell></AdminGuard>;
}
