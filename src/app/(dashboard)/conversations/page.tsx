import type { Metadata } from "next";
import { Suspense } from "react";
import { ConversationsSection } from "@/components/conversations/conversations-section";
export const metadata: Metadata = { title: "Conversations | SRM Chatbots" };
export default function ConversationsPage() {
  return (
    <Suspense fallback={<p className="muted">Loading conversations…</p>}>
      <ConversationsSection />
    </Suspense>
  );
}
