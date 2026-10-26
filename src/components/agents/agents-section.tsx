"use client";
import { useState } from "react";
import { Bot, Plus, Search } from "lucide-react";
import { blankAgent, useWorkspace } from "@/providers/workspace-provider";
import { PageHeading } from "@/components/dashboard/page-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "./agent-card";
export function AgentsSection() {
  const { agents, setEditor, busy } = useWorkspace();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = agents.filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      (a.name + " " + a.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading section="Agents" />
      <div className="collection-toolbar">
        <div className="filter-tabs" role="group" aria-label="Filter agents">
          {["all", "active", "inactive"].map((value) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all"
                ? "All agents"
                : value === "active"
                  ? "Active"
                  : "Inactive"}
              <span>
                {
                  agents.filter((a) => value === "all" || a.status === value)
                    .length
                }
              </span>
            </button>
          ))}
        </div>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search agents"
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="agent-grid">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        {!search && filter === "all" && (
          <button
            className="create-card"
            disabled={busy}
            onClick={() => setEditor({ ...blankAgent })}
          >
            <span>
              <Plus size={25} />
            </span>
            <strong>Your next assistant starts here</strong>
            <small>Create an agent with a purpose of its own</small>
            <span className="create-card-link">
              Create agent <Plus size={14} />
            </span>
          </button>
        )}
      </div>
      {!filtered.length && (search || filter !== "all") && (
        <EmptyState
          icon={Bot}
          title="No agents found"
          description="Try a different search or choose another status."
          action={
            <button
              className="secondary"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          }
        />
      )}
    </>
  );
}
