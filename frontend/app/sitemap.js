const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://shafique-ahmed.vercel.app";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchSlugs(path) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    const res = await fetch(`${API}${path}`, {
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return []; // silently return empty on timeout or error
  }
}

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/skills`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/experience`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/education`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];

  const [projects, posts] = await Promise.all([
    fetchSlugs("/api/projects"),
    fetchSlugs("/api/blog"),
  ]);

  const projectRoutes = projects.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.published_at || p.created_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}