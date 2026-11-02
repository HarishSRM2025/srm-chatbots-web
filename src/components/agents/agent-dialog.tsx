"use client";
import { Check, X } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { Feedback } from "@/components/ui/feedback";
import { useModalFocus } from "@/hooks/use-modal-focus";
export function AgentDialog() {
  const { editor, setEditor, busy, saveAgent } = useWorkspace();
  useModalFocus(!!editor, busy, () => setEditor(null));
  if (!editor) return null;
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-title"
      >
        <div className="modal-heading">
          <h2 id="agent-title">
            {editor.id ? "Edit agent" : "Create an agent"}
          </h2>
          <button
            aria-label="Close"
            disabled={busy}
            onClick={() => setEditor(null)}
          >
            <X />
          </button>
        </div>
        <p className="muted">
          Give your assistant a clear purpose and personality.
        </p>
        <Feedback />
        <form onSubmit={saveAgent}>
          <label>
            Agent name
            <input
              autoFocus
              required
              maxLength={150}
              value={editor.name || ""}
              onChange={(e) => setEditor({ ...editor, name: e.target.value })}
              placeholder="e.g. Admissions assistant"
            />
          </label>
          <label>
            Description
            <textarea
              value={editor.description || ""}
              onChange={(e) =>
                setEditor({ ...editor, description: e.target.value })
              }
              placeholder="What will this assistant help with?"
            />
          </label>
          <label>
            System prompt
            <textarea
              required
              rows={4}
              value={editor.system_prompt || ""}
              onChange={(e) =>
                setEditor({ ...editor, system_prompt: e.target.value })
              }
            />
          </label>
          <label>
            Predefined questions (one per line, up to 20)
            <textarea
              rows={4}
              value={(editor.predefined_questions || []).join("\n")}
              onChange={(e) =>
                setEditor({
                  ...editor,
                  predefined_questions: e.target.value.split("\n"),
                })
              }
              placeholder="How do I apply?"
            />
          </label>
          <label>
            Status
            <select
              value={editor.status}
              onChange={(e) => setEditor({ ...editor, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            Allowed widget origins (one per line)
            <textarea
              rows={3}
              value={(editor.allowed_origins || []).join("\n")}
              onChange={(e) => setEditor({ ...editor, allowed_origins: e.target.value.split("\n") })}
              placeholder="Enter a website origin, including https://"
            />
            <small>Enter the origin of the widget URL, including its port for localhost. For an iframe, use its src origin, not the parent website. Each agent has its own list.</small>
          </label>
          <button type="button" className="secondary" onClick={() => setEditor({ ...editor, allowed_origins: [...new Set([...(editor.allowed_origins || []).filter(Boolean), window.location.origin])] })}>
            Add this website
          </button>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!!editor.is_public}
              onChange={(e) =>
                setEditor({ ...editor, is_public: e.target.checked })
              }
            />
            Allow public widget access
          </label>
          <button className="primary full" disabled={busy}>
            {busy ? "Saving…" : "Save agent"}
            <Check size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}
