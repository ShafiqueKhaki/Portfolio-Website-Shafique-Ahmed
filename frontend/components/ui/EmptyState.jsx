import { Inbox } from "lucide-react";

export default function EmptyState({ message = "Nothing here yet.", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <Icon size={32} className="text-[var(--border)] mb-4" />
      <p className="text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
