import type { DraftPhase } from "../../data/geotechSR";
import type { Scenario } from "../../data/scenarios";

/** A canned sticker reply to small talk ("coffee", "hi", "thanks"). */
export interface Egg { said: string; img: string; text: string }

/**
 * One open tab = one chat session.
 * - demo: a scenario that plays itself (questions, drafting, follow-up, done)
 * - live: a scenario you answer yourself
 * - saved: title only, opens the "saved doc" placeholder (MRs, past chats)
 */
export interface Tab {
  id: string;
  doc: string;
  title: string;
  kind: "demo" | "live" | "saved";
  scenario?: string;
  /** Autoplay start delay in ms for demo tabs. */
  delay?: number;
  /** Pastel tint key for the tab strip. */
  tint?: string;
}

export const INITIAL_TABS: Tab[] = [
  { id: "geo", doc: "SR", title: "Geotech, North pad", kind: "demo", scenario: "geotech", delay: 0, tint: "geo" },
  { id: "pour", doc: "SR", title: "Concrete testing, pour 4", kind: "demo", scenario: "concrete", delay: 2500, tint: "pour" },
  { id: "hydro", doc: "SR", title: "Hydro test, cooling loop", kind: "demo", scenario: "hydro", delay: 5000, tint: "sub" },
  { id: "rebar", doc: "MR", title: "Rebar, level 2", kind: "saved", tint: "rebar" },
  { id: "trays", doc: "MR", title: "Cable trays, substation B", kind: "saved", tint: "bridge" },
  { id: "live", doc: "SR", title: "Live run", kind: "live", scenario: "geotech", tint: "lift" },
];

export interface ChatState {
  sc: Scenario;
  /** Furthest question reached (index into questions; questions.length = all asked). */
  step: number;
  /** One entry per question, "" when unanswered. */
  answers: string[];
  /** Question being re-answered, or null. */
  editing: number | null;
  phase: DraftPhase;
  /** Sections finished. */
  done: number;
  /** Answer to the mid-draft follow-up question. */
  follow: string | null;
  notes: string[];
  eggs: Egg[];
  /** Outline row whose excerpt is open. */
  peek: number | null;
  text: string;
  panel: boolean;
  fig: "crane" | "plotter";
  book: boolean;
  /** The flip-book auto-opens once per draft. */
  bookShown: boolean;
  /** Demo is playing itself. Any real click in the tab hands control to the user. */
  auto: boolean;
  /** Option the autoplay is about to pick (shown pressed for a beat). */
  autoPick: string | null;
}

export interface SessionInit {
  sc: Scenario;
  kind: Tab["kind"];
  autoplay: boolean;
  /** URL overrides for the first SR tab: ?state= ?panel=1 ?book=1 ?figure= */
  query?: URLSearchParams;
}

function blank(sc: Scenario): ChatState {
  return {
    sc, step: 0, answers: sc.questions.map(() => ""), editing: null, phase: "ask", done: 0, follow: null,
    notes: [], eggs: [], peek: null, text: "", panel: false, fig: sc.figure, book: false, bookShown: false,
    auto: false, autoPick: null,
  };
}

/** First state for a session. Demo tabs without autoplay start with three answers in, so they never look empty. */
export function initSession({ sc, kind, autoplay, query }: SessionInit): ChatState {
  const s = blank(sc);
  const total = sc.outline([]).length;
  if (kind === "demo") {
    if (autoplay) s.auto = true;
    else { s.answers = sc.questions.map((_, i) => (i < 3 ? sc.demoAnswers[i] : "")); s.step = 3; }
  }
  if (!query) return s;
  s.panel = query.get("panel") === "1";
  const fig = query.get("figure");
  if (fig === "plotter" || fig === "crane") s.fig = fig;
  const st = query.get("state");
  if (st === "drafting" || st === "wait" || st === "done") {
    s.answers = [...sc.demoAnswers];
    s.step = sc.questions.length;
  }
  if (st === "drafting") { s.phase = "write"; s.done = 4; }
  if (st === "wait") { s.phase = "wait"; s.done = sc.followUp.at; }
  if (st === "done") {
    s.phase = "done"; s.done = total; s.follow = sc.followUp.opts[0];
    s.bookShown = true; s.book = query.get("book") === "1";
  }
  return s;
}

export type Action =
  | { type: "answer"; i: number; value: string }
  | { type: "edit"; i: number | null }
  | { type: "draft" }
  | { type: "tick" }
  | { type: "follow"; value: string }
  | { type: "note"; value: string }
  | { type: "egg"; egg: Egg }
  | { type: "restart"; auto: boolean }
  | { type: "set"; patch: Partial<ChatState> };

export function reducer(st: ChatState, a: Action): ChatState {
  const qn = st.sc.questions.length;
  switch (a.type) {
    case "answer": {
      const answers = st.answers.slice();
      answers[a.i] = a.value;
      let next = Math.max(st.step, a.i + 1);
      while (next < qn && answers[next]) next++;
      return { ...st, answers, step: st.editing !== null ? st.step : next, editing: null, text: "", autoPick: null };
    }
    case "edit":
      return st.phase === "ask" ? { ...st, editing: a.i } : st;
    case "draft":
      return { ...st, phase: "write", done: 0, follow: null, notes: [], peek: null, book: false, bookShown: false };
    case "tick": {
      if (st.phase !== "write") return st;
      const total = st.sc.outline(st.answers).length;
      const next = st.done + 1;
      // The follow-up section needs one more answer before it can be written.
      if (next === st.sc.followUp.at && st.follow === null) return { ...st, done: next, phase: "wait" };
      if (next >= total) return { ...st, done: total, phase: "done" };
      return { ...st, done: next };
    }
    case "follow":
      return { ...st, follow: a.value, phase: "write", autoPick: null };
    case "note":
      return { ...st, notes: [...st.notes, a.value], text: "" };
    case "egg":
      return { ...st, eggs: [...st.eggs, a.egg], text: "" };
    case "restart":
      return { ...blank(st.sc), panel: st.panel, fig: st.fig, auto: a.auto };
    case "set":
      return { ...st, ...a.patch };
  }
}

/** Small-talk easter eggs. Returns null for a normal message. */
export function eggFor(v: string): Egg | null {
  if (/\b(coffee|lunch|tea|tired)\b/i.test(v)) return { said: v, img: "/assets/hard-hat-eyes.svg", text: "Site coffee is terrible. Have a hard hat instead, then back to it." };
  if (/^(hi|hey|hello|yo)\b/i.test(v)) return { said: v, img: "/assets/peace-glove.png", text: "Hey. Glove on, let us get this SR done." };
  if (/\b(thanks|thank you|cheers)\b/i.test(v)) return { said: v, img: "/assets/smiley.svg", text: "Anytime." };
  return null;
}
