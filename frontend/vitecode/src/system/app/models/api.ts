/**
 * MODEL LAYER — Central API client for Strapi v3 backend.
 * All HTTP calls live here. Controllers (hooks) consume these functions.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

// ─── Helpers ───────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const jwt = localStorage.getItem("jwt");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as any)?.message?.[0]?.messages?.[0]?.message ||
      (body as any)?.error?.message ||
      `Request failed (${res.status})`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  blocked: boolean;
  confirmed: boolean;
  profile?: Profile | null;
}

export interface Profile {
  id: number;
  email: string;
  fullname: string;
  permission?: string;
  father?: Profile | number | null;
  enterprise?: Enterprise | null;
}

export interface Enterprise {
  id: number;
  name: string;
  logo?: { url: string } | null;
  projects?: Project[];
}

export interface Project {
  id: number;
  name: string;
  is_public?: boolean;
  enterprise?: Enterprise;
  topics?: Topic[];
}

export interface Topic {
  id: number;
  title: string;
  project?: Project;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  id: number;
  title: string;
  topic?: Topic;
  contents?: Content[];
}

export interface Content {
  id: number;
  title: string;
  body: string;
  subtopic?: Subtopic;
}

export const authApi = {
  register(username: string, email: string, password: string) {
    return request<AuthResponse>("/auth/local/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  login(identifier: string, password: string) {
    return request<AuthResponse>("/auth/local", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  },

  me() {
    return request<StrapiUser>("/users/me");
  },
};

// ─── Profile ───────────────────────────────────────────────

export const profileApi = {
  getAll() {
    return request<Profile[]>(`/profiles`);
  },

  getByUser(userId: number) {
    return request<Profile[]>(`/profiles/me`).then(res => [res as unknown as Profile]).catch(() => []);
  },

  create(data: { fullname: string; email: string; user: number; father?: number }) {
    return request<Profile>("/profile/me", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createDependent(data: { fullname: string; email: string; permission: string; password?: string }) {
    return request<Profile>("/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Profile>) {
    return request<Profile>(`/profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: number) {
    return request<Profile>(`/profiles/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Enterprise ────────────────────────────────────────────

export const enterpriseApi = {
  getByProfile(profileId: number) {
    return request<Enterprise[]>(`/enterprises?profile=${profileId}`);
  },

  getOne(id: number) {
    return request<Enterprise>(`/enterprises/${id}`);
  },

  create(data: { name: string; profile: number }) {
    return request<Enterprise>("/enterprises", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Enterprise>) {
    return request<Enterprise>(`/enterprises/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ─── Project ───────────────────────────────────────────────

export const projectApi = {
  getByEnterprise(enterpriseId: number) {
    return request<Project[]>(`/projects?enterprise=${enterpriseId}`);
  },

  getOne(id: number) {
    return request<Project>(`/projects/${id}`);
  },

  create(data: { name: string; enterprise: number }) {
    return request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Project>) {
    return request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return request<Project>(`/projects/${id}`, { method: "DELETE" });
  },
};

// ─── Topic ─────────────────────────────────────────────────

export const topicApi = {
  getByProject(projectId: number) {
    return request<Topic[]>(`/topics?project=${projectId}`);
  },

  create(data: { title: string; project: number }) {
    return request<Topic>("/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Topic>) {
    return request<Topic>(`/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return request<Topic>(`/topics/${id}`, { method: "DELETE" });
  },
};

// ─── Subtopic ──────────────────────────────────────────────

export const subtopicApi = {
  getByTopic(topicId: number) {
    return request<Subtopic[]>(`/subtopics?topic=${topicId}`);
  },

  create(data: { title: string; topic: number }) {
    return request<Subtopic>("/subtopics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Subtopic>) {
    return request<Subtopic>(`/subtopics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return request<Subtopic>(`/subtopics/${id}`, { method: "DELETE" });
  },
};

// ─── Content ───────────────────────────────────────────────

export const contentApi = {
  getBySubtopic(subtopicId: number) {
    return request<Content[]>(`/contents?subtopic=${subtopicId}`);
  },

  getOne(id: number) {
    return request<Content>(`/contents/${id}`);
  },

  create(data: { title: string; body: string; subtopic: number }) {
    return request<Content>("/contents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Content>) {
    return request<Content>(`/contents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return request<Content>(`/contents/${id}`, { method: "DELETE" });
  },
};

// ─── Upload ────────────────────────────────────────────────

export const uploadApi = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        // Note: Do NOT set Content-Type for FormData, browser does it with boundary
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Falha no upload");
    const data = await res.json();
    return data[0]; // Returns the first uploaded file object
  },
};
