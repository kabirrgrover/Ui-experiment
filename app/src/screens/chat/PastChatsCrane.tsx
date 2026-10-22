import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { Tab } from "./state";

interface Past extends Tab { num: string; when: string; summary: string }

const PAST: Past[] = [
  { id: "bridge", doc: "SR", title: "Bridging, East gate", num: "SR-24-0131", when: "3 days ago", summary: "Temporary bridge over the drainage cut at the east gate. 40 t rating, 6-week hire. Approved." },
  { id: "rebar", doc: "MR", title: "Rebar, level 2", num: "MR-24-0087", when: "yesterday", summary: "Bars for the level 2 slab, cut and bent. Waiting on review from structures." },
  { id: "sub", doc: "PEP", title: "Substation upgrade", num: "PEP-24-0009", when: "last week", summary: "Execution plan for the substation upgrade: phases, outages and the team." },
  { id: "pour", doc: "SR", title: "Concrete testing, pour 4", num: "SR-24-0122", when: "2 weeks ago", summary: "Slump and cylinder tests for pour 4. 28-day results due next week." },
  { id: "lift", doc: "SR", title: "Elevator, tower B", num: "SR-24-0104", when: "last month", summary: "Supply and install of two passenger lifts in tower B. Draft, not sent." },
];
const BASE_X = [210, 400, 590, 780, 970];
const CABLE = [50, 84, 64, 96, 58];
const W = 132;
/** Hold this long before a press turns into a drag; a quick click opens the chat. */
const HOLD_MS = 220;

interface Drag { i: number; dx: number; dy: number; vx: number }
interface Press { i: number; x: number; y: number; lx: number; armed: boolean; timer: number }

/** Past chats hang off a tower crane jib. Hover flips a card to its summary, click opens it in a tab,
 *  hold and drag moves a card and its neighbours bump out of the way. */
export function PastChatsCrane({ onOpen }: { onOpen: (tab: Tab) => void }) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const press = useRef<Press | null>(null);
  useEffect(() => () => { if (press.current) clearTimeout(press.current.timer); }, []);

  const down = (i: number) => (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget, pid = e.pointerId;
    const timer = window.setTimeout(() => {
      try { el.setPointerCapture(pid); } catch { /* pointer already gone */ }
      if (press.current) press.current.armed = true;
      setDrag({ i, dx: 0, dy: 0, vx: 0 });
    }, HOLD_MS);
    press.current = { i, x: e.clientX, y: e.clientY, lx: e.clientX, armed: false, timer };
  };
  const move = (i: number) => (e: PointerEvent<HTMLDivElement>) => {
    const pr = press.current;
    if (!pr || pr.i !== i) return;
    if (!pr.armed) {
      if (Math.abs(e.clientX - pr.x) + Math.abs(e.clientY - pr.y) > 8) { clearTimeout(pr.timer); press.current = null; }
      return;
    }
    const vx = e.clientX - pr.lx;
    pr.lx = e.clientX;
    setDrag({ i, dx: e.clientX - pr.x, dy: Math.max(-30, Math.min(30, e.clientY - pr.y)), vx });
  };
  const up = (i: number) => () => {
    const pr = press.current;
    press.current = null;
    if (pr) clearTimeout(pr.timer);
    if (pr && pr.i === i && !pr.armed) { onOpen(PAST[i]); return; }
    setDrag(null);
  };
  const key = (i: number) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(PAST[i]); }
  };

  return (
    <section id="ch-past" aria-label="Past chats" className="ch-crane">
      <div className="ch-crane__scroll">
        <div className="ch-crane__rig">
          <svg aria-hidden="true" width="1180" height="330" viewBox="0 0 1180 330" className="ch-crane__jib">
            <g fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M70 330 L70 46 M90 330 L90 46" />
              <path d="M70 320 L90 300 L70 280 L90 260 L70 240 L90 220 L70 200 L90 180 L70 160 L90 140 L70 120 L90 100 L70 80 L90 60" />
              <path d="M40 46 L1160 46 M90 34 L1160 46 M40 46 L80 6 L120 46" />
              <path d={"M120 46 " + Array.from({ length: 52 }, (_, k) => `L${140 + k * 20} ${k % 2 ? 46 : 34}`).join(" ")} />
              <path d="M80 6 L1160 34" />
              <rect x="94" y="50" width="26" height="22" rx="2" />
              <path d="M8 46 L40 46 L40 60 L8 60 Z" />
            </g>
          </svg>
          {PAST.map((p, i) => {
            const dragging = drag?.i === i;
            let dx = 0, dy = 0, rot = 0;
            if (drag && dragging) { dx = drag.dx; dy = drag.dy; rot = Math.max(-18, Math.min(18, -drag.vx * 0.6)); }
            else if (drag) {
              const cx = BASE_X[drag.i] + drag.dx, gap = Math.abs(cx - BASE_X[i]), need = W + 14;
              if (gap < need) { dx = (BASE_X[i] >= cx ? 1 : -1) * (need - gap); rot = -dx * 0.12; }
            }
            const pos: CSSProperties = {
              left: BASE_X[i] - W / 2, width: W, zIndex: dragging ? 5 : 1, cursor: dragging ? "grabbing" : "pointer",
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              transition: dragging ? "none" : "transform 620ms cubic-bezier(.34,1.56,.64,1)",
            };
            return (
              <div key={p.id} className={"ch-hang" + (dragging ? " is-drag" : "")} style={pos} tabIndex={0} role="button"
                aria-label={`${p.doc} ${p.title}, ${p.when}. ${p.summary} Press Enter to open in a new tab.`}
                onPointerDown={down(i)} onPointerMove={move(i)} onPointerUp={up(i)} onPointerCancel={up(i)} onKeyDown={key(i)}>
                <div className="ch-swing" style={{ animationDelay: `-${i * 1.1}s`, animationDuration: `${4.6 + i * 0.5}s` }}>
                  <span aria-hidden="true" className="ch-cable" style={{ height: CABLE[i] }} />
                  <svg aria-hidden="true" width="18" height="20" viewBox="0 0 18 20" className="ch-hook"><path d="M9 0 V8 M9 8 C 2 8, 2 18, 9 18 C 14 18, 15 13, 13 11" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <div className="ch-flip">
                    <div className="ch-flip__in">
                      <div className="ch-face">
                        <span className="ch-face__kicker">{p.doc}</span>
                        <span className="ch-face__title">{p.title}</span>
                        <span className="ch-face__meta ch-num">{p.num}</span>
                        <span className="ch-face__meta ch-face__meta--last">{p.when}</span>
                      </div>
                      <div className="ch-face ch-face--back">
                        <span className="ch-face__kicker">SUMMARY</span>
                        <span className="ch-face__summary">{p.summary}</span>
                        <span className="ch-face__open">open ↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ch-crane__foot">
        <span className="ch-crane__label">past chats</span>
        <span>Hover to read · click to open in a tab · hold and drag to move</span>
      </div>
    </section>
  );
}
