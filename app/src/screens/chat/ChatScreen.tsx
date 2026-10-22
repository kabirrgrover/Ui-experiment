import { useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { AppHeader } from "../../components/AppHeader";
import { ThinkingHandle, ThinkingPanel } from "../../components/thinking/ThinkingPanel";
import { DocFlipbook } from "../../components/flipbook/DocFlipbook";
import { buildOutline, DOC_META, QUESTIONS, type Section } from "../../data/geotechSR";
import { navigate, useQuery } from "../../lib/router";
import { Composer } from "./Composer";
import { DraftingCard } from "./DraftingCard";
import { AiMessage, EggMessage, UserMessage } from "./Messages";
import { PastChatsCrane } from "./PastChatsCrane";
import { FollowUp, QuestionCard, ReadyToDraft } from "./QuestionCard";
import { QuestionStepper } from "./QuestionStepper";
import { eggFor, initState, reducer } from "./state";
import { WorkspaceTabs } from "./WorkspaceTabs";
import "./chat.css";

/** Milliseconds per drafted section in the demo. */
const PACE = 900;

/**
 * The SR chat. The AI asks six questions (answers editable from the stepper or the bubbles),
 * then drafts section by section while a crane or plotter builds. One follow-up question
 * pauses drafting at section 6. When it's done the flip-book opens.
 */
export default function ChatScreen() {
  const query = useQuery();
  const [st, dispatch] = useReducer(reducer, query, initState);
  const sections = useMemo(() => buildOutline(st.answers), [st.answers]);

  // Drafting clock.
  useEffect(() => {
    if (st.phase !== "write") return;
    const t = window.setInterval(() => dispatch({ type: "tick" }), PACE);
    return () => clearInterval(t);
  }, [st.phase]);

  // Open the flip-book once when the draft finishes.
  useEffect(() => {
    if (st.phase === "done" && !st.bookShown) dispatch({ type: "set", patch: { book: true, bookShown: true } });
  }, [st.phase, st.bookShown]);

  // Keep the live thing in view: the open question while asking, the drafting card while
  // drafting, the follow-up when paused. Jump instantly on first render, glide after that.
  const firstScroll = useRef(true);
  const answeredCount = st.answers.filter(Boolean).length;
  useEffect(() => {
    const sel = st.phase === "ask" ? ".ch-opts" : st.phase === "wait" ? ".ch-follow" : ".ch-card";
    const el = document.querySelector(sel) ?? document.querySelector(".ch-card");
    if (!el) return;
    const first = firstScroll.current;
    const instant = first || matchMedia("(prefers-reduced-motion: reduce)").matches;
    firstScroll.current = false;
    // On first load while asking, stay at the top so the header and past chats are visible.
    if (st.phase === "ask" && (first || answeredCount === 0)) return;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: st.phase === "write" || st.phase === "done" ? "start" : st.phase === "wait" ? "end" : "center" }));
  }, [st.phase, answeredCount]);

  const asking = st.phase === "ask";
  const qi = st.editing !== null ? st.editing : st.step;
  const hasQuestion = asking && qi < QUESTIONS.length;
  const answered = st.answers.filter(Boolean).length;
  const pagesTotal = sections.reduce((a, s) => a + s.pages, 0);
  const activeTab = st.tabs.find((t) => t.id === st.active) ?? st.tabs[0];
  const isDemo = activeTab.id === "geo";
  const status = asking ? `${answered} of 6 answered` : st.phase === "done" ? `draft ready · ${pagesTotal} pages` : "drafting";
  const placeholder = asking ? "type your own answer, or ask me why…" : st.phase === "done" ? "ask for a change…" : "add a note while I write…";

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
    requestAnimationFrame(() => document.getElementById(`ch-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  // ---- the thread ----
  const thread: ReactNode[] = [
    <AiMessage key="intro" text="Let's put together a geotech service requisition. Six questions, then I'll draft it. Attach a soil report or an old SR if you have one and I'll pull answers from it." />,
  ];
  st.answers.forEach((a, i) => {
    if (!a) return;
    thread.push(<UserMessage key={`a${i}`} text={a} onEdit={asking ? () => dispatch({ type: "edit", i }) : undefined} />);
    thread.push(<AiMessage key={`k${i}`} text={QUESTIONS[i].ack} />);
  });
  if (!asking) {
    thread.push(
      <DraftingCard key="draft" phase={st.phase} done={st.done} sections={sections} fig={st.fig}
        onFig={(fig) => dispatch({ type: "set", patch: { fig } })}
        peek={st.peek} onPeek={(peek) => dispatch({ type: "set", patch: { peek } })}
        onViewDraft={() => dispatch({ type: "set", patch: { book: true } })}
        onDownload={() => downloadDraft(sections)}
        onRestart={() => dispatch({ type: "restart" })} />,
    );
  }
  if (st.follow) {
    thread.push(<UserMessage key="follow" text={st.follow} />);
    thread.push(<AiMessage key="follow-ack" text="Thanks. I added a standby line to the pricing schedule and carried on." />);
  }
  st.notes.forEach((n, i) => {
    thread.push(<UserMessage key={`n${i}`} text={n} />);
    thread.push(<AiMessage key={`na${i}`} text={st.phase === "done" ? "Noted. Open it in the canvas and I will make that change there." : "Noted, I will work that into the sections I have not written yet."} />);
  });
  st.eggs.forEach((g, i) => {
    thread.push(<UserMessage key={`e${i}`} text={g.said} />);
    thread.push(<EggMessage key={`eg${i}`} img={g.img} text={g.text} />);
  });

  const pastToggle = (
    <button type="button" aria-expanded={st.showPast} aria-controls="ch-past" onClick={() => dispatch({ type: "set", patch: { showPast: !st.showPast } })}>
      <img src="/assets/icon-chat.svg" alt="" />Past chats
    </button>
  );

  return (
    <div className="ch-page">
      <AppHeader pastChats={pastToggle} />
      {st.showPast && <PastChatsCrane onOpen={(tab) => dispatch({ type: "openTab", tab })} />}
      <WorkspaceTabs tabs={st.tabs} active={st.active}
        onPick={(active) => dispatch({ type: "set", patch: { active } })}
        onClose={(id) => dispatch({ type: "closeTab", id })} />

      <main className="ch-main">
        {isDemo ? (
          <section aria-label="Chat" className="ch-col">
            <img className="ch-margin" src="/assets/tool-level.svg" alt="" />
            <div className="ch-title">
              <img className="ch-wiggle" src="/assets/hello-sr.svg" alt="" />
              <div className="ch-title__text">
                <span className="ch-title__name">geotech SR, north pad</span>
                <span className="ch-title__sub ch-num">{DOC_META.id} · {status}</span>
              </div>
            </div>
            <QuestionStepper answers={st.answers} current={hasQuestion ? qi : -1} step={st.step} asking={asking}
              onPick={(i) => dispatch({ type: "edit", i })} />
            <div className="ch-thread">
              {thread}
              {hasQuestion && <QuestionCard key={`q${qi}`} index={qi} picked={st.answers[qi]} isEdit={st.editing !== null} onAnswer={answer} />}
              {asking && !hasQuestion && <ReadyToDraft onDraft={() => dispatch({ type: "draft" })} />}
              {st.phase === "wait" && <FollowUp onAnswer={(value) => dispatch({ type: "follow", value })} />}
            </div>
            <Composer text={st.text} placeholder={placeholder} onText={(text) => dispatch({ type: "set", patch: { text } })} onSend={send} />
          </section>
        ) : (
          <div className="ch-msg ch-saved">
            <h1 className="ch-saved__title">{activeTab.doc} · {activeTab.title}</h1>
            <div className="ch-saved__body">Welcome back. This one is saved. Ask me to change anything, or open the document.</div>
            <a href="/canvas" onClick={(e) => { e.preventDefault(); navigate("/canvas"); }} className="ch-box ch-saved__open">open the document</a>
          </div>
        )}
      </main>

      <ThinkingHandle open={st.panel} onToggle={() => dispatch({ type: "set", patch: { panel: !st.panel } })} live={st.phase === "write"} />
      <ThinkingPanel open={st.panel} onClose={() => dispatch({ type: "set", patch: { panel: false } })}
        phase={st.phase} done={st.done} answers={st.answers} onJumpToSection={jumpTo} />
      <DocFlipbook open={st.book} meta={DOC_META} sections={sections}
        onOpenCanvas={() => navigate("/canvas")}
        onDownload={() => downloadDraft(sections)}
        onClose={() => dispatch({ type: "set", patch: { book: false } })} />
    </div>
  );
}

/**
 * Demo export: a Markdown file of the outline. A real .docx comes from the backend
 * (python-docx or similar on Databricks); generating .docx in the browser is out of scope here.
 */
function downloadDraft(sections: Section[]) {
  const md = [`# ${DOC_META.id} · ${DOC_META.title}`, "", ...sections.flatMap((s) => [`## ${s.n}. ${s.title}`, "", s.body, ""])].join("\n");
  const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${DOC_META.id}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
