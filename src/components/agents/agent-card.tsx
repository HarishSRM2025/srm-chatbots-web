"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Globe,
  Lock,
  Settings2,
  Trash2,
} from "lucide-react";
import type { Agent } from "@/lib/api";
import { useWorkspace } from "@/providers/workspace-provider";
export function AgentCard({ agent }: { agent: Agent }) {
  const { sources, setEditor, busy, remove } = useWorkspace();
  const count = sources.filter((s) => s.agent === agent.id).length;
  return (
    <article className="agent-card">
      <div className="card-top">
        <span className="agent-icon">
          <Bot size={25} />
        </span>
        <span className={`badge ${agent.status}`}>{agent.status}</span>
      </div>
      <h3>{agent.name}</h3>
      <p>
        {agent.description ||
          "A dedicated assistant, ready to help with your institution’s knowledge."}
      </p>
      <div className="agent-detail-row">
        <span>
          <BookOpen size={14} />
          {count} {count === 1 ? "source" : "sources"}
        </span>
        <span>
          {agent.is_public ? <Globe size={13} /> : <Lock size={13} />}{" "}
          {agent.is_public ? "Public" : "Private"}
        </span>
      </div>
      <div className="model-tag">
        <span /> {agent.model_name}
      </div>
      <footer>
        {agent.status === "active" ? (
          <Link className="open-chat" href={`/conversations?agent=${agent.id}`}>
            Open playground <ArrowUpRight size={15} />
          </Link>
        ) : (
          <span className="inactive-label">Agent is paused</span>
        )}
        <button
          aria-label={`Edit ${agent.name}`}
          title="Edit agent"
          disabled={busy}
          onClick={() => setEditor(agent)}
        >
          <Settings2 size={16} />
        </button>
        <button
          aria-label={`Delete ${agent.name}`}
          title="Delete agent"
          disabled={busy}
          onClick={() => void remove("agents", agent.id)}
        >
          <Trash2 size={16} />
        </button>
      </footer>
    </article>
  );
}
