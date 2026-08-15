const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const AUTH_PATHS = new Set(["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"]);

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let refreshInFlight = null;

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = request("/api/auth/refresh", { method: "POST" })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function request(path, options = {}, _isRetry = false) {
  const url = `${API_URL}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(url, { ...options, headers, credentials: "include" });

  if (res.status === 401 && !_isRetry && !AUTH_PATHS.has(path)) {
    try {
      await refreshSession();
      return request(path, options, true);
    } catch {
      // fall through to normal error handling below using the original response
    }
  }

  if (!res.ok) {
    let data;
    try { data = await res.json(); } catch { data = {}; }
    throw new ApiError(data?.detail || `Request failed: ${res.status}`, res.status, data);
  }

  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

// ─── Public API ──────────────────────────────────────────────────
export const publicApi = {
  getProfile: () => request("/api/profile"),
  getProjects: (params = {}) => request(`/api/projects?${new URLSearchParams(params)}`),
  getProject: (slug) => request(`/api/projects/${slug}`),
  getSkills: () => request("/api/skills"),
  getExperiences: () => request("/api/experiences"),
  getEducation: () => request("/api/education"),
  getCertifications: () => request("/api/certifications"),
  getAchievements: () => request("/api/achievements"),
  getBlogPosts: (params = {}) => request(`/api/blog?${new URLSearchParams(params)}`),
  getBlogPost: (slug) => request(`/api/blog/${slug}`),
  getCategories: (type) => request(`/api/categories${type ? `?type=${type}` : ""}`),
  sendContact: (body) => request("/api/contact", { method: "POST", body: JSON.stringify(body) }),
  logPageview: (body) => request("/api/analytics/pageview", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Auth API ────────────────────────────────────────────────────
export const authApi = {
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: () => request("/api/auth/refresh", { method: "POST" }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  changePassword: (body) => request("/api/auth/change-password", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Admin API ───────────────────────────────────────────────────
export const adminApi = {
  // Profile
  updateProfile: (body) => request("/api/admin/profile", { method: "PUT", body: JSON.stringify(body) }),

  // Projects
  getProjects: () => request("/api/admin/projects"),
  createProject: (body) => request("/api/admin/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/api/admin/projects/${id}`, { method: "DELETE" }),

  // Skills
  getSkills: () => request("/api/admin/skills"),
  createSkill: (body) => request("/api/admin/skills", { method: "POST", body: JSON.stringify(body) }),
  updateSkill: (id, body) => request(`/api/admin/skills/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSkill: (id) => request(`/api/admin/skills/${id}`, { method: "DELETE" }),

  // Experiences
  getExperiences: () => request("/api/admin/experiences"),
  createExperience: (body) => request("/api/admin/experiences", { method: "POST", body: JSON.stringify(body) }),
  updateExperience: (id, body) => request(`/api/admin/experiences/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteExperience: (id) => request(`/api/admin/experiences/${id}`, { method: "DELETE" }),

  // Education
  getEducation: () => request("/api/admin/education"),
  createEducation: (body) => request("/api/admin/education", { method: "POST", body: JSON.stringify(body) }),
  updateEducation: (id, body) => request(`/api/admin/education/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEducation: (id) => request(`/api/admin/education/${id}`, { method: "DELETE" }),

  // Certifications
  getCertifications: () => request("/api/admin/certifications"),
  createCertification: (body) => request("/api/admin/certifications", { method: "POST", body: JSON.stringify(body) }),
  updateCertification: (id, body) => request(`/api/admin/certifications/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCertification: (id) => request(`/api/admin/certifications/${id}`, { method: "DELETE" }),

  // Achievements
  getAchievements: () => request("/api/admin/achievements"),
  createAchievement: (body) => request("/api/admin/achievements", { method: "POST", body: JSON.stringify(body) }),
  updateAchievement: (id, body) => request(`/api/admin/achievements/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAchievement: (id) => request(`/api/admin/achievements/${id}`, { method: "DELETE" }),

  // Blog
  getBlogPosts: () => request("/api/admin/blog"),
  createBlogPost: (body) => request("/api/admin/blog", { method: "POST", body: JSON.stringify(body) }),
  updateBlogPost: (id, body) => request(`/api/admin/blog/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBlogPost: (id) => request(`/api/admin/blog/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/api/admin/categories"),
  createCategory: (body) => request("/api/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/api/admin/categories/${id}`, { method: "DELETE" }),

  // Messages
  getMessages: (params = {}) => request(`/api/admin/messages?${new URLSearchParams(params)}`),
  markRead: (id) => request(`/api/admin/messages/${id}/read`, { method: "PUT" }),
  deleteMessage: (id) => request(`/api/admin/messages/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: () => request("/api/admin/analytics"),

  // Upload
  upload: async (file, folder = "portfolio") => {
    const formData = new FormData();
    formData.append("file", file);
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/admin/upload?folder=${folder}`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data?.detail || "Upload failed", res.status, data);
    }
    return res.json();
  },
};
