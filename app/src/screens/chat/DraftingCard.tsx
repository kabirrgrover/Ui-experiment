import type { DraftPhase, Section } from "../../data/geotechSR";
import { NOW_LINES, SOURCES } from "../../data/geotechSR";
import { linkTo } from "../../lib/router";
import { CraneThumb, DraftFigure, type FigureName } from "./DraftFigure";

const REF_TINT = ["#fbf0cd", "#def2fb", "#ffecf0", "#e5f7d2", "#f8e1fa", "#fce6c9", "#fbf0cd"];

interface Props {
  phase: DraftPhase;
  done: number;
  sections: Section[];
  fig: FigureName;
  onFig: (f: FigureName) => void;
  peek: number | null;
  onPeek: (i: number | null) => void;
  onViewDraft: () => void;
  onDownload: () => void;
  onRestart: () => void;
}

/** The draft card in the thread: live figure while writing, then a done header, the outline and actions. */
export function DraftingCard({ phase, done, sections, fig, onFig, peek, onPeek, onViewDraft, onDownload, onRestart }: Props) {
  const total = sections.length;
  const isDone = phase === "done";
  const busy = phase === "write" || phase === "wait";
  const pagesTotal = sections.reduce((a, s) => a + s.pages, 0);
  const pagesSoFar = sections.slice(0, done).reduce((a, s) => a + s.pages, 0);
  const pct = isDone ? 100 : Math.round((done / total) * 100);
  const title = isDone ? "your SR is ready" : phase === "wait" ? "paused for one question" : "drafting your SR";
  const sub = isDone ? `${pagesTotal} pages · ${total} sections · saved to Folders` : `page ${pagesSoFar} of ~${pagesTotal} · section ${Math.min(done + 1, total)} of ${total}`;
  const nowLine = phase === "wait" ? "paused: one quick question below" : NOW_LINES[Math.min(done, NOW_LINES.length - 1)];
  const refs = SOURCES.filter((r) => done >= r.at || isDone);
  const bar = <div aria-hidden="true" className="ch-bar"><div style={{ width: `${pct}%` }} /></div>;

  return (
    <div className="ch-msg ch-card">
      {busy && (
        <div className="ch-stage">
          <div role="group" aria-label="Drawing" className="ch-seg">
            {(["crane", "plotter"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={fig === f} onClick={() => onFig(f)}>{f}</button>
            ))}
          </div>
          <DraftFigure name={fig} set={done} />
          <div className="ch-stage__title">{title}</div>
          <div role="status" className="ch-stage__now">{nowLine}</div>
          <div className="ch-stage__bar">{bar}</div>
          <div className="ch-stage__sub ch-num">{sub}</div>
          <div aria-label="Sources pulled so far" className="ch-refs">
            {refs.map((r, i) => (
              <span key={r.id} className="ch-ref" style={{ background: REF_TINT[i], transform: `rotate(${((i % 3) - 1) * 1.5}deg)` }}>
                <span className="ch-ref__kind">{r.kind}</span>{r.title}
              </span>
            ))}
          </div>
        </div>
      )}
      {isDone && (
        <div className="ch-donehead">
          <CraneThumb />
          <div className="ch-donehead__text">
            <div className="ch-donehead__title">{title}</div>
            <div className="ch-donehead__sub">{sub}</div>
            {bar}
          </div>
          <img className="ch-slap ch-donehead__stamp" src="/assets/specd-signed.svg" alt="" />
        </div>
      )}
      <Outline phase={phase} done={done} sections={sections} peek={peek} onPeek={onPeek} />
      {isDone && (
        <div className="ch-actions">
          <button type="button" className="ch-box ch-box--primary" onClick={onViewDraft}>view draft</button>
          <a href="/canvas" onClick={linkTo("/canvas")} className="ch-box">open in canvas</a>
          <button type="button" className="ch-box" onClick={onDownload}>download</button>
          <button type="button" className="ch-restart" onClick={onRestart}>run the demo again</button>
        </div>
      )}
    </div>
  );
}

interface OutlineProps { phase: DraftPhase; done: number; sections: Section[]; peek: number | null; onPeek: (i: number | null) => void }

/** Section list with live status. Finished sections can be peeked. */
export function Outline({ phase, done, sections, peek, onPeek }: OutlineProps) {
  return (
    <ol aria-label="Sections" className="ch-outline">
      {sections.map((s, i) => {
        const isDone = i < done || phase === "done";
        const isNow = !isDone && i === done && phase === "write";
        const isWait = !isDone && i === done && phase === "wait";
        const state = isDone ? "done" : isNow ? "now" : isWait ? "wait" : "todo";
        const open = peek === i;
        return (
          <li key={s.n} id={`ch-sec-${i}`} className={`ch-row is-${state}`}>
            <div className="ch-row__line">
              <span aria-hidden="true" className="ch-row__icon">{isDone ? "✓" : isWait ? "?" : ""}</span>
              <span className="ch-row__label"><span className="ch-row__num ch-num">{s.n}.</span>{s.title}</span>
              <span className="ch-row__meta ch-num">{isDone ? `${s.pages} ${s.pages === 1 ? "page" : "pages"}` : isNow ? "writing…" : isWait ? "needs you" : ""}</span>
              {isDone && (
                <button type="button" className="ch-peek" aria-expanded={open} onClick={() => onPeek(open ? null : i)}>{open ? "hide" : "peek"}</button>
              )}
            </div>
            {isDone && open && <p className="ch-row__excerpt">{s.body}</p>}
          </li>
        );
      })}
    </ol>
  );
}
