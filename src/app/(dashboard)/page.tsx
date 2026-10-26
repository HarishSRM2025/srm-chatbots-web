import type { Metadata } from "next";
import { OverviewSection } from "@/components/overview/overview-section";
export const metadata: Metadata = { title: "Overview | SRM Chatbots" };
export default function OverviewPage() {
  return <OverviewSection />;
}
