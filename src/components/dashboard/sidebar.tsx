"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { navigation } from "./navigation";
export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { agents, busy, loading, logout } = useWorkspace();
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <Link className="brand" href="/" onClick={onClose}>
          <span className="brand-icon">
            <Bot size={24} />
          </span>
          <span className="brand-name">
            SRM<span>CHATBOTS</span>
          </span>
        </Link>
        <button
          className="mobile-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <span className="workspace-avatar">S</span>
          <div>
            My workspace<small>Personal workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={pathname === href ? "selected" : ""}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Agents" && (
                <span className="nav-count">{agents.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip">
            <span className="tip-icon">
              <Sparkles size={19} />
            </span>
            <strong>
              Better knowledge.
              <br />
              Better conversations.
            </strong>
            <p>Give your agents a reliable foundation to build on.</p>
            <Link href="/knowledge" onClick={onClose}>
              Explore knowledge <ArrowUpRight size={15} />
            </Link>
          </div>
          <button
            className="signout"
            disabled={busy || loading}
            onClick={() => void logout()}
          >
            <LogOut size={17} />
            Sign out
          </button>
          <div className="sidebar-caption">
            SRM AI WORKSPACE <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
