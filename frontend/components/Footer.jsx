"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import Logo from "@/components/Logo";

export default function Footer() {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile().then(setProfile).catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  const socials = [
    { href: profile?.github, icon: Github, label: "GitHub" },
    { href: profile?.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: profile?.email ? `mailto:${profile.email}` : null, icon: Mail, label: "Email" },
  ].filter(s => s.href);

  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Logo size={40} linkTo="/" />
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {profile?.headline || "CS Student & Aspiring Software Engineer"} · {profile?.location || "Sukkur, Pakistan"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <Logo size={40} linkTo="/" />
      </div>
    </footer>
  );
}
