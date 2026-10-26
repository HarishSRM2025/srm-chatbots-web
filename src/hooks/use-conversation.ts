"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { api, type Conversation, type Message } from "@/lib/api";
import { useWorkspace } from "@/providers/workspace-provider";
export function useConversation() {
  const { action, reload, busy, setError } = useWorkspace();
  const params = useSearchParams();
  const [active, setActive] = useState<Conversation | null>(null);
  const [agentId, setAgentId] = useState(params.get("agent") || "");
  const [draft, setDraft] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const sendLock = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, busy, pendingMessage]);
  useEffect(() => {
    const id = params.get("conversation");
    let cancelled = false;
    if (id && /^\d+$/.test(id)) {
      setHistoryLoading(true);
      void api<Conversation>(`chat/conversations/${id}/`)
        .then((conversation) => {
          if (cancelled) return;
          setActive(conversation);
          setAgentId(String(conversation.agent));
        })
        .catch((error: Error) => {
          if (!cancelled) setError(error.message);
        })
        .finally(() => {
          if (!cancelled) setHistoryLoading(false);
        });
    } else {
      setHistoryLoading(false);
      setActive(null);
      setAgentId(params.get("agent") || "");
    }
    setDraft("");
    setCitations([]);
    return () => {
      cancelled = true;
    };
  }, [params]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || busy || historyLoading || sendLock.current) return;
    if (!active && !agentId) {
      setError("Choose an active agent first.");
      return;
    }
    const content = draft.trim();
    sendLock.current = true;
    await action(async () => {
      setDraft("");
      setCitations([]);
      setPendingMessage(content);
      let conversation = active;
      const previousIds = new Set(
        active?.messages.map((message) => message.id) || [],
      );
      try {
        if (!conversation) {
          conversation = await api<Conversation>("chat/conversations/", {
            method: "POST",
            body: JSON.stringify({
              agent: Number(agentId),
              title: content.slice(0, 200),
            }),
          });
          setActive(conversation);
        }
        const result = await api<{
          user_message: Message;
          assistant_message: Message;
          sources: { title: string }[];
        }>(`chat/conversations/${conversation.id}/send/`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
        setActive({
          ...conversation,
          messages: [
            ...conversation.messages,
            result.user_message,
            result.assistant_message,
          ],
        });
        setCitations([
          ...new Set(result.sources.map((source) => source.title)),
        ]);
        setPendingMessage(null);
      } catch (error) {
        // Inference can fail after Django has saved the user's message.
        // Reconcile that history instead of showing the same message twice.
        let persisted = false;
        if (conversation) {
          try {
            const history = await api<Conversation>(
              `chat/conversations/${conversation.id}/`,
            );
            setActive(history);
            persisted = history.messages.some(
              (message) =>
                !previousIds.has(message.id) &&
                message.role === "user" &&
                message.content === content,
            );
          } catch {
            /* Keep the original request error. */
          }
        }
        if (!persisted) setDraft((current) => current || content);
        throw error;
      } finally {
        setPendingMessage(null);
        sendLock.current = false;
      }
      await reload();
    });
    sendLock.current = false;
  }

  return {
    pendingMessage,
    active,
    setActive,
    agentId,
    setAgentId,
    draft,
    setDraft,
    citations,
    setCitations,
    end,
    send,
    busy: busy || historyLoading,
  };
}
