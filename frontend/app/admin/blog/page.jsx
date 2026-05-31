"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Clock } from "lucide-react";
import { adminApi, publicApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";
import { formatDate, readingTime } from "@/lib/utils";

const EMPTY = { title: "", excerpt: "", content: "", cover_image: "", category_id: "", tags: "", is_published: false, reading_time_minutes: 1 };

function BlogContent() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coverImg, setCoverImg] = useState("");

  const { register, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: EMPTY });
  const content = watch("content");

  // Auto-calc reading time
  useEffect(() => {
    if (content) setValue("reading_time_minutes", readingTime(content));
  }, [content, setValue]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([adminApi.getBlogPosts(), publicApi.getCategories("blog")])
      .then(([p, c]) => { setPosts(p); setCategories(c); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setCoverImg(""); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); reset({ ...p, tags: (p.tags || []).join(", "), category_id: p.category_id || "" }); setCoverImg(p.cover_image || ""); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, cover_image: coverImg, category_id: data.category_id ? parseInt(data.category_id) : null, tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [], reading_time_minutes: parseInt(data.reading_time_minutes) };
      if (editing) await adminApi.updateBlogPost(editing.id, payload);
      else await adminApi.createBlogPost(payload);
      toast.success(editing ? "Updated!" : "Created!"); setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await adminApi.deleteBlogPost(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); fetchData(); }
    catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Blog Posts</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> New Post
        </button>
      </div>

      {loading ? <LoadingSpinner /> : posts.length === 0 ? <EmptyState icon={FileText} message="No posts yet." /> : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full admin-table">
            <thead className="border-b border-[var(--border)]">
              <tr>{["Title", "Category", "Reading time", "Published", "Date", ""].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]"><span className="flex items-center gap-1"><Clock size={11} /> {p.reading_time_minutes}m</span></td>
                  <td className="px-4 py-3">{p.is_published ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-[var(--text-muted)]" />}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(p.created_at)}</td>
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

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Post" : "New Post"} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input {...register("title", { required: true })} className={InputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt (shown in cards)</label>
            <textarea {...register("excerpt")} rows={2} className={`${InputClass} resize-none`} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select {...register("category_id")} className={InputClass}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (comma-separated)</label>
              <input {...register("tags")} placeholder="python, webdev, tutorial" className={InputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Content (Markdown)</label>
            <textarea {...register("content")} rows={12} className={`${InputClass} resize-none font-mono text-xs`} placeholder="# Heading&#10;&#10;Your content here..." />
          </div>
          <ImageUpload value={coverImg} onChange={setCoverImg} folder="portfolio/blog" label="Cover Image" />
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Reading Time (min)</label>
              <input {...register("reading_time_minutes")} type="number" min={1} className={`${InputClass} w-24`} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
              <input {...register("is_published")} type="checkbox" className="accent-[var(--accent)]" /> Publish publicly
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-subtle)] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {saving ? <InlineSpinner size={14} /> : null} {editing ? "Update" : "Publish"}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Post" message={`Permanently delete "${deleteTarget?.title}"?`} />
    </div>
  );
}

export default function AdminBlogPage() {
  return <AdminGuard><AdminShell><BlogContent /></AdminShell></AdminGuard>;
}
