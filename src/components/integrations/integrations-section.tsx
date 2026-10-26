"use client";
import { useState, useEffect } from "react";
import { Code2, Copy, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { PageHeading } from "@/components/dashboard/page-heading";
export function IntegrationsSection() {
  const { agents, action, setNotice } = useWorkspace();
  const [embedAgent, setEmbedAgent] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const snippet = `<iframe src="${origin}/widget/${embedAgent || "AGENT_ID"}" title="SRM AI assistant" width="380" height="600" style="border:0;border-radius:16px" loading="lazy"></iframe>`;
  return (
    <>
      <PageHeading section="Integrations" />
      <div className="integration-grid">
        <section className="panel integration">
          <span className="agent-icon">
            <Code2 />
          </span>
          <h2>Your assistant, on your website</h2>
          <p className="muted">
            Select a public, active agent and copy its embed code.
          </p>
          <label>
            Public agent
            <select
              value={embedAgent}
              onChange={(e) => setEmbedAgent(e.target.value)}
            >
              <option value="">Select an agent</option>
              {agents
                .filter((a) => a.is_public && a.status === "active")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </label>
          <pre>{snippet}</pre>
          <button
            className="primary"
            disabled={!embedAgent}
            onClick={() =>
              void action(async () => {
                await navigator.clipboard.writeText(snippet);
                setNotice("Embed code copied.");
              })
            }
          >
            <Copy size={16} />
            Copy embed code
          </button>
          {embedAgent && (
            <a
              className="text-button"
              href={`/widget/${embedAgent}`}
              target="_blank"
              rel="noreferrer"
            >
              Open widget <ArrowRight size={15} />
            </a>
          )}
        </section>
        <section className="panel integration">
          <h3>Before you embed</h3>
          <ol className="steps">
            <li>
              Set your agent to <strong>Active</strong> and enable public access
              in its settings.
            </li>
            <li>
              In Django admin, add <strong>{origin}</strong> to the agent’s{" "}
              <code>allowed_origins</code>. The current API does not expose this
              field.
            </li>
            <li>
              Use a publicly reachable HTTPS frontend URL when embedding on a
              live website.
            </li>
            <li>Paste the iframe code into your website.</li>
          </ol>
          <p className="muted">
            Visitors receive their own temporary chat session. They don’t need a
            workspace account.
          </p>
        </section>
      </div>
    </>
  );
}
