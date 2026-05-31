"use client";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";
import Image from "next/image";

const ACCEPT_ALL = "image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
const ACCEPT_IMAGES = "image/*";

function isImage(url) {
  if (!url) return false;
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

function isPdf(url) {
  if (!url) return false;
  return /\.pdf(\?.*)?$/i.test(url) || url.includes("/raw/upload/");
}

export default function ImageUpload({ value, onChange, folder = "portfolio", label = "Image", accept = "all" }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const acceptAttr = accept === "images" ? ACCEPT_IMAGES : ACCEPT_ALL;

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.upload(file, folder);
      onChange(result.url);
      toast.success("Uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const renderPreview = () => {
    if (!value) return null;
    if (isImage(value)) {
      return (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-xl overflow-hidden border border-[var(--border)] relative">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
            <X size={12} />
          </button>
        </div>
      );
    }
    // PDF or other file
    return (
      <div className="relative inline-flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] border border-[var(--accent)] rounded-xl">
        <span className="text-2xl">{isPdf(value) ? "📄" : "📎"}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--accent)]">File uploaded</p>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:underline truncate block max-w-40">
            View file ↗
          </a>
        </div>
        <button type="button" onClick={() => onChange("")} className="ml-2 text-[var(--text-muted)] hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {value ? renderPreview() : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-32 h-32 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          {uploading ? <InlineSpinner size={20} /> : <><Upload size={20} /><span className="text-xs mt-1">Upload</span></>}
        </div>
      )}
      <input ref={inputRef} type="file" accept={acceptAttr} className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste URL"
        className="mt-2 w-full text-xs px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]" />
    </div>
  );
}
