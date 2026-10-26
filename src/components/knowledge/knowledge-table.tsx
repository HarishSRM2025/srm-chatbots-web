"use client";
import {
  FileText,
  Globe,
  AlignLeft,
  RefreshCw,
  Settings2,
  Trash2,
  BookOpen,
} from "lucide-react";
import type { Source } from "@/lib/api";
import { api } from "@/lib/api";
import { useWorkspace } from "@/providers/workspace-provider";
import { EmptyState } from "@/components/ui/empty-state";
export function KnowledgeTable({
  sources,
  hasFilters,
}: {
  sources: Source[];
  hasFilters: boolean;
}) {
  const { agents, setSourceEditor, busy, action, setNotice, reload, remove } =
    useWorkspace();
  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Source name</th>
            <th>Agent</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => {
            const Icon =
              source.source_type === "url"
                ? Globe
                : source.source_type === "file"
                  ? FileText
                  : AlignLeft;
            return (
              <tr key={source.id}>
                <td>
                  <span className="table-agent">
                    <span className="table-agent-icon">
                      <Icon size={16} />
                    </span>
                    <strong>{source.title}</strong>
                  </span>
                  {source.error_message && (
                    <small className="error-text">{source.error_message}</small>
                  )}
                </td>
                <td>{source.agent_name}</td>
                <td>
                  {source.source_type === "url"
                    ? "Website"
                    : source.source_type === "file"
                      ? "Document"
                      : "Text"}
                </td>
                <td>
                  <span className={`badge ${source.status}`}>
                    {source.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      disabled={busy}
                      aria-label={`Edit ${source.title}`}
                      title="Edit source"
                      onClick={() => setSourceEditor(source)}
                    >
                      <Settings2 size={16} />
                    </button>
                    <button
                      disabled={busy}
                      aria-label={`Reprocess ${source.title}`}
                      title="Reprocess source"
                      onClick={() =>
                        void action(async () => {
                          try {
                            await api(`knowledge/${source.id}/process/`, {
                              method: "POST",
                            });
                            setNotice("Source reprocessed.");
                          } finally {
                            await reload();
                          }
                        })
                      }
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      disabled={busy}
                      aria-label={`Delete ${source.title}`}
                      title="Delete source"
                      onClick={() => void remove("knowledge", source.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!sources.length && (
        <EmptyState
          icon={BookOpen}
          title={
            hasFilters ? "No matching sources" : "A home for your knowledge"
          }
          description={
            hasFilters
              ? "Try a different search or choose another agent."
              : agents.length
                ? "Add a document, a website, or written knowledge to help your assistants answer confidently."
                : "Create an agent first, then add its knowledge sources."
          }
        />
      )}
    </div>
  );
}
