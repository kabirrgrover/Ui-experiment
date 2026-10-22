import { Fragment } from "react";
import { QUESTIONS } from "../../data/geotechSR";

interface Props {
  answers: string[];
  /** Current question index, or -1 when not asking. */
  current: number;
  step: number;
  asking: boolean;
  onPick: (i: number | null) => void;
}

/** Six numbered steps. Answered ones show a tick and can be clicked to change the answer. */
export function QuestionStepper({ answers, current, step, asking, onPick }: Props) {
  return (
    <nav aria-label="Questions" className="ch-steps">
      {QUESTIONS.map((q, i) => {
        const has = !!answers[i], isCur = asking && i === current;
        const can = asking && (has || i === step);
        const state = isCur ? "cur" : has ? "has" : "todo";
        return (
          <Fragment key={q.key}>
            <button type="button" className={`ch-step is-${state}`} data-can={can || undefined}
              aria-current={isCur ? "step" : undefined}
              title={has ? `${q.key}: ${answers[i]}${asking ? " (click to change)" : ""}` : q.key}
              onClick={() => { if (can) onPick(has && i !== step ? i : null); }}>
              <span className="ch-step__mark">{has && !isCur ? "✓" : i + 1}</span>{q.key}
            </button>
            {i < QUESTIONS.length - 1 && <span aria-hidden="true" className="ch-step__sep" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
