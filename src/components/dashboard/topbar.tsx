"use client";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, LogOut } from "lucide-react";
import { navigation } from "./navigation";
import { useWorkspace } from "@/providers/workspace-provider";
export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const current = navigation.find((item) => item.href === pathname);
  const { busy, loading, logout } = useWorkspace();
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="mobile-menu"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <Menu size={21} />
        </button>
        <span>Workspace</span>
        <ChevronRight size={14} />
        <strong>{current?.name || "Overview"}</strong>
      </div>
      <div className="topbar-right">
        <span className="workspace-status">
          <span />
          Personal workspace
        </span>
        <span className="topbar-divider" />
        <span className="account-avatar">S</span>
        <button
          className="topbar-signout"
          aria-label="Sign out"
          title="Sign out"
          disabled={busy || loading}
          onClick={() => void logout()}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
