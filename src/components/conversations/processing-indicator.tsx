import { Bot } from "lucide-react";
export function ProcessingIndicator() {
  return (
    <div
      className="processing-indicator"
      role="status"
      aria-label="Assistant is preparing a response"
    >
      <span className="processing-avatar">
        <Bot size={17} />
      </span>
      <div>
        <span>Preparing a response</span>
        <span className="processing-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
