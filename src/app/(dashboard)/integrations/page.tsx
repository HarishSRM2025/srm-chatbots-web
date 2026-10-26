import type { Metadata } from "next";
import { IntegrationsSection } from "@/components/integrations/integrations-section";
export const metadata: Metadata = { title: "Integrations | SRM Chatbots" };
export default function IntegrationsPage() {
  return <IntegrationsSection />;
}
