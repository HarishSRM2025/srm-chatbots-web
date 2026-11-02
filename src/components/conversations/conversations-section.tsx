"use client";
import { Bot, Plus, Send, Sparkles } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { useConversation } from "@/hooks/use-conversation";
import { formatDate as date } from "@/lib/format";
import { ProcessingIndicator } from "@/components/conversations/processing-indicator";
import { PageHeading } from "@/components/dashboard/page-heading";
import { MessageContent } from "./message-content";
export function ConversationsSection() {
  const { agents, conversations } = useWorkspace();
  const {
    pendingMessage,
    active,
    setActive,
    agentId,
    setAgentId,
    draft,
    setDraft,
    end,
    send,
    busy,
  } = useConversation();
  return (
    <>
      <PageHeading section="Conversations" />
      <div className="chat-layout panel">
        <aside className="conversation-list">
          <button
            className="secondary full"
            disabled={busy}
            onClick={() => {
              setActive(null);
              setDraft("");
            }}
          >
            <Plus size={16} />
            New conversation
          </button>
          {conversations.map((c) => (
            <button
              disabled={busy}
              key={c.id}
              className={active?.id === c.id ? "current" : ""}
              onClick={() => {
                setActive(c);
                setAgentId(String(c.agent));
              }}
            >
              <strong>{c.title || "Untitled conversation"}</strong>
              <small>
                {c.agent_name} · {date(c.updated_at)}
              </small>
            </button>
          ))}
          {!conversations.length && (
            <p className="muted">Your conversations will appear here.</p>
          )}
        </aside>
        <section className="chat">
          <header>
            <Bot size={20} />
            {active ? (
              <strong>{active.agent_name}</strong>
            ) : (
              <select
                aria-label="Choose agent"
                disabled={busy}
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                <option value="">Choose an active agent</option>
                {agents
                  .filter((a) => a.status === "active")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            )}
            <span className="badge">Playground</span>
          </header>
          <div className="messages" aria-live="polite">
            {!active?.messages.length && !pendingMessage && (
              <div className="empty">
                <span className="agent-icon">
                  <Sparkles size={28} />
                </span>
                <h3>Start a conversation</h3>
                <p>Ask a question to see your agent’s knowledge in action.</p>
              </div>
            )}
            {active?.messages.map((m) => (
              <div key={m.id} className={`message ${m.role}`}>
                <small>{m.role === "user" ? "You" : active.agent_name}</small>
                <MessageContent message={m} />
              </div>
            ))}
            {pendingMessage && (
              <>
                <div className="message user">
                  <small>You</small>
                  <div>{pendingMessage}</div>
                </div>
                <ProcessingIndicator />
              </>
            )}
            <div ref={end} />
          </div>
          <div className="suggested-questions" aria-label="Suggested questions">
            {(
              agents.find((a) => a.id === (active?.agent ?? Number(agentId)))
                ?.predefined_questions || []
            ).map((question, index) => (
              <button
                type="button"
                className="secondary"
                key={index}
                disabled={busy}
                onClick={(e) => void send(e, question)}
              >
                {question}
              </button>
            ))}
          </div>
          <form className="composer" onSubmit={send}>
            <textarea
              aria-label="Message"
              placeholder="Ask your assistant a question…"
              value={draft}
              maxLength={10000}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  if (!busy && (active || agentId)) void send(e);
                }
              }}
            />
            <button
              className="primary"
              aria-label="Send message"
              disabled={busy || !draft.trim() || (!active && !agentId)}
            >
              <Send size={18} />
            </button>
          </form>
          <small className="chat-note">
            AI can make mistakes. Verify important information. Shift + Enter
            for a new line.
          </small>
        </section>
      </div>
    </>
  );
}
