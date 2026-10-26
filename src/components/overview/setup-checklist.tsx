"use client";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Bot, Check, Code2 } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
export function SetupChecklist() {
  const { agents, sources } = useWorkspace();
  const steps = [
    {
      label: "Create your first agent",
      description: "Give your assistant a purpose",
      href: "/agents",
      icon: Bot,
      done: agents.length > 0,
    },
    {
      label: "Add trusted knowledge",
      description: "Turn information into answers",
      href: "/knowledge",
      icon: BookOpen,
      done: sources.some((s) => s.status === "ready"),
    },
    {
      label: "Make it available",
      description: "Enable a public assistant",
      href: "/integrations",
      icon: Code2,
      done: agents.some((a) => a.is_public && a.status === "active"),
    },
  ];
  const done = steps.filter((s) => s.done).length;
  return (
    <section className="panel setup-panel">
      <div className="panel-heading">
        <div>
          <h2>Your launch checklist</h2>
          <p>A few steps to something helpful.</p>
        </div>
        <span className="setup-count">{done}/3</span>
      </div>
      <div
        className="setup-progress"
        role="progressbar"
        aria-label="Workspace setup"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={3}
      >
        <span style={{ width: `${(done / 3) * 100}%` }} />
      </div>
      <div className="setup-steps">
        {steps.map(({ label, description, href, icon: Icon, done }) => (
          <Link href={href} key={href} className="setup-step">
            <span className={`step-icon ${done ? "done" : ""}`}>
              {done ? <Check size={17} /> : <Icon size={17} />}
            </span>
            <div>
              <strong>{label}</strong>
              <small>{description}</small>
            </div>
            <ArrowUpRight size={14} />
          </Link>
        ))}
      </div>
    </section>
  );
}
