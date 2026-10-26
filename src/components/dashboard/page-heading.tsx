"use client";
import { Plus, RefreshCw } from "lucide-react";
import { blankAgent, useWorkspace } from "@/providers/workspace-provider";
import { navigation, type SectionName } from "./navigation";
export function PageHeading({ section }: { section: SectionName }) {
  const { busy, loading, reload, setEditor, setSourceEditor, agents } =
    useWorkspace();
  const item = navigation.find((n) => n.name === section)!;
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          {section === "Overview"
            ? "WORKSPACE AT A GLANCE"
            : "YOUR AI WORKSPACE"}
        </div>
        <h1>{section === "Overview" ? "Workspace overview" : section}</h1>
        <p className="muted">{item.description}</p>
      </div>
      <div className="heading-actions">
        <button
          className="secondary refresh-button"
          aria-label="Refresh workspace"
          disabled={loading || busy}
          onClick={() => void reload()}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
        {(section === "Overview" || section === "Agents") && (
          <button
            className="primary"
            disabled={busy}
            onClick={() => setEditor({ ...blankAgent })}
          >
            <Plus size={17} />
            Create agent
          </button>
        )}
        {section === "Knowledge" && (
          <button
            className="primary"
            disabled={busy || !agents.length}
            onClick={() =>
              setSourceEditor({ source_type: "text", agent: agents[0]?.id })
            }
          >
            <Plus size={17} />
            Add knowledge
          </button>
        )}
      </div>
    </div>
  );
}
