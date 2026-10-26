import type { Metadata } from "next";
import { AnalyticsSection } from "@/components/analytics/analytics-section";
export const metadata: Metadata = { title: "Analytics | SRM Chatbots" };
export default function AnalyticsPage() {
  return <AnalyticsSection />;
}
