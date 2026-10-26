import type { Metadata } from "next";
import { KnowledgeSection } from "@/components/knowledge/knowledge-section";
export const metadata: Metadata = { title: "Knowledge | SRM Chatbots" };
export default function KnowledgePage() {
  return <KnowledgeSection />;
}
