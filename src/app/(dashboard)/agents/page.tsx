import type { Metadata } from "next";
import { AgentsSection } from "@/components/agents/agents-section";
export const metadata: Metadata = { title: "Agents | SRM Chatbots" };
export default function AgentsPage() {
  return <AgentsSection />;
}
