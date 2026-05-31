"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Github, Linkedin, Twitter, Send, MapPin } from "lucide-react";
import { publicApi } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import { InlineSpinner } from "@/components/ui/LoadingSpinner";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export default function ContactPage() {
  const [profile, setProfile] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    publicApi.getProfile().then(setProfile).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setSending(true);
    try {
      await publicApi.sendContact(data);
      toast.success("Message sent! I'll get back to you soon.");
      setSent(true);
      reset();
    } catch (err) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const InputClass = "w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]";

  return (
    <div className="max-w-6xl mx-auto px-6">
      <PageHeader title="Get in Touch" subtitle="Have a question, project idea, or just want to say hi? My inbox is always open." accent="Contact" />

      <div className="grid md:grid-cols-[2fr_1fr] gap-16 mb-24">
        {/* Form */}
        <div>
          {sent ? (
            <div className="p-8 bg-[var(--surface)] border border-[var(--accent)] rounded-2xl text-center">
              <p className="text-4xl mb-4">✅</p>
              <h3 className="font-display text-xl font-semibold mb-2">Message sent!</h3>
              <p className="text-[var(--text-muted)] mb-6">Thanks for reaching out. I typically respond within 1-2 days.</p>
              <button onClick={() => setSent(false)} className="text-sm text-[var(--accent)] hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input {...register("name")} placeholder="Your name" className={InputClass} />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input {...register("email")} type="email" placeholder="your@email.com" className={InputClass} />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input {...register("subject")} placeholder="What's this about?" className={InputClass} />
                {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea {...register("message")} rows={6} placeholder="Tell me more…" className={`${InputClass} resize-none`} />
                {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={sending}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--accent)] text-[#0f0f0c] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-60">
                {sending ? <><InlineSpinner size={14} /> Sending…</> : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-4">Direct Contact</p>
            <div className="space-y-3">
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  <Mail size={16} className="text-[var(--accent)]" /> {profile.email}
                </a>
              )}
              {profile?.location && (
                <p className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <MapPin size={16} className="text-[var(--accent)]" /> {profile.location}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-4">Social</p>
            <div className="space-y-3">
              {[
                { href: profile?.github, icon: Github, label: "GitHub" },
                { href: profile?.linkedin, icon: Linkedin, label: "LinkedIn" },
                { href: profile?.twitter, icon: Twitter, label: "X / Twitter" },
              ].filter(s => s.href).map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  <Icon size={16} className="text-[var(--accent)]" /> {label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--text-muted)]">
              ⏱️ I usually respond within <strong className="text-[var(--text)]">1-2 business days</strong>. For urgent matters, email is best.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
