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
import { Tag } from "lucide-react";

const EMPTY = { name: "", type: "project" };

function CategoriesContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  const fetchData = () => { setLoading(true); adminApi.getCategories().then(setItems).finally(() => setLoading(false)); };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setModalOpen(true); };
  const openEdit = (e) => { setEditing(e); reset(e); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) await adminApi.updateCategory(editing.id, data);
      else await adminApi.createCategory(data);
      toast.success(editing ? "Updated!" : "Created!"); setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await adminApi.deleteCategory(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); fetchData(); }
    catch (err) { toast.error(err.message || "Failed to delete — it may still be in use."); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";
  const projectCats = items.filter(c => c.type === "project");
  const blogCats = items.filter(c => c.type === "blog");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon={Tag} message="No categories yet." /> : (
        <div className="grid md:grid-cols-2 gap-8">
          {[{ label: "Project Categories", items: projectCats }, { label: "Blog Categories", items: blogCats }].map(({ label, items: catItems }) => (
            <div key={label}>
              <h2 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">{label}</h2>
              {catItems.length === 0 ? <p className="text-sm text-[var(--text-muted)]">None yet.</p> : (
                <div className="space-y-2">
                  {catItems.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono">/{cat.slug}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name *</label>
            <input {...register("name", { required: true })} className={InputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select {...register("type")} className={InputClass}>
              <option value="project">Project</option>
              <option value="blog">Blog</option>
            </select>
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
        title="Delete Category" message={`Delete "${deleteTarget?.name}"? Projects/posts in this category will become uncategorized.`} />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return <AdminGuard><AdminShell><CategoriesContent /></AdminShell></AdminGuard>;
}
