import { useEffect, useMemo, useReducer, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ThinkingHandle, ThinkingPanel } from "../../components/thinking/ThinkingPanel";
import { DocFlipbook } from "../../components/flipbook/DocFlipbook";
import type { Section } from "../../data/geotechSR";
import type { DocMeta } from "../../data/scenarios";
import { navigate } from "../../lib/router";
import { Composer } from "./Composer";
import { DraftingCard } from "./DraftingCard";
import { AiMessage, EggMessage, UserMessage } from "./Messages";
import { FollowUp, QuestionCard, ReadyToDraft } from "./QuestionCard";
import { QuestionStepper } from "./QuestionStepper";
import { eggFor, initSession, reducer, type SessionInit, type Tab } from "./state";

/** Milliseconds per drafted section. */
const PACE = 900;
/** Autoplay beats: think before picking, show the pick, then answer. */
const THINK_MS = 900;
const PICK_MS = 500;
const DRAFT_MS = 1200;
const FOLLOW_MS = 1500;

/** Clicks on these hand a playing demo over to the user. */
const TAKEOVER = ".ch-opt, .ch-composer, .ch-steps, .ch-ready, .ch-mine";

interface Props {
  tab: Tab;
  active: boolean;
  init: SessionInit;
  onRunning: (id: string, running: boolean) => void;
}

/**
 * One chat tab. Owns its own state and keeps running while hidden, so demo tabs
 * carry on in the background. Only the active session shows its fixed-position
 * thinking handle, panel and flip-book.
 */
