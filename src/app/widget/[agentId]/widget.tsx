"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, BookOpen } from "lucide-react";
import { api, type Message } from "@/lib/api";
type Session = {
  session_token: string;
  expires_at: string;
  conversation: number;
};
export default function Widget({ agentId }: { agentId: string }) {
  const [session, setSession] = useState<Session | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sources, setSources] = useState<string[]>([]);
  const retry = useRef<{ content: string; key: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const storageKey = `srm-widget-${agentId}`;
  useEffect(() => {
    let saved: Session | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
    } catch {}
    if (saved && new Date(saved.expires_at) > new Date()) {
      setSession(saved);
      api<{ messages: Message[] }>(
        `chat/widget/conversations/${saved.conversation}/?agent_id=${agentId}`,
        { headers: { "X-Widget-Session": saved.session_token } },
      )
        .then((d) => setMessages(d.messages))
        .catch((e) => {
          setError(e.message);
          setSession(null);
          sessionStorage.removeItem(storageKey);
        });
    }
  }, [agentId, storageKey]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);
  async function start() {
    setBusy(true);
    setError("");
    try {
      const s = await api<{ session_token: string; expires_at: string }>(
        "chat/widget/sessions/",
        { method: "POST", body: JSON.stringify({ agent_id: agentId }) },
      );
      const c = await api<{ id: number }>("chat/widget/conversations/", {
        method: "POST",
        headers: { "X-Widget-Session": s.session_token },
        body: JSON.stringify({ agent_id: agentId }),
      });
      const next = { ...s, conversation: c.id };
      setSession(next);
      setMessages([]);
      retry.current = null;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!session || !draft.trim() || busy) return;
    setBusy(true);
    setError("");
    const content = draft.trim();
    if (retry.current?.content !== content)
      retry.current = { content, key: crypto.randomUUID() };
    try {
      const data = await api<{
        user_message: Message;
        assistant_message: Message;
        sources: { title: string }[];
      }>(`chat/widget/conversations/${session.conversation}/messages/`, {
        method: "POST",
        headers: {
          "X-Widget-Session": session.session_token,
          "Idempotency-Key": retry.current.key,
        },
        body: JSON.stringify({ agent_id: agentId, content }),
      });
      setMessages((old) => [
        ...old.filter(
          (m) =>
            m.id !== data.user_message.id && m.id !== data.assistant_message.id,
        ),
        data.user_message,
        data.assistant_message,
      ]);
      setSources([...new Set(data.sources.map((s) => s.title))]);
      setDraft("");
      retry.current = null;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="widget-shell">
      <section className="chat">
        <header>
          <span className="brand-icon">
            <Bot size={19} />
          </span>
          <strong>SRM Assistant</strong>
          {session && (
            <button
              className="widget-actions"
              disabled={busy}
              onClick={() => {
                setSession(null);
                setMessages([]);
                setDraft("");
                setSources([]);
                setError("");
                retry.current = null;
                sessionStorage.removeItem(storageKey);
              }}
            >
              New chat
            </button>
          )}
        </header>
        {error && (
          <div role="alert" className="alert error">
            {error}
          </div>
        )}
        <div className="messages" aria-live="polite">
          {!messages.length && (
            <div className="empty widget-welcome">
              <span className="agent-icon">
                <Bot size={28} />
              </span>
              <h3>Hello! How can I help?</h3>
              <p>Ask a question and I’ll help you find an answer.</p>
              {!session && (
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void start()}
                >
                  {busy ? "Connecting…" : "Start a conversation"}
                </button>
              )}
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`message ${m.role}`}>
              <small>{m.role === "user" ? "You" : "Assistant"}</small>
              <div>{m.content}</div>
            </div>
          ))}
          {busy && <p className="muted">Please wait…</p>}
          {!!sources.length && (
            <div className="citations">
              <BookOpen size={14} />
              {sources.join(", ")}
            </div>
          )}
          <div ref={end} />
        </div>
        {session && (
          <form className="composer" onSubmit={send}>
            <textarea
              aria-label="Message"
              maxLength={10000}
              placeholder="Type your question…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  void send(e);
                }
              }}
            />
            <button
              className="primary"
              aria-label="Send message"
              disabled={busy || !draft.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        )}
        <small className="chat-note">
          Powered by SRM Chatbots · Verify important information.
        </small>
      </section>
    </main>
  );
}
