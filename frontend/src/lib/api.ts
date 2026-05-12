const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string | null;
  messages: Message[];
}

export interface ModelInfo {
  name: string;
  label: string;
  size: string;
  description: string;
  available: boolean;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  message_id: number;
}

export const api = {
  auth: {
    register: (email: string, password: string, full_name: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },
  chat: {
    send: (message: string, model: string, conversation_id?: number) =>
      request<ChatResponse>("/chat/send", {
        method: "POST",
        body: JSON.stringify({ message, model, conversation_id }),
      }),
    getConversations: () => request<Conversation[]>("/chat/conversations"),
    getConversation: (id: number) =>
      request<Conversation>(`/chat/conversations/${id}`),
    deleteConversation: (id: number) =>
      request<{ message: string }>(`/chat/conversations/${id}`, {
        method: "DELETE",
      }),
    getModels: () =>
      request<{ models: ModelInfo[] }>("/chat/models"),
  },
};
