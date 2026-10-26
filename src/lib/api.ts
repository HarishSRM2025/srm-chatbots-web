export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
function describe(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(describe).join(" ");
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(
        ([k, v]) =>
          `${k === "detail" ? "" : k.replaceAll("_", " ") + ": "}${describe(v)}`,
      )
      .join(" ");
  return String(value);
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/backend/${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const data =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => ({ detail: "Unexpected server response." }));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("auth/"))
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(describe(data), response.status);
  }
  return data as T;
}
export async function list<T>(path: string): Promise<T[]> {
  const data = await api<T[] | { results: T[]; next: string | null }>(path);
  if (Array.isArray(data)) return data;
  let results = data.results,
    next = data.next;
  while (next) {
    const url = new URL(next, window.location.origin);
    const page = await api<{ results: T[]; next: string | null }>(
      url.pathname.replace(/^\/api\//, "") + url.search,
    );
    results = results.concat(page.results);
    next = page.next;
  }
  return results;
}
export type Agent = {
  id: number;
  name: string;
  description: string;
  system_prompt: string;
  model_name: string;
  status: string;
  is_public: boolean;
  created_at: string;
};
export type Source = {
  id: number;
  agent: number;
  agent_name: string;
  title: string;
  source_type: string;
  source_url: string;
  text_content: string;
  status: string;
  error_message: string;
};
export type Message = {
  id: number;
  role: string;
  content: string;
  created_at: string;
};
export type Conversation = {
  id: number;
  agent: number;
  agent_name: string;
  title: string;
  messages: Message[];
  updated_at: string;
};
export type Analytics = {
  summary: Record<string, number>;
  daily_activity: { date: string; conversations: number }[];
  agent_usage: {
    id: number;
    name: string;
    status: string;
    conversation_count: number;
    message_count: number;
  }[];
};
