"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { adminApi, publicApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { FolderOpen } from "lucide-react";

const EMPTY = { title: "", summary: "", description: "", role: "", year: "", status: "completed", cover_image: "", demo_url: "", repo_url: "", video_url: "", tech_stack: "", is_featured: false, is_active: true, category_id: "" };

function ProjectsContent() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm({ defaultValues: EMPTY });
  const coverImage = watch("cover_image");

  const fetchData = () => {
    setLoading(true);
    Promise.all([adminApi.getProjects(), publicApi.getCategories("project")])
      .then(([p, c]) => { setProjects(p); setCategories(c); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    reset({ ...p, tech_stack: (p.tech_stack || []).join(", "), category_id: p.category_id || "" });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, year: data.year ? parseInt(data.year) : null, tech_stack: data.tech_stack ? data.tech_stack.split(",").map(t => t.trim()).filter(Boolean) : [], category_id: data.category_id ? parseInt(data.category_id) : null };
      if (editing) await adminApi.updateProject(editing.id, payload);
      else await adminApi.createProject(payload);
      toast.success(editing ? "Project updated!" : "Project created!");
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteProject(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Projects</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {loading ? <LoadingSpinner /> : projects.length === 0 ? <EmptyState message="No projects yet." icon={FolderOpen} /> : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full admin-table">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {["Title", "Status", "Year", "Featured", "Active", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                  <td className="px-4 py-3"><span className="text-xs capitalize px-2 py-0.5 bg-[var(--bg-subtle)] rounded-full border border-[var(--border)]">{p.status}</span></td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{p.year || "—"}</td>
                  <td className="px-4 py-3">{p.is_featured ? <Star size={14} className="text-[var(--accent)]" /> : <span className="text-[var(--border)]">—</span>}</td>
                  <td className="px-4 py-3">{p.is_active ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-[var(--text-muted)]" />}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Project" : "Add Project"} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input {...register("title", { required: true })} className={InputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Summary (one-liner)</label>
              <input {...register("summary")} className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <input {...register("role")} placeholder="e.g. Full-stack Developer" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Year</label>
              <input {...register("year")} type="number" placeholder="2024" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select {...register("status")} className={InputClass}>
                {["completed", "in-progress", "archived", "planned"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select {...register("category_id")} className={InputClass}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Tech Stack (comma-separated)</label>
              <input {...register("tech_stack")} placeholder="Next.js, FastAPI, PostgreSQL" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Demo URL</label>
              <input {...register("demo_url")} type="url" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Repo URL</label>
              <input {...register("repo_url")} type="url" className={InputClass} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload value={coverImage} onChange={(v) => setValue("cover_image", v)} folder="portfolio/projects" label="Cover Image" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea {...register("description")} rows={4} className={`${InputClass} resize-none`} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register("is_featured")} type="checkbox" className="accent-[var(--accent)]" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register("is_active")} type="checkbox" className="accent-[var(--accent)]" /> Active
              </label>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}

export default function AdminProjectsPage() {
  return <AdminGuard><AdminShell><ProjectsContent /></AdminShell></AdminGuard>;
}
