import { buildOutline, QUESTIONS, type DraftPhase } from "../../data/geotechSR";

/** A canned sticker reply to small talk ("coffee", "hi", "thanks"). */
export interface Egg { said: string; img: string; text: string }

export interface Tab { id: string; doc: string; title: string }

export interface ChatState {
  /** Furthest question reached (index into QUESTIONS; QUESTIONS.length = all asked). */
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
  showPast: boolean;
  active: string;
  tabs: Tab[];
  book: boolean;
  /** The flip-book auto-opens once per draft. */
  bookShown: boolean;
}

export const TOTAL = buildOutline([]).length;
const DEMO_ANSWERS = ["North pad", "Boreholes and lab testing", "Class D", "", "", ""];
const FULL_ANSWERS = ["North pad", "Boreholes and lab testing", "Class D", "3 × 20 m", "Within 2 weeks", "Factual report"];

export const INITIAL_TABS: Tab[] = [
  { id: "geo", doc: "SR", title: "Geotech, North pad" },
  { id: "rebar", doc: "MR", title: "Rebar, level 2" },
];

/** Build the first state from the URL: ?past=1 ?state=ask|drafting|wait|done ?book=1 ?panel=1 ?figure=plotter */
export function initState(q: URLSearchParams): ChatState {
  const s: ChatState = {
    step: 3, answers: [...DEMO_ANSWERS], editing: null, phase: "ask", done: 0, follow: null,
    notes: [], eggs: [], peek: null, text: "", panel: q.get("panel") === "1",
    fig: q.get("figure") === "plotter" ? "plotter" : "crane",
    showPast: q.get("past") === "1", active: "geo", tabs: INITIAL_TABS, book: false, bookShown: false,
  };
  const st = q.get("state");
  if (st === "drafting" || st === "wait" || st === "done") {
    s.answers = [...FULL_ANSWERS];
    s.step = QUESTIONS.length;
  }
  if (st === "drafting") { s.phase = "write"; s.done = 4; }
  if (st === "wait") { s.phase = "wait"; s.done = 5; }
  if (st === "done") {
    s.phase = "done"; s.done = TOTAL; s.follow = "Yes, a day rate";
    s.bookShown = true; s.book = q.get("book") === "1";
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
  | { type: "restart" }
  | { type: "set"; patch: Partial<ChatState> }
  | { type: "openTab"; tab: Tab }
  | { type: "closeTab"; id: string };

export function reducer(st: ChatState, a: Action): ChatState {
  switch (a.type) {
    case "answer": {
      const answers = st.answers.slice();
      answers[a.i] = a.value;
      let next = Math.max(st.step, a.i + 1);
      while (next < QUESTIONS.length && answers[next]) next++;
      return { ...st, answers, step: st.editing !== null ? st.step : next, editing: null, text: "" };
    }
    case "edit":
      return st.phase === "ask" ? { ...st, editing: a.i } : st;
    case "draft":
      return { ...st, phase: "write", done: 0, follow: null, notes: [], peek: null, book: false, bookShown: false };
    case "tick": {
      if (st.phase !== "write") return st;
      const next = st.done + 1;
      // Section 6 needs one more answer from the user before it can be written.
      if (next === 5 && st.follow === null) return { ...st, done: next, phase: "wait" };
      if (next >= TOTAL) return { ...st, done: TOTAL, phase: "done" };
      return { ...st, done: next };
    }
    case "follow":
      return { ...st, follow: a.value, phase: "write" };
    case "note":
      return { ...st, notes: [...st.notes, a.value], text: "" };
    case "egg":
      return { ...st, eggs: [...st.eggs, a.egg], text: "" };
    case "restart":
      return { ...st, eggs: [], step: 3, answers: [...DEMO_ANSWERS], editing: null, phase: "ask", done: 0, follow: null, notes: [], peek: null, book: false, bookShown: false };
    case "set":
      return { ...st, ...a.patch };
    case "openTab": {
      const tabs = st.tabs.some((t) => t.id === a.tab.id) ? st.tabs : [...st.tabs, a.tab];
      return { ...st, tabs, active: a.tab.id, showPast: false };
    }
    case "closeTab": {
      const rest = st.tabs.filter((t) => t.id !== a.id);
      if (!rest.length) return st;
      return { ...st, tabs: rest, active: st.active === a.id ? rest[0].id : st.active };
    }
  }
}

/** Small-talk easter eggs. Returns null for a normal message. */
export function eggFor(v: string): Egg | null {
  if (/\b(coffee|lunch|tea|tired)\b/i.test(v)) return { said: v, img: "/assets/hard-hat-eyes.svg", text: "Site coffee is terrible. Have a hard hat instead, then back to it." };
  if (/^(hi|hey|hello|yo)\b/i.test(v)) return { said: v, img: "/assets/peace-glove.png", text: "Hey. Glove on, let us get this SR done." };
  if (/\b(thanks|thank you|cheers)\b/i.test(v)) return { said: v, img: "/assets/smiley.svg", text: "Anytime." };
  return null;
}
