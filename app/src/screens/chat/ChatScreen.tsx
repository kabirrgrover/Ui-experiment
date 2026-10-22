import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "../../components/AppHeader";
import { DEFAULT_SCENARIO, SCENARIOS } from "../../data/scenarios";
import { navigate, useQuery } from "../../lib/router";
import { ChatSession } from "./ChatSession";
import { PastChatsCrane } from "./PastChatsCrane";
import { INITIAL_TABS, type SessionInit, type Tab } from "./state";
import { WorkspaceTabs } from "./WorkspaceTabs";
import "./chat.css";

/** Window event the header's "New chat" fires while you're already on /chat. */
export const NEW_CHAT_EVENT = "db:newchat";

/** URL params that pin the first SR tab to a fixed state (for screenshots) and stop autoplay. */
const PINNING = ["state", "panel", "book", "figure", "past"];

let seq = 0;
const newTab = (): Tab => { ++seq; return { id: `new-${seq}`, doc: "SR", title: seq > 1 ? `New chat ${seq}` : "New chat", kind: "live", scenario: "geotech" }; };

interface Boot { tabs: Tab[]; active: string; autoplay: boolean; pinned: boolean }

function boot(q: URLSearchParams): Boot {
  const pinned = PINNING.some((k) => q.has(k));
  const autoplay = !pinned && q.get("autoplay") !== "0";
  let tabs = [...INITIAL_TABS];
  const idx = Number(q.get("tab"));
  let active = tabs[Number.isInteger(idx) && idx >= 0 && idx < tabs.length ? idx : 0].id;
  if (q.get("new") === "1" || q.has("q") || q.has("type")) {
    const t = newTab();
    tabs = [...tabs, t];
    active = t.id;
  }
  return { tabs, active, autoplay, pinned };
}

/**
 * The chat workspace. Each tab is its own session (see ChatSession):
 * three SR demos that play themselves, two MR tabs (titles only for now),
 * and a live run you answer yourself. "+" or New chat opens another live tab.
 */
export default function ChatScreen() {
  const query = useQuery();
  const [{ tabs, active, autoplay, pinned }, setBoot] = useState(() => boot(query));
  const [showPast, setShowPast] = useState(query.get("past") === "1");
  const [running, setRunning] = useState<Set<string>>(() => new Set());

  const pick = (id: string) => setBoot((b) => ({ ...b, active: id }));
  const open = useCallback((tab: Tab) => {
    setBoot((b) => ({ ...b, tabs: b.tabs.some((t) => t.id === tab.id) ? b.tabs : [...b.tabs, tab], active: tab.id }));
    setShowPast(false);
  }, []);
  const addNew = useCallback(() => open(newTab()), [open]);
  const close = (id: string) => {
    setBoot((b) => {
      const i = b.tabs.findIndex((t) => t.id === id);
      const rest = b.tabs.filter((t) => t.id !== id);
      const nextActive = b.active !== id ? b.active : (rest[Math.min(i, rest.length - 1)]?.id ?? "");
      return { ...b, tabs: rest, active: nextActive };
    });
  };
  const onRunning = useCallback((id: string, on: boolean) => {
    setRunning((s) => {
      if (s.has(id) === on) return s;
      const n = new Set(s);
      if (on) n.add(id); else n.delete(id);
      return n;
    });
  }, []);

  // Header "New chat" while already here opens another tab instead of navigating.
  useEffect(() => {
    window.addEventListener(NEW_CHAT_EVENT, addNew);
    return () => window.removeEventListener(NEW_CHAT_EVENT, addNew);
  }, [addNew]);

  // Drop ?new=1 so a refresh doesn't keep adding tabs.
  useEffect(() => {
    if (query.get("new") === "1") window.history.replaceState(null, "", "/chat");
  }, [query]);

  const pastToggle = (
    <button type="button" aria-expanded={showPast} aria-controls="ch-past" onClick={() => setShowPast((v) => !v)}>
      <img src="/assets/icon-chat.svg" alt="" />Past chats
    </button>
  );

  const initFor = (tab: Tab, index: number): SessionInit => ({
    sc: SCENARIOS[tab.scenario ?? ""] ?? DEFAULT_SCENARIO,
    kind: tab.kind,
    autoplay: autoplay && tab.kind === "demo",
    query: pinned && index === 0 ? query : undefined,
  });

  return (
    <div className="ch-page">
      <AppHeader pastChats={pastToggle} />
      {showPast && <PastChatsCrane onOpen={open} />}
      <WorkspaceTabs tabs={tabs} active={active} running={running} onPick={pick} onClose={close} onNew={addNew} />

      <main className="ch-main">
        {tabs.length === 0 && (
          <div className="ch-msg ch-saved ch-empty">
            <h1 className="ch-saved__title">no chats open</h1>
            <div className="ch-saved__body">Start a new one, or pick a past chat from the crane.</div>
            <button type="button" className="ch-box ch-box--primary ch-saved__open" onClick={addNew}>start a new chat</button>
          </div>
        )}
        {tabs.map((tab, i) =>
          tab.kind === "saved" ? (
            <SavedTab key={tab.id} tab={tab} active={tab.id === active} />
          ) : (
            <ChatSession key={tab.id} tab={tab} active={tab.id === active} init={initFor(tab, i)} onRunning={onRunning} />
          ),
        )}
      </main>
    </div>
  );
}

/** Titles-only tabs: MRs (not drafted by the POC yet) and past chats. */
function SavedTab({ tab, active }: { tab: Tab; active: boolean }) {
  const isMR = tab.doc === "MR";
  return (
    <section id={`ch-panel-${tab.id}`} role="tabpanel" aria-labelledby={`ch-tab-${tab.id}`} hidden={!active} className="ch-msg ch-saved">
      <img className="ch-saved__sticker" src={isMR ? "/assets/hello-mr.svg" : tab.doc === "PEP" ? "/assets/hello-pep.svg" : "/assets/hello-sr.svg"} alt="" />
      <h1 className="ch-saved__title">{tab.doc} · {tab.title}</h1>
      {isMR ? (
        <div className="ch-saved__body">MR drafting is coming soon. This tab holds the title so you can see where it will live.</div>
      ) : (
        <>
          <div className="ch-saved__body">Welcome back. This one is saved. Ask me to change anything, or open the document.</div>
          <a href="/canvas" onClick={(e) => { e.preventDefault(); navigate("/canvas"); }} className="ch-box ch-saved__open">open the document</a>
        </>
      )}
    </section>
  );
}
