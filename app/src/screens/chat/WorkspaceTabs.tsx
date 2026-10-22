import type { CSSProperties } from "react";
import { linkTo } from "../../lib/router";
import type { Tab } from "./state";

/** Pastel tint per open doc: [selected, idle]. */
const TINT: Record<string, [string, string]> = {
  geo: ["#f5da8c", "#fbf0cd"], rebar: ["#b5e3f7", "#def2fb"], bridge: ["#ffd5de", "#ffecf0"],
  sub: ["#c6ee9c", "#e5f7d2"], pour: ["#f8c98d", "#fce6c9"], lift: ["#efb5f4", "#f8e1fa"],
};

interface Props { tabs: Tab[]; active: string; onPick: (id: string) => void; onClose: (id: string) => void }

/** In-app tabs for open documents, like browser tabs. */
export function WorkspaceTabs({ tabs, active, onPick, onClose }: Props) {
  return (
    <div className="ch-gutter">
      <div role="tablist" aria-label="Open documents" className="ch-tabs">
        {tabs.map((t) => {
          const sel = t.id === active;
          const [on, idle] = TINT[t.id] ?? TINT.geo;
          const style: CSSProperties = { background: sel ? on : idle, borderBottomColor: sel ? on : undefined };
          return (
            <span key={t.id} className={"ch-tab" + (sel ? " is-sel" : "")} style={style}>
              <button type="button" role="tab" aria-selected={sel} onClick={() => onPick(t.id)} className="ch-tab__btn">
                <span className="ch-tab__doc">{t.doc}</span>
                <span className="ch-tab__title">{t.title}</span>
              </button>
              <button type="button" className="ch-x" aria-label={`Close ${t.title}`} onClick={() => onClose(t.id)}>×</button>
            </span>
          );
        })}
        <a href="/" onClick={linkTo("/")} aria-label="New chat" className="ch-tabs__new">+</a>
      </div>
    </div>
  );
}
