import { useEffect, type CSSProperties } from "react";
import type { Tab } from "./state";

/** Pastel tint per tint key: [selected, idle]. */
const TINT: Record<string, [string, string]> = {
  geo: ["#f5da8c", "#fbf0cd"], rebar: ["#b5e3f7", "#def2fb"], bridge: ["#ffd5de", "#ffecf0"],
  sub: ["#c6ee9c", "#e5f7d2"], pour: ["#f8c98d", "#fce6c9"], lift: ["#efb5f4", "#f8e1fa"],
};
const CYCLE = Object.keys(TINT);

interface Props {
  tabs: Tab[];
  active: string;
  /** Tab ids whose demo is still playing. */
  running: Set<string>;
  onPick: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

/** In-app tabs for open chats, like browser tabs. Every tab is its own session. */
export function WorkspaceTabs({ tabs, active, running, onPick, onClose, onNew }: Props) {
  // Keep the active tab in view when a new one opens off the end of the strip.
  useEffect(() => {
    document.getElementById(`ch-tab-${active}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, tabs.length]);
  return (
    <div className="ch-gutter">
      <div role="tablist" aria-label="Open chats" className="ch-tabs">
        {tabs.map((t, i) => {
          const sel = t.id === active;
          const [on, idle] = TINT[t.tint ?? ""] ?? TINT[CYCLE[i % CYCLE.length]];
          const style: CSSProperties = { background: sel ? on : idle, borderBottomColor: sel ? on : undefined };
          const dot = t.kind === "live" ? "live" : running.has(t.id) ? "run" : null;
          return (
            <span key={t.id} className={"ch-tab" + (sel ? " is-sel" : "")} style={style}>
              <button type="button" role="tab" id={`ch-tab-${t.id}`} aria-selected={sel} aria-controls={`ch-panel-${t.id}`} onClick={() => onPick(t.id)} className="ch-tab__btn">
                {dot && <span className={`ch-tab__dot is-${dot}`} aria-label={dot === "live" ? "live run" : "demo running"} />}
                <span className="ch-tab__doc">{t.doc}</span>
                <span className="ch-tab__title">{t.title}</span>
              </button>
              <button type="button" className="ch-x" aria-label={`Close ${t.title}`} onClick={() => onClose(t.id)}>×</button>
            </span>
          );
        })}
        <button type="button" onClick={onNew} aria-label="New chat" title="New chat" className="ch-tabs__new">+</button>
      </div>
    </div>
  );
}
