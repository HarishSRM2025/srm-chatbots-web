"use client";
import {
  Activity,
  Bot,
  MessageSquare,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityChart } from "./activity-chart";
import { AgentUsageTable } from "./agent-usage-table";
export function AnalyticsSection() {
  const { analytics, loading } = useWorkspace();
  return (
    <>
      <PageHeading section="Analytics" />
      {analytics ? (
        <>
          <div className="stats">
            <StatCard
              label="Conversations"
              value={analytics.summary.total_conversations}
              description="All time"
              icon={MessageSquare}
            />
            <StatCard
              label="Total messages"
              value={analytics.summary.total_messages}
              description="Across all your agents"
              icon={MessagesSquare}
              tone="blue"
            />
            <StatCard
              label="User messages"
              value={analytics.summary.user_messages}
              description="Questions and requests"
              icon={UserRound}
              tone="amber"
            />
            <StatCard
              label="Assistant replies"
              value={analytics.summary.assistant_messages}
              description="Answers delivered"
              icon={Bot}
              tone="green"
            />
          </div>
          <ActivityChart activity={analytics.daily_activity} />
          <AgentUsageTable agents={analytics.agent_usage} />
          <p className="analytics-note">
            Analytics cover workspace conversations. Public widget activity is
            not included.
          </p>
        </>
      ) : (
        <EmptyState
          icon={Activity}
          title={loading ? "Loading analytics…" : "Analytics are unavailable"}
          description={
            loading
              ? "Gathering your workspace activity."
              : "Use Refresh to try loading your activity again."
          }
        />
      )}
    </>
  );
}
