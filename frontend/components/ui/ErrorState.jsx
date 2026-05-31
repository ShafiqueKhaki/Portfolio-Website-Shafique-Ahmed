import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <AlertTriangle size={32} className="text-[var(--accent)] mb-4" />
      <p className="text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