export function ChatSession({ tab, active, init, onRunning }: Props) {
  const [st, dispatch] = useReducer(reducer, init, initSession);
  const [showQA, setShowQA] = useState(false);
  const sc = st.sc;
  const qn = sc.questions.length;
  const sections = useMemo(() => sc.outline(st.answers), [sc, st.answers]);
  const root = useRef<HTMLElement>(null);
  const prefix = `ch-${tab.id}`;

  // Drafting clock.
  useEffect(() => {
    if (st.phase !== "write") return;
    const t = window.setInterval(() => dispatch({ type: "tick" }), PACE);
    return () => clearInterval(t);
  }, [st.phase]);

  // Autoplay: think, show the pick, answer; then draft; then answer the follow-up.
  const started = useRef(false);
  useEffect(() => {
    if (!st.auto) return;
    let t = 0;
    const first = !started.current;
    if (st.phase === "ask") {
      if (st.step < qn) {
        if (st.autoPick === null) {
          t = window.setTimeout(() => { started.current = true; dispatch({ type: "set", patch: { autoPick: sc.demoAnswers[st.step] } }); }, THINK_MS + (first ? (tab.delay ?? 0) + 600 : 0));
        } else {
          const value = st.autoPick;
          t = window.setTimeout(() => dispatch({ type: "answer", i: st.step, value }), PICK_MS);
        }
      } else {
        t = window.setTimeout(() => dispatch({ type: "draft" }), DRAFT_MS);
      }
    } else if (st.phase === "wait") {
      if (st.autoPick === null) t = window.setTimeout(() => dispatch({ type: "set", patch: { autoPick: sc.followUp.opts[0] } }), FOLLOW_MS);
      else { const value = st.autoPick; t = window.setTimeout(() => dispatch({ type: "follow", value }), PICK_MS); }
    }
    return () => clearTimeout(t);
  }, [st.auto, st.phase, st.step, st.autoPick, qn, sc, tab.delay]);

  const running = st.auto && st.phase !== "done";
  useEffect(() => { onRunning(tab.id, running); }, [tab.id, running, onRunning]);

  // Open the flip-book once when the draft finishes, but only in front of the user:
  // a background tab waits until you switch to it.
  useEffect(() => {
    if (active && st.phase === "done" && !st.bookShown) dispatch({ type: "set", patch: { book: true, bookShown: true } });
  }, [active, st.phase, st.bookShown]);

  // Keep the live thing in view: the open question, the drafting card, the follow-up.
  const firstScroll = useRef(true);
  const answered = st.answers.filter(Boolean).length;
  useEffect(() => {
    if (!active) return;
    const scope = root.current;
    if (!scope) return;
    const sel = st.phase === "ask" ? ".ch-opts" : st.phase === "wait" ? ".ch-follow" : ".ch-card";
    const el = scope.querySelector(sel) ?? scope.querySelector(".ch-card");
    const first = firstScroll.current;
    firstScroll.current = false;
    if (!el) return;
    if (st.phase === "ask" && (first || answered === 0)) return;
    const instant = first || matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: st.phase === "write" || st.phase === "done" ? "start" : st.phase === "wait" ? "end" : "center" }));
  }, [active, st.phase, answered]);

  const asking = st.phase === "ask";
  const qi = st.editing !== null ? st.editing : st.step;
  const hasQuestion = asking && qi < qn;
  const pagesTotal = sections.reduce((a, s) => a + s.pages, 0);
  const status = running ? (asking ? "demo · answering" : st.phase === "done" ? "draft ready" : "demo · drafting")
    : asking ? `${answered} of ${qn} answered` : st.phase === "done" ? `draft ready · ${pagesTotal} pages` : "drafting";
  const placeholder = asking ? "type your own answer, or ask me why…" : st.phase === "done" ? "ask for a change…" : "add a note while I write…";
  const isDemo = tab.kind === "demo";

  const answer = (value: string) => dispatch({ type: "answer", i: qi, value });
  const send = () => {
    const v = st.text.trim();
    if (!v) return;
    const egg = eggFor(v);
    if (egg) dispatch({ type: "egg", egg });
    else if (hasQuestion) answer(v);
    else dispatch({ type: "note", value: v });
  };
  const jumpTo = (i: number) => {
    dispatch({ type: "set", patch: { peek: i } });
    requestAnimationFrame(() => document.getElementById(`${prefix}-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };
  // A real click on an answer, the composer or the stepper takes over from the demo.
  const takeOver = (e: PointerEvent<HTMLElement>) => {
    if (!st.auto || !e.isTrusted) return;
    if ((e.target as Element).closest(TAKEOVER)) dispatch({ type: "set", patch: { auto: false, autoPick: null } });
  };

  // ---- the thread ----
  const thread: ReactNode[] = [<AiMessage key="intro" text={sc.intro} />];
  const qa: ReactNode[] = [];
  st.answers.forEach((a, i) => {
    if (!a) return;
    qa.push(<UserMessage key={`a${i}`} text={a} onEdit={asking && !st.auto ? () => dispatch({ type: "edit", i }) : undefined} />);
    qa.push(<AiMessage key={`k${i}`} text={sc.questions[i].ack} />);
  });
  // Once drafting starts, the answered questions fold into one line so the drafting card is up top.
  if (asking) thread.push(...qa);
  else if (qa.length) {
    const n = st.answers.filter(Boolean).length;
    thread.push(
      <div key="fold" className="ch-fold">
        <button type="button" className="ch-fold__btn" aria-expanded={showQA} onClick={() => setShowQA((v) => !v)}>
          <span className="ch-fold__n">{n} answers</span>
          <span className="ch-fold__list">{st.answers.filter(Boolean).join(" · ")}</span>
          <span className="ch-fold__chev" aria-hidden="true">{showQA ? "hide" : "show"}</span>
        </button>
        {showQA && <div className="ch-fold__body">{qa}</div>}
      </div>,
    );
  }
  if (!asking) {
    thread.push(
      <DraftingCard key="draft" phase={st.phase} done={st.done} sections={sections} fig={st.fig}
        onFig={(fig) => dispatch({ type: "set", patch: { fig } })}
        peek={st.peek} onPeek={(peek) => dispatch({ type: "set", patch: { peek } })}
        onViewDraft={() => dispatch({ type: "set", patch: { book: true } })}
        onDownload={() => downloadDraft(sc.meta, sections)}
        onRestart={() => { started.current = false; dispatch({ type: "restart", auto: isDemo }); }}
        nowLines={sc.nowLines} sources={sc.sources} idPrefix={prefix}
        restartLabel={isDemo ? "replay demo" : "start over"} />,
    );
  }
  if (st.follow) {
    thread.push(<UserMessage key="follow" text={st.follow} />);
    thread.push(<AiMessage key="follow-ack" text={sc.followUp.ack} />);
  }
  st.notes.forEach((n, i) => {
    thread.push(<UserMessage key={`n${i}`} text={n} />);
    thread.push(<AiMessage key={`na${i}`} text={st.phase === "done" ? "Noted. Open it in the canvas and I will make that change there." : "Noted, I will work that into the sections I have not written yet."} />);
  });
  st.eggs.forEach((g, i) => {
    thread.push(<UserMessage key={`e${i}`} text={g.said} />);
    thread.push(<EggMessage key={`eg${i}`} img={g.img} text={g.text} />);
  });

  return (
    <>
      <section ref={root} id={`ch-panel-${tab.id}`} role="tabpanel" aria-labelledby={`ch-tab-${tab.id}`} hidden={!active}
        className="ch-col" onPointerDownCapture={takeOver}>
        <div className="ch-title">
          <img className="ch-wiggle" src="/assets/hello-sr.svg" alt="" />
          <div className="ch-title__text">
            <span className="ch-title__name">
              {tab.kind === "live" && tab.title !== "Live run" ? tab.title.toLowerCase() : sc.display}
              <span className={"ch-kind ch-kind--" + (tab.kind === "live" ? "live" : "demo")}>{tab.kind === "live" ? "live" : "demo"}</span>
            </span>
            <span className="ch-title__sub ch-num">
              {tab.kind === "live" ? "SR draft" : sc.meta.id} · {status}
              {running && <span className="ch-demo-tag">demo playing · click any answer to take over</span>}
            </span>
          </div>
        </div>
        <QuestionStepper questions={sc.questions} answers={st.answers} current={hasQuestion ? qi : -1} step={st.step} asking={asking}
          onPick={(i) => dispatch({ type: "edit", i })} />
        <div className="ch-thread">
          {thread}
          {hasQuestion && (
            <QuestionCard key={`q${qi}`} q={sc.questions[qi]} index={qi} total={qn}
              picked={st.answers[qi] || st.autoPick || ""} isEdit={st.editing !== null} onAnswer={answer} />
          )}
          {asking && !hasQuestion && <ReadyToDraft pages={pagesTotal} onDraft={() => dispatch({ type: "draft" })} />}
          {st.phase === "wait" && <FollowUp f={sc.followUp} picked={st.autoPick} onAnswer={(value) => dispatch({ type: "follow", value })} />}
        </div>
        <Composer idPrefix={prefix} text={st.text} placeholder={placeholder} onText={(text) => dispatch({ type: "set", patch: { text } })} onSend={send} />
      </section>

      {active && (
        <>
          <ThinkingHandle open={st.panel} onToggle={() => dispatch({ type: "set", patch: { panel: !st.panel } })} live={st.phase === "write"} />
          <ThinkingPanel open={st.panel} onClose={() => dispatch({ type: "set", patch: { panel: false } })}
            phase={st.phase} done={st.done} answers={st.answers} onJumpToSection={jumpTo} scenario={sc} />
          <DocFlipbook open={st.book} meta={sc.meta} sections={sections} margin={sc.margin}
            onOpenCanvas={() => navigate("/canvas")}
            onDownload={() => downloadDraft(sc.meta, sections)}
            onClose={() => dispatch({ type: "set", patch: { book: false } })} />
        </>
      )}
    </>
  );
}

/**
 * Demo export: a Markdown file of the outline. A real .docx comes from the backend
 * (python-docx or similar on Databricks); generating .docx in the browser is out of scope here.
 */
function downloadDraft(meta: DocMeta, sections: Section[]) {
  const md = [`# ${meta.id} · ${meta.title}`, "", ...sections.flatMap((s) => [`## ${s.n}. ${s.title}`, "", s.body, ""])].join("\n");
  const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${meta.id}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
