"use client";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
export function Feedback() {
  const { error, setError, notice, setNotice } = useWorkspace();
  return (
    <>
      {error && (
        <div className="alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="alert success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
