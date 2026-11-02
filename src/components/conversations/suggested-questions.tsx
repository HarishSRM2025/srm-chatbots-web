import { ArrowUpRight, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useId, type MouseEvent } from "react";

export function SuggestedQuestions({ questions, busy, onSelect, expanded, onToggle }: {
  questions: string[];
  expanded: boolean;
  onToggle: () => void;
  busy: boolean;
  onSelect: (event: MouseEvent<HTMLButtonElement>, question: string) => void;
}) {
  const listId = useId();
  if (!questions.length) return null;
  return (
    <section className="suggested-questions" aria-label="Suggested questions">
      <div className="suggested-questions-heading">
        <Sparkles size={13} aria-hidden="true" />
        <span>Suggested questions</span>
        <button type="button" className="suggested-questions-toggle"
          aria-expanded={expanded} aria-controls={listId}
          aria-label={expanded ? "Hide suggested questions" : "Show suggested questions"}
          onClick={onToggle}>
          {expanded ? "Hide" : "Show"}
          {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
        </button>
      </div>
      <div id={listId} className="suggested-questions-list" hidden={!expanded}>
        {questions.map((question, index) => (
          <button className="suggested-question" type="button" key={index}
            disabled={busy} onClick={event => onSelect(event, question)}>
            <span>{question}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
