import { QUESTIONS, UNSURE } from "../../data/geotechSR";

interface Props { index: number; picked: string; isEdit: boolean; onAnswer: (value: string) => void }

/** The current question: big hand-lettered title, why-line, suggested answers and a "not sure" way out. */
export function QuestionCard({ index, picked, isEdit, onAnswer }: Props) {
  const q = QUESTIONS[index];
  return (
    <div className="ch-msg ch-q">
      <div className="ch-q__step">
        Question {index + 1} of {QUESTIONS.length}
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
export function ReadyToDraft({ onDraft }: { onDraft: () => void }) {
  return (
    <div className="ch-msg ch-ready">
      <h2 className="ch-q__title ch-q__title--flush">that's everything I need.</h2>
      <p className="ch-q__why ch-q__why--flush">It'll be about 30 pages. You can keep chatting while I write, and change any answer above first if you like.</p>
      <button type="button" className="ch-box ch-box--primary ch-box--big" onClick={onDraft}>draft my SR</button>
    </div>
  );
}

const FOLLOW_OPTS = ["Yes, a day rate", "No, contractor carries it", "Leave it to them to propose"];

/** The mid-draft question at section 6. Drafting pauses until it's answered. */
export function FollowUp({ onAnswer }: { onAnswer: (value: string) => void }) {
  return (
    <div className="ch-msg ch-follow">
      <div className="ch-follow__kicker">quick one while I write</div>
      <h2 className="ch-follow__title">should the contractor price standby for weather days?</h2>
      <div role="group" aria-label="Answers" className="ch-opts">
        {FOLLOW_OPTS.map((l) => <button key={l} type="button" className="ch-opt" onClick={() => onAnswer(l)}>{l}</button>)}
      </div>
    </div>
  );
}
