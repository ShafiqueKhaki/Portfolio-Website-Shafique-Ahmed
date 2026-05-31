const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let data;
    try { data = await res.json(); } catch { data = {}; }
    throw new ApiError(data?.detail || `Request failed: ${res.status}`, res.status, data);
  }

  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function authRequest(path, options = {}) {
  const token = getToken();
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
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
  refresh: (refresh_token) => request("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),
  me: () => authRequest("/api/auth/me"),
  changePassword: (body) => authRequest("/api/auth/change-password", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Admin API ───────────────────────────────────────────────────
export const adminApi = {
  // Profile
  updateProfile: (body) => authRequest("/api/admin/profile", { method: "PUT", body: JSON.stringify(body) }),

  // Projects
  getProjects: () => authRequest("/api/admin/projects"),
  createProject: (body) => authRequest("/api/admin/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id, body) => authRequest(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProject: (id) => authRequest(`/api/admin/projects/${id}`, { method: "DELETE" }),

  // Skills
  getSkills: () => authRequest("/api/admin/skills"),
  createSkill: (body) => authRequest("/api/admin/skills", { method: "POST", body: JSON.stringify(body) }),
  updateSkill: (id, body) => authRequest(`/api/admin/skills/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSkill: (id) => authRequest(`/api/admin/skills/${id}`, { method: "DELETE" }),

  // Experiences
  getExperiences: () => authRequest("/api/admin/experiences"),
  createExperience: (body) => authRequest("/api/admin/experiences", { method: "POST", body: JSON.stringify(body) }),
  updateExperience: (id, body) => authRequest(`/api/admin/experiences/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteExperience: (id) => authRequest(`/api/admin/experiences/${id}`, { method: "DELETE" }),

  // Education
  getEducation: () => authRequest("/api/admin/education"),
  createEducation: (body) => authRequest("/api/admin/education", { method: "POST", body: JSON.stringify(body) }),
  updateEducation: (id, body) => authRequest(`/api/admin/education/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEducation: (id) => authRequest(`/api/admin/education/${id}`, { method: "DELETE" }),

  // Certifications
  getCertifications: () => authRequest("/api/admin/certifications"),
  createCertification: (body) => authRequest("/api/admin/certifications", { method: "POST", body: JSON.stringify(body) }),
  updateCertification: (id, body) => authRequest(`/api/admin/certifications/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCertification: (id) => authRequest(`/api/admin/certifications/${id}`, { method: "DELETE" }),

  // Achievements
  getAchievements: () => authRequest("/api/admin/achievements"),
  createAchievement: (body) => authRequest("/api/admin/achievements", { method: "POST", body: JSON.stringify(body) }),
  updateAchievement: (id, body) => authRequest(`/api/admin/achievements/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAchievement: (id) => authRequest(`/api/admin/achievements/${id}`, { method: "DELETE" }),

  // Blog
  getBlogPosts: () => authRequest("/api/admin/blog"),
  createBlogPost: (body) => authRequest("/api/admin/blog", { method: "POST", body: JSON.stringify(body) }),
  updateBlogPost: (id, body) => authRequest(`/api/admin/blog/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBlogPost: (id) => authRequest(`/api/admin/blog/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => authRequest("/api/admin/categories"),
  createCategory: (body) => authRequest("/api/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id, body) => authRequest(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id) => authRequest(`/api/admin/categories/${id}`, { method: "DELETE" }),

  // Messages
  getMessages: (params = {}) => authRequest(`/api/admin/messages?${new URLSearchParams(params)}`),
  markRead: (id) => authRequest(`/api/admin/messages/${id}/read`, { method: "PUT" }),
  deleteMessage: (id) => authRequest(`/api/admin/messages/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: () => authRequest("/api/admin/analytics"),

  // Upload
  upload: async (file, folder = "portfolio") => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/admin/upload?folder=${folder}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data?.detail || "Upload failed", res.status, data);
    }
    return res.json();
  },
};
