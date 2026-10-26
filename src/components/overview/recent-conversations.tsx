"use client";
import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
export function RecentConversations() {
  const { conversations } = useWorkspace();
  return (
    <section className="panel recent-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent conversations</h2>
          <p>Keep the conversation going.</p>
        </div>
        <Link href="/conversations" className="subtle-link">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      {conversations.length ? (
        <div className="recent-list">
          {conversations.slice(0, 4).map((c) => (
            <Link
              className="recent-item"
              key={c.id}
              href={`/conversations?conversation=${c.id}`}
            >
              <span className="recent-icon">
                <MessageSquare size={18} />
              </span>
              <div>
                <strong>{c.title || "Untitled conversation"}</strong>
                <small>{c.agent_name}</small>
              </div>
              <time dateTime={c.updated_at}>{formatDate(c.updated_at)}</time>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="Your next conversation is waiting"
          description="Open an agent’s playground to ask your first question."
          action={
            <Link href="/conversations" className="text-button">
              Open playground <ArrowUpRight size={14} />
            </Link>
          }
        />
      )}
    </section>
  );
}
