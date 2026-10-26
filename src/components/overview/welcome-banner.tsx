"use client";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { blankAgent, useWorkspace } from "@/providers/workspace-provider";
export function WelcomeBanner() {
  const { setEditor, busy } = useWorkspace();
  return (
    <section className="welcome-banner">
      <div className="welcome-copy">
        <span className="welcome-kicker">
          <Sparkles size={13} /> KNOWLEDGE, MEET POSSIBILITY
        </span>
        <h2>
          Great conversations
          <br />
          start with your knowledge.
        </h2>
        <p>
          Create an assistant that understands your institution.
          <br />
          Give every question a better place to land.
        </p>
        <button
          className="banner-button"
          disabled={busy}
          onClick={() => setEditor({ ...blankAgent })}
        >
          Build your next assistant <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="assistant-illustration" aria-hidden="true">
        <div className="illustration-ring ring-outer" />
        <div className="illustration-ring ring-inner" />
        <div className="illustration-core">
          <Bot size={57} strokeWidth={1.4} />
        </div>
        <div className="illustration-node node-doc">
          <BookOpen size={22} />
        </div>
        <div className="illustration-node node-chat">
          <MessageSquare size={22} />
        </div>
        <div className="illustration-label">
          <span /> Ready to connect
        </div>
        <Sparkles className="illustration-spark" size={23} />
      </div>
    </section>
  );
}
