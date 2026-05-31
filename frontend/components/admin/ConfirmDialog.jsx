"use client";
import AdminModal from "./AdminModal";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";

export default function ConfirmDialog({ open, onClose, onConfirm, loading, title = "Are you sure?", message }) {
  return (
    <AdminModal open={open} onClose={onClose} title={title}>
      <p className="text-[var(--text-muted)] mb-6">{message || "This action cannot be undone."}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-subtle)] transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-60">
          {loading ? <InlineSpinner size={14} /> : null} Delete
        </button>
      </div>
    </AdminModal>
  );
}
