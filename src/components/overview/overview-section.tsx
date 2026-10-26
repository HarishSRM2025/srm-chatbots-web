"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "@/components/agents/agent-card";
import { WelcomeBanner } from "./welcome-banner";
import { RecentConversations } from "./recent-conversations";
import { SetupChecklist } from "./setup-checklist";
export function OverviewSection() {
  const { agents, sources, analytics } = useWorkspace();
  return (
    <>
      <PageHeading section="Overview" />
      <div className="stats">
        <StatCard
          label="Total agents"
          value={agents.length}
          description="In your workspace"
          icon={Bot}
        />
        <StatCard
          label="Active agents"
          value={agents.filter((a) => a.status === "active").length}
          description="Ready for conversations"
          icon={Sparkles}
          tone="green"
        />
        <StatCard
          label="Conversations"
          value={analytics?.summary.total_conversations}
          description="All-time conversations"
          icon={MessageSquare}
          tone="blue"
        />
        <StatCard
          label="Knowledge sources"
          value={sources.length}
          description="Your knowledge library"
          icon={BookOpen}
          tone="amber"
        />
      </div>
      <WelcomeBanner />
      <div className="section-title">
        <div>
          <h2>
            Your agents <span>{agents.length}</span>
          </h2>
          <p>Small assistants. A meaningful difference.</p>
        </div>
        <Link className="subtle-link" href="/agents">
          Manage agents <ArrowUpRight size={15} />
        </Link>
      </div>
      {agents.length ? (
        <div className="agent-grid overview-agents">
          {agents.slice(0, 3).map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            icon={Bot}
            title="Meet your future team"
            description="Create your first agent, add some knowledge, and start a conversation."
            action={
              <Link href="/agents" className="text-button">
                Explore agents <ArrowUpRight size={14} />
              </Link>
            }
          />
        </div>
      )}
      <div className="overview-bottom">
        <RecentConversations />
        <SetupChecklist />
      </div>
    </>
  );
}
