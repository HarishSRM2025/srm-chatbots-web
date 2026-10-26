import {
  Activity,
  BookOpen,
  Bot,
  Code2,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
export const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    description:
      "A clear view of your assistants, knowledge, and conversations.",
  },
  {
    name: "Agents",
    href: "/agents",
    icon: Bot,
    description: "Purpose-built assistants. Powered by your knowledge.",
  },
  {
    name: "Knowledge",
    href: "/knowledge",
    icon: BookOpen,
    description: "Build a trusted source of answers for every assistant.",
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    description: "Put your assistants to work. Pick up where you left off.",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Activity,
    description: "Understand engagement and see your workspace in action.",
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Code2,
    description: "Make your assistant available wherever your audience is.",
  },
] as const;
export type SectionName = (typeof navigation)[number]["name"];
