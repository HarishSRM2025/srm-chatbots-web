"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send } from "lucide-react";
import { api, type Message } from "@/lib/api";
import { MessageContent } from "@/components/conversations/message-content";
import { SuggestedQuestions } from "@/components/conversations/suggested-questions";

type Session = {
  predefined_questions?: string[];
  session_token: string;
  expires_at: string;
  conversation: number;
};
export default function Widget({ agentId }: { agentId: string }) {
  const [session, setSession] = useState<Session | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const retry = useRef<{ content: string; key: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setSession(null);
    setMessages([]);
    setDraft("");
    setError("");
    setBusy(true);
    retry.current = null;
    // Clear sessions stored by older widget versions; new chats live in memory only.
    try { sessionStorage.removeItem(`srm-widget-${agentId}`); } catch {}
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const session = await api<Omit<Session, "conversation">>("chat/widget/sessions/", {
            method: "POST",
            body: JSON.stringify({ agent_id: agentId }),
          });
          if (cancelled) return;
          const conversation = await api<{ id: number }>("chat/widget/conversations/", {
            method: "POST",
            headers: { "X-Widget-Session": session.session_token },
            body: JSON.stringify({ agent_id: agentId }),
          });
          if (!cancelled) setSession({ ...session, conversation: conversation.id });
        } catch (error) {
          if (!cancelled) setError((error as Error).message);
        } finally {
          if (!cancelled) setBusy(false);
        }
      })();
    }, 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [agentId, connectionAttempt]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);
  async function send(e: FormEvent, question?: string) {
    e.preventDefault();
    if (!session || !(question ?? draft).trim() || busy) return;
    setBusy(true);
    setError("");
    const content = (question ?? draft).trim();
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
        </header>
        {error && (
          <div role="alert" className="alert error">
            {error}
            {!session && !busy && <button type="button" className="secondary" onClick={() => setConnectionAttempt(attempt => attempt + 1)}>Retry connection</button>}
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

            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`message ${m.role}`}>
              <small>{m.role === "user" ? "You" : "Assistant"}</small>
              <MessageContent message={m} />
            </div>
          ))}
          {busy && <p className="muted">Please wait…</p>}
          <div ref={end} />
        </div>
        {session && (
          <SuggestedQuestions expanded={suggestionsExpanded} onToggle={() => setSuggestionsExpanded(value => !value)} questions={session.predefined_questions || []} busy={busy}
            onSelect={(event, question) => void send(event, question)} />
        )}
        {session && (
          <form className="composer" onSubmit={send}>
            <textarea
              aria-label="Message"
              maxLength={10000}
              placeholder="Type your question…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (e.target.value.trim()) setSuggestionsExpanded(false);
              }}
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
