import { ArrowUpRight, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";

export function SuggestedQuestions({ questions, busy, onSelect }: {
  questions: string[];
  busy: boolean;
  onSelect: (event: MouseEvent<HTMLButtonElement>, question: string) => void;
}) {
  if (!questions.length) return null;
  return (
    <section className="suggested-questions" aria-label="Suggested questions">
      <div className="suggested-questions-heading">
        <Sparkles size={13} aria-hidden="true" />
        <span>Suggested questions</span>
      </div>
      <div className="suggested-questions-list">
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
