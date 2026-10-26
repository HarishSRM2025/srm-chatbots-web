import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/format";
export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "violet",
}: {
  label: string;
  value: number | undefined;
  description: string;
  icon: LucideIcon;
  tone?: "violet" | "blue" | "green" | "amber";
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={20} />
        </span>
      </div>
      <strong>{value === undefined ? "—" : formatNumber(value)}</strong>
      <p>
        <span className="metric-dot" />
        {description}
      </p>
    </article>
  );
}
