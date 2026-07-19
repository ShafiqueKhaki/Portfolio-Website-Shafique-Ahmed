"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminApi, publicApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ImageUpload from "@/components/admin/ImageUpload";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const FIELDS = [
  { name: "full_name", label: "Full Name", type: "text" },
  { name: "headline", label: "Headline / Tagline", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "github", label: "GitHub URL", type: "url" },
  { name: "linkedin", label: "LinkedIn URL", type: "url" },
  { name: "website", label: "Website URL", type: "url" },
];

function ProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    publicApi.getProfile().then((p) => {
      reset(p);
      setAvatar(p.avatar || "");
      setResumeUrl(p.resume_url || "");
    }).finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await adminApi.updateProfile({ ...data, avatar, resume_url: resumeUrl });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const InputClass = "w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold mb-8">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <ImageUpload value={avatar} onChange={setAvatar} folder="portfolio/avatars" label="Avatar" />
          <div>
            <label className="block text-sm font-medium mb-2">Résumé / CV</label>
            <input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="Cloudinary URL or Google Drive link"
              className={InputClass} />
            <p className="text-xs text-[var(--text-muted)] mt-1">Upload via Cloudinary or paste a link</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {FIELDS.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-2">{label}</label>
              <input {...register(name)} type={type} className={InputClass} />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea {...register("bio")} rows={6} className={`${InputClass} resize-none`} />
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60">
          {saving ? <><InlineSpinner size={14} /> Saving…</> : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <AdminGuard>
      <AdminShell>
        <ProfileContent />
      </AdminShell>
    </AdminGuard>
  );
}
