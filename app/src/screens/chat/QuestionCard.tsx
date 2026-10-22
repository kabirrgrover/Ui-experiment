import { UNSURE, type Question } from "../../data/geotechSR";
import type { FollowUpQuestion } from "../../data/scenarios";

interface Props { q: Question; index: number; total: number; picked: string; isEdit: boolean; onAnswer: (value: string) => void }

/** The current question: big hand-lettered title, why-line, suggested answers and a "not sure" way out. */
export function QuestionCard({ q, index, total, picked, isEdit, onAnswer }: Props) {
  return (
    <div className="ch-msg ch-q">
      <div className="ch-q__step">
        Question {index + 1} of {total}
        {isEdit && <span className="ch-q__editing">changing your answer</span>}
      </div>
      <h2 className="ch-q__title">{q.title}</h2>
      <p className="ch-q__why">{q.why}</p>
      <div role="group" aria-label="Suggested answers" className="ch-opts">
        {q.opts.map((o, k) => (
          <button key={o} type="button" className={"ch-opt" + (picked === o ? " is-picked" : "")} aria-pressed={picked === o} onClick={() => onAnswer(o)}>
            <span className="ch-opt__n">{k + 1}</span>{o}
          </button>
        ))}
        <button type="button" className="ch-opt ch-opt--unsure" onClick={() => onAnswer(UNSURE)}>not sure, let the contractor propose</button>
      </div>
    </div>
  );
}

/** Shown once every question has an answer. */
export function ReadyToDraft({ pages, onDraft }: { pages: number; onDraft: () => void }) {
  return (
    <div className="ch-msg ch-ready">
      <h2 className="ch-q__title ch-q__title--flush">that's everything I need.</h2>
      <p className="ch-q__why ch-q__why--flush">It'll be about {pages} pages. You can keep chatting while I write, and change any answer above first if you like.</p>
      <button type="button" className="ch-box ch-box--primary ch-box--big" onClick={onDraft}>draft my SR</button>
    </div>
  );
}

/** The mid-draft question. Drafting pauses until it's answered. */
export function FollowUp({ f, picked, onAnswer }: { f: FollowUpQuestion; picked?: string | null; onAnswer: (value: string) => void }) {
  return (
    <div className="ch-msg ch-follow">
      <div className="ch-follow__kicker">quick one while I write</div>
      <h2 className="ch-follow__title">{f.title}</h2>
      <div role="group" aria-label="Answers" className="ch-opts">
        {f.opts.map((l) => <button key={l} type="button" className={"ch-opt" + (picked === l ? " is-picked" : "")} onClick={() => onAnswer(l)}>{l}</button>)}
      </div>
    </div>
  );
}
