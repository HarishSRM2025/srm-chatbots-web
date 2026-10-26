import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SRM Chatbots | Workspace",
  description: "Build, train, and manage your institutional AI assistants.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
