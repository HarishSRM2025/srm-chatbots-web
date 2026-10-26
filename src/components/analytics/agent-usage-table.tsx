import { Bot } from "lucide-react";
import type { Analytics } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";
export function AgentUsageTable({
  agents,
}: {
  agents: Analytics["agent_usage"];
}) {
  return (
    <section className="panel table-wrap">
      <div className="panel-heading">
        <div>
          <h2>Agent performance</h2>
          <p>A closer look at the assistants doing the work.</p>
        </div>
        <span className="chart-period">All time</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Status</th>
            <th>Conversations</th>
            <th>Messages</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="table-agent">
                  <span className="table-agent-icon">
                    <Bot size={17} />
                  </span>
                  {a.name}
                </span>
              </td>
              <td>
                <span className={`badge ${a.status}`}>{a.status}</span>
              </td>
              <td>{formatNumber(a.conversation_count)}</td>
              <td>{formatNumber(a.message_count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!agents.length && (
        <EmptyState
          icon={Bot}
          title="Your agents will appear here"
          description="Create an agent to start measuring conversations and messages."
        />
      )}
    </section>
  );
}
