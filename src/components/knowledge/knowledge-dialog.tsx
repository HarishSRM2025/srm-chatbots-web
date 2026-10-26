"use client";
import { ArrowRight, X } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { Feedback } from "@/components/ui/feedback";
import { useModalFocus } from "@/hooks/use-modal-focus";
export function KnowledgeDialog() {
  const { sourceEditor, setSourceEditor, agents, busy, saveSource } =
    useWorkspace();
  useModalFocus(!!sourceEditor, busy, () => setSourceEditor(null));
  if (!sourceEditor) return null;
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-title"
      >
        <div className="modal-heading">
          <h2 id="source-title">
            {sourceEditor.id ? "Edit knowledge" : "Add knowledge"}
          </h2>
          <button
            disabled={busy}
            aria-label="Close"
            onClick={() => setSourceEditor(null)}
          >
            <X />
          </button>
        </div>
        <Feedback />
        <form onSubmit={saveSource}>
          <label>
            Title
            <input
              name="title"
              required
              defaultValue={sourceEditor.title}
              maxLength={200}
              autoFocus
            />
          </label>
          <label>
            Agent
            <select name="agent" required defaultValue={sourceEditor.agent}>
              {agents.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Source type
            <select
              name="source_type"
              value={sourceEditor.source_type}
              onChange={(e) =>
                setSourceEditor({
                  ...sourceEditor,
                  source_type: e.target.value,
                })
              }
            >
              <option value="text">Text</option>
              <option value="url">Website URL</option>
              <option value="file">File upload</option>
            </select>
          </label>
          {sourceEditor.source_type === "text" && (
            <label>
              Knowledge text
              <textarea
                name="text_content"
                rows={8}
                required
                defaultValue={sourceEditor.text_content}
              />
            </label>
          )}
          {sourceEditor.source_type === "url" && (
            <label>
              Public website URL
              <input
                name="source_url"
                type="url"
                required
                defaultValue={sourceEditor.source_url}
                placeholder="https://example.edu/admissions"
              />
            </label>
          )}
          {sourceEditor.source_type === "file" && (
            <label>
              Document · maximum 10 MB
              <input
                name="file"
                type="file"
                accept=".pdf,.txt,.docx,.md"
                required={!sourceEditor.id}
              />
              <small>
                PDF, TXT, DOCX, or Markdown. Leave blank to keep an existing
                file.
              </small>
            </label>
          )}
          <button className="primary full" disabled={busy}>
            {busy ? "Processing…" : "Save and process"}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
