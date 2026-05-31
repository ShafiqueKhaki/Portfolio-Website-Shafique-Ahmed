"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MailOpen, Trash2, Search, ExternalLink } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function MessagesContent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (filterUnread) params.unread = true;
    if (search) params.search = search;
    adminApi.getMessages(params).then(setMessages).finally(() => setLoading(false));
  };
  useEffect(fetchData, [filterUnread, search]);

  const markRead = async (msg) => {
    if (msg.is_read) return;
    try {
      await adminApi.markRead(msg.id);
      setMessages(msgs => msgs.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    } catch { toast.error("Failed to mark as read"); }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    markRead(msg);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await adminApi.deleteMessage(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); setSelected(null); fetchData(); }
    catch (err) { toast.error(err.message || "Failed to delete"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Messages</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); }}
              placeholder="Search…" className="pl-8 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors w-48" />
          </div>
          <button onClick={() => setFilterUnread(!filterUnread)}
            className={cn("px-3 py-2 text-sm border rounded-lg transition-colors", filterUnread ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]")}>
            Unread only
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : messages.length === 0 ? <EmptyState icon={Mail} message="No messages." /> : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {messages.map((msg, i) => (
            <div key={msg.id}
              onClick={() => openMessage(msg)}
              className={cn(
                "flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors",
                i < messages.length - 1 && "border-b border-[var(--border)]",
                !msg.is_read && "bg-[var(--accent)]/5"
              )}>
              <div className={cn("mt-0.5 flex-shrink-0", msg.is_read ? "text-[var(--text-muted)]" : "text-[var(--accent)]")}>
                {msg.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className={cn("text-sm", !msg.is_read && "font-semibold")}>{msg.name}</p>
                  <span className="text-xs text-[var(--text-muted)]">{msg.email}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">{msg.subject || msg.message}</p>
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatDate(msg.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Message detail modal */}
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={selected?.subject || "Message"} wide>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
              <span>From: <strong className="text-[var(--text)]">{selected.name}</strong> &lt;{selected.email}&gt;</span>
              <span>{formatDate(selected.created_at)}</span>
            </div>
            <div className="p-4 bg-[var(--bg-subtle)] rounded-xl whitespace-pre-wrap text-sm leading-relaxed">
              {selected.message}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(selected)}
                className="flex items-center gap-2 px-4 py-2 border border-red-400/30 text-red-400 rounded-lg text-sm hover:bg-red-400/10 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0f0f0c] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <ExternalLink size={14} /> Reply via Email
              </a>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Message" message={`Delete message from "${deleteTarget?.name}"?`} />
    </div>
  );
}

export default function AdminMessagesPage() {
  return <AdminGuard><AdminShell><MessagesContent /></AdminShell></AdminGuard>;
}
