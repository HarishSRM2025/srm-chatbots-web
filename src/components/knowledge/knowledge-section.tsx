"use client";
import { useState } from "react";
import { FileText, Globe, AlignLeft, Plus, Search } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { PageHeading } from "@/components/dashboard/page-heading";
import { KnowledgeTable } from "./knowledge-table";
const types = [
  {
    type: "file",
    title: "Upload a document",
    description: "PDF, TXT, DOCX, or Markdown",
    icon: FileText,
  },
  {
    type: "url",
    title: "Connect a website",
    description: "Bring in knowledge from a public URL",
    icon: Globe,
  },
  {
    type: "text",
    title: "Write your knowledge",
    description: "Add FAQs, instructions, and useful facts",
    icon: AlignLeft,
  },
];
export function KnowledgeSection() {
  const { sources, agents, setSourceEditor, busy } = useWorkspace();
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("");
  const filtered = sources.filter(
    (s) =>
      (!agent || s.agent === Number(agent)) &&
      (s.title + " " + s.agent_name)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading section="Knowledge" />
      <div className="knowledge-types">
        {types.map(({ type, title, description, icon: Icon }) => (
          <button
            key={type}
            className="knowledge-type"
            disabled={busy || !agents.length}
            onClick={() =>
              setSourceEditor({
                source_type: type,
                agent: Number(agent) || agents[0]?.id,
              })
            }
          >
            <span className="knowledge-type-icon">
              <Icon size={21} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
            <Plus size={16} />
          </button>
        ))}
      </div>
      <div className="section-title">
        <div>
          <h2>
            Knowledge library <span>{sources.length}</span>
          </h2>
          <p>Everything your assistants need to know.</p>
        </div>
      </div>
      <div className="knowledge-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search knowledge"
            placeholder="Search sources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter knowledge by agent"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
        >
          <option value="">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <span>
          {filtered.length} {filtered.length === 1 ? "source" : "sources"}
        </span>
      </div>
      <KnowledgeTable sources={filtered} hasFilters={!!search || !!agent} />
    </>
  );
}
