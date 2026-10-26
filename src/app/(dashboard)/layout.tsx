import { WorkspaceProvider } from "@/providers/workspace-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import "@/styles/dashboard.css";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
