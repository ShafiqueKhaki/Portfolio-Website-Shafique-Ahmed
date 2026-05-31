"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import LoadingSpinner, { InlineSpinner } from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Award } from "lucide-react";

const EMPTY = { name: "", issuer: "", issue_date: "", expiry_date: "", credential_url: "", image: "", order: 0 };

function CertificationsContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageVal, setImageVal] = useState("");

  const { register, handleSubmit, reset } = useForm({ defaultValues: EMPTY });

  const fetchData = () => {
    setLoading(true);
    adminApi.getCertifications().then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const openAdd = () => { setEditing(null); reset(EMPTY); setImageVal(""); setModalOpen(true); };
  const openEdit = (e) => { setEditing(e); reset({ ...e, issue_date: e.issue_date || "", expiry_date: e.expiry_date || "" }); setImageVal(e.image || ""); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, image: imageVal, order: parseInt(data.order), issue_date: data.issue_date || null, expiry_date: data.expiry_date || null };
      if (editing) await adminApi.updateCertification(editing.id, payload);
      else await adminApi.createCertification(payload);
      toast.success(editing ? "Updated!" : "Created!");
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await adminApi.deleteCertification(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); fetchData(); }
    catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Certifications</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Certification
        </button>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon={Award} message="No certifications yet." /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-xl flex-shrink-0">🏅</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.issuer}</p>
                {item.issue_date && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{item.issue_date}</p>}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {item.credential_url && <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><ExternalLink size={14} /></a>}
                <button onClick={() => openEdit(item)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Certification" : "Add Certification"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name *</label>
            <input {...register("name", { required: true })} className={InputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Issuer *</label>
            <input {...register("issuer", { required: true })} className={InputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Issue Date</label>
              <input {...register("issue_date")} type="date" className={InputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
              <input {...register("expiry_date")} type="date" className={InputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Credential URL</label>
            <input {...register("credential_url")} type="url" className={InputClass} />
          </div>
          <ImageUpload value={imageVal} onChange={setImageVal} folder="portfolio/certifications" label="Certificate Image" />
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
        title="Delete Certification" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}

export default function AdminCertificationsPage() {
  return <AdminGuard><AdminShell><CertificationsContent /></AdminShell></AdminGuard>;
}
