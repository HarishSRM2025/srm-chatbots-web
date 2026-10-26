"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  api,
  list,
  ApiError,
  type Agent,
  type Source,
  type Conversation,
  type Analytics,
} from "@/lib/api";
export const blankAgent = {
  name: "",
  description: "",
  system_prompt:
    "You are a helpful institutional assistant. Answer clearly using the provided knowledge.",
  status: "active",
  is_public: false,
};
function useWorkspaceState() {
  const [session, setSession] = useState<"loading" | "in" | "out">("loading");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState<Partial<Agent> | null>(null);
  const [sourceEditor, setSourceEditor] = useState<Partial<Source> | null>(
    null,
  );
  const generation = useRef(0);
  const pendingAction = useRef(false);
  function clear() {
    generation.current++;
    setSession("out");
    setAgents([]);
    setSources([]);
    setConversations([]);
    setAnalytics(null);
    setEditor(null);
    setSourceEditor(null);
    setError("");
    setNotice("");
  }
  async function reload() {
    const version = ++generation.current;
    setLoading(true);
    try {
      const a = await list<Agent>("agents/");
      if (version !== generation.current) return;
      setAgents(a);
      setSession("in");
      const [k, c, s] = await Promise.all([
        list<Source>("knowledge/"),
        list<Conversation>("chat/conversations/"),
        api<Analytics>("analytics/overview/"),
      ]);
      if (version !== generation.current) return;
      setSources(k);
      setConversations(c);
      setAnalytics(s);
    } catch (e) {
      if (version !== generation.current) return;
      if (e instanceof ApiError && e.status === 401) clear();
      else {
        setError((e as Error).message);
        setSession((v) => (v === "loading" ? "in" : v));
      }
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
    const expired = () => clear();
    window.addEventListener("session-expired", expired);
    return () => {
      generation.current++;
      window.removeEventListener("session-expired", expired);
    };
  }, []);
  async function action(work: () => Promise<void>) {
    if (pendingAction.current) return;
    pendingAction.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      pendingAction.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    await action(async () => {
      await api("auth/logout/", { method: "POST" });
      clear();
    });
  }
  async function saveAgent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await action(async () => {
      await api(`agents/${editor?.id ? editor.id + "/" : ""}`, {
        method: editor?.id ? "PATCH" : "POST",
        body: JSON.stringify({
          name: editor?.name,
          description: editor?.description,
          system_prompt: editor?.system_prompt,
          status: editor?.status,
          is_public: editor?.is_public,
        }),
      });
      setEditor(null);
      setNotice("Agent saved.");
      await reload();
    });
  }
  async function saveSource(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (file instanceof File && !file.name) form.delete("file");
    if (file instanceof File && file.size > 10 * 1024 * 1024) {
      setError("Files must be 10 MB or smaller.");
      return;
    }
    await action(async () => {
      try {
        await api(
          `knowledge/${sourceEditor?.id ? sourceEditor.id + "/" : ""}`,
          { method: sourceEditor?.id ? "PATCH" : "POST", body: form },
        );
        setSourceEditor(null);
        setNotice("Knowledge saved and processed.");
      } finally {
        await reload();
      }
    });
  }
  async function remove(kind: "agents" | "knowledge", id: number) {
    if (
      !window.confirm(
        kind === "agents"
          ? "Delete this agent and all its knowledge and conversations?"
          : "Delete this knowledge source?",
      )
    )
      return;
    await action(async () => {
      await api(`${kind}/${id}/`, { method: "DELETE" });

      await reload();
    });
  }
  return {
    session,
    agents,
    sources,
    conversations,
    analytics,
    error,
    setError,
    notice,
    setNotice,
    busy,
    loading,
    editor,
    setEditor,
    sourceEditor,
    setSourceEditor,
    reload,
    action,
    logout,
    saveAgent,
    saveSource,
    remove,
  };
}
const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState();
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace requires WorkspaceProvider");
  return context;
}
