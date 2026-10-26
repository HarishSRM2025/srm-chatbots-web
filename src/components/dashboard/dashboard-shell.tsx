"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { AgentDialog } from "@/components/agents/agent-dialog";
import { KnowledgeDialog } from "@/components/knowledge/knowledge-dialog";
import { Feedback } from "@/components/ui/feedback";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
export function DashboardShell({ children }: { children: ReactNode }) {
  const { session, editor, sourceEditor } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (session === "out")
      router.replace(
        `/login?next=${encodeURIComponent(pathname + window.location.search)}`,
      );
  }, [session, pathname, router]);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menuOpen]);
  if (session !== "in")
    return (
      <div className="loading-screen" role="status">
        <span className="brand-icon">
          <Bot />
        </span>
        <p>
          {session === "out"
            ? "Taking you to sign in…"
            : "Preparing your workspace…"}
        </p>
      </div>
    );
  return (
    <div className="workspace">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="content" id="main-content" tabIndex={-1}>
          {!editor && !sourceEditor && <Feedback />}
          {children}
          <footer className="page-footer">
            <span>
              SRM Chatbots <span className="footer-dot">·</span> Your knowledge,
              connected.
            </span>
            <span>Built for better conversations</span>
          </footer>
        </main>
      </div>
      <AgentDialog />
      <KnowledgeDialog />
    </div>
  );
}
