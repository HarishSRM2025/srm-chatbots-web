import type { Analytics } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
export function ActivityChart({
  activity,
}: {
  activity: Analytics["daily_activity"];
}) {
  const max = Math.max(1, ...activity.map((d) => d.conversations));
  const total = activity.reduce((sum, d) => sum + d.conversations, 0);
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Conversation activity</h2>
          <p>Daily conversations over the last 7 days</p>
        </div>
        <span className="chart-period">Last 7 days</span>
      </div>
      <div className="chart-total">
        <strong>{formatNumber(total)}</strong>
        <span>conversations this week</span>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={activity
          .map(
            (d) =>
              `${formatDate(d.date + "T12:00:00")}: ${d.conversations} conversations`,
          )
          .join("; ")}
      >
        {activity.map((d) => (
          <div className="bar-column" key={d.date}>
            <strong>{d.conversations}</strong>
            <div
              className="bar"
              style={{
                height: `${Math.max(3, (d.conversations / max) * 150)}px`,
              }}
            />
            <small>{formatDate(d.date + "T12:00:00")}</small>
          </div>
        ))}
      </div>
      {total === 0 && (
        <p className="chart-empty-note">
          No activity yet. Start a conversation to see it here.
        </p>
      )}
    </section>
  );
}
