import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import type { DraftPhase, Source } from "../../data/geotechSR";
import { DEFAULT_SCENARIO, type Scenario } from "../../data/scenarios";
import { useReducedMotion, useStreamedText } from "./useMotion";
import "./ThinkingPanel.css";

export interface ThinkingPanelProps {
  open: boolean;
  onClose: () => void;
  phase: DraftPhase;
  done: number;
  answers: (string | undefined)[];
  /** Called when the user clicks a section citation; chat scrolls the outline to it. */
  onJumpToSection?: (sectionIndex: number) => void;
  /** Which SR's reasoning, sources and checks to show. Defaults to the geotech demo. */
  scenario?: Scenario;
}

type Tab = "thinking" | "sources" | "checks";
type SourceState = "later" | "queued" | "reading" | "used";
type CheckState = "queued" | "checking" | "pass";

/** "§2, §10" → [{label:"§2", index:1}, …]; "App. B" jumps to the appendices. */
function citations(sec: string, sectionCount: number): { label: string; index: number }[] {
  return sec.split(",").map((raw) => {
    const label = raw.trim();
    const m = label.match(/§(\d+)/);
    return { label, index: m ? Number(m[1]) - 1 : sectionCount - 1 };
  });
}

function sourceState(s: Source, phase: DraftPhase, done: number): SourceState {
  if (phase === "ask") return "later";
  if (phase === "done" || done > s.at) return "used";
  if (done === s.at) return "reading";
  return "queued";
}

const STATE_LABEL: Record<SourceState, string> = { later: "will check", queued: "queued", reading: "reading…", used: "used" };

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name: --x");
const supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/* ------------------------------------------------------------------ */

export function ThinkingPanel({ open, onClose, phase, done, answers, onJumpToSection, scenario = DEFAULT_SCENARIO }: ThinkingPanelProps): React.JSX.Element {
  const { sources: SOURCES, thinking: THINKING, nowLines: NOW_LINES, checks: CHECKS } = scenario;
  const [tab, setTab] = useState<Tab>("thinking");
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [hoverSource, setHoverSource] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [preview, setPreview] = useState<Source | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const uid = useId();
  const reduced = useReducedMotion();

  const sections = useMemo(() => scenario.outline(answers), [scenario, answers]);
  const started = phase !== "ask";
  const finished = phase === "done";

  const stepCount = !started ? 0 : finished ? THINKING.length : Math.min(THINKING.length, done + 1);
  const steps = THINKING.slice(0, stepCount);
  const currentStep = started && !finished ? stepCount - 1 : -1;

  const states = SOURCES.map((s) => sourceState(s, phase, done));
  const usedCount = states.filter((s) => s === "used").length;
  const checkStates: CheckState[] = CHECKS.map((c) => (!started ? "queued" : finished || done > c.at ? "pass" : done === c.at ? "checking" : "queued"));
  const passCount = checkStates.filter((c) => c === "pass").length;

  const nowLine = !started ? "waiting for your answers" : finished ? "draft ready · every source logged" : phase === "wait" ? scenario.followUp.waitLine : NOW_LINES[Math.min(done, NOW_LINES.length - 1)];

  // Focus the close button when the drawer opens; Esc closes it.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
      return () => window.clearTimeout(id);
    }
    hidePreview();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Flash a source card after jumping to it from a step chip.
  useEffect(() => {
    if (!flash) return;
    const el = document.getElementById(`${uid}-src-${flash}`);
    el?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    const id = window.setTimeout(() => setFlash(null), 1400);
    return () => window.clearTimeout(id);
  }, [flash, uid, reduced]);

  function showPreview(el: HTMLElement, s: Source) {
    const pop = popRef.current;
    if (!pop) return;
    anchorRef.current?.style.removeProperty("anchor-name");
    anchorRef.current = el;
    el.style.setProperty("anchor-name", "--th-prev");
    setPreview(s);
    if (!supportsAnchor) {
      // Fallback: place it under the chip by hand, flipping above near the bottom edge.
      const r = el.getBoundingClientRect();
      const below = r.bottom + 180 < window.innerHeight;
      pop.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - 300))}px`;
      pop.style.top = below ? `${r.bottom + 8}px` : "";
      pop.style.bottom = below ? "" : `${window.innerHeight - r.top + 8}px`;
    }
    if (supportsPopover && !pop.matches(":popover-open")) pop.showPopover();
    pop.dataset.open = "true";
  }
  function hidePreview() {
    const pop = popRef.current;
    if (!pop) return;
    if (supportsPopover && pop.matches(":popover-open")) pop.hidePopover();
    pop.dataset.open = "false";
    anchorRef.current?.style.removeProperty("anchor-name");
    anchorRef.current = null;
  }

  const chipEvents = (s: Source): ChipEvents => ({
    onPointerEnter: (e: PointerEvent<HTMLElement>) => { setHoverSource(s.id); if (e.pointerType === "mouse") showPreview(e.currentTarget, s); },
    onPointerLeave: () => { setHoverSource(null); hidePreview(); },
    onFocus: (e: FocusEvent<HTMLElement>) => { setHoverSource(s.id); if (e.currentTarget.matches(":focus-visible")) showPreview(e.currentTarget, s); },
    onBlur: () => { setHoverSource(null); hidePreview(); },
  });

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "thinking", label: "Thinking", count: String(steps.length) },
    { id: "sources", label: "Sources", count: `${usedCount}/${SOURCES.length}` },
    { id: "checks", label: "Checks", count: `${passCount}/${CHECKS.length}` },
  ];

  function onTabKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const order: Tab[] = ["thinking", "sources", "checks"];
    const i = order.indexOf(tab);
    let next: Tab | null = null;
    if (e.key === "ArrowRight") next = order[(i + 1) % 3];
    if (e.key === "ArrowLeft") next = order[(i + 2) % 3];
    if (e.key === "Home") next = order[0];
    if (e.key === "End") next = order[2];
    if (next) { e.preventDefault(); setTab(next); document.getElementById(`${uid}-tab-${next}`)?.focus(); }
  }

  return (
    <div className="th-layer">
      <aside
        id="db-think"
        className="th-drawer"
        data-open={open}
        aria-label="Thinking and sources"
        aria-hidden={!open}
        inert={!open}
        onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
      >
        <span className="th-grip" aria-hidden="true" />
        <header className="th-head">
          <div className="th-titlerow">
            <h2 className="th-title">how I'm building this</h2>
            <CoverageRing used={usedCount} total={SOURCES.length} />
            <button ref={closeRef} type="button" className="th-x" onClick={onClose} aria-label="Close thinking and sources">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5.5 15 14.6M14.6 5 5.4 15" /></svg>
            </button>
          </div>
          <p className="th-now" data-live={started && !finished} aria-live="polite">
            <span className="th-now__dot" aria-hidden="true" />
            <span className="th-now__text">{nowLine}</span>
          </p>
          <div role="tablist" aria-label="Panel sections" className="th-tabs" onKeyDown={onTabKey}>
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`${uid}-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                aria-controls={`${uid}-pane-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                className="th-tab"
                onClick={() => setTab(t.id)}
              >
                {t.label}<span className="th-tab__n">{t.count}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="th-scroll">
          {/* ---------------- Thinking ---------------- */}
          <section id={`${uid}-pane-thinking`} role="tabpanel" aria-labelledby={`${uid}-tab-thinking`} hidden={tab !== "thinking"} className="th-pane">
            {!started ? (
              <EmptyNote>I'll show each step of my reasoning here, and the sources it leans on, as soon as you've answered the questions.</EmptyNote>
            ) : (
              <ol className="th-steps">
                {steps.map((s, i) => {
                  const linked = hoverSource !== null && (s.uses ?? []).includes(hoverSource);
                  return (
                    <ThoughtRow
                      key={s.head}
                      index={i}
                      head={s.head}
                      body={s.body}
                      current={i === currentStep}
                      waiting={phase === "wait" && i === currentStep}
                      linked={linked}
                      hovered={hoverStep === i}
                      onHover={(on) => setHoverStep(on ? i : null)}
                      sources={(s.uses ?? []).map((id) => SOURCES.find((x) => x.id === id)).filter((x): x is Source => !!x)}
                      chipEvents={chipEvents}
                      onChip={(src) => { hidePreview(); setTab("sources"); setFlash(src.id); }}
                      hoverSource={hoverSource}
                    />
                  );
                })}
              </ol>
            )}
            {finished && <p className="th-aside">that's everything. ask me why on any line in the canvas.</p>}
          </section>

          {/* ---------------- Sources ---------------- */}
          <section id={`${uid}-pane-sources`} role="tabpanel" aria-labelledby={`${uid}-tab-sources`} hidden={tab !== "sources"} className="th-pane">
            <ul className="th-sources">
              {SOURCES.map((s, i) => {
                const st = states[i];
                const usedBy = THINKING.map((t, k) => ((t.uses ?? []).includes(s.id) ? k + 1 : 0)).filter(Boolean);
                const lit = (hoverStep !== null && (THINKING[hoverStep]?.uses ?? []).includes(s.id)) || hoverSource === s.id || flash === s.id;
                return (
                  <li
                    key={s.id}
                    id={`${uid}-src-${s.id}`}
                    className="th-src"
                    data-state={st}
                    data-lit={lit}
                    onPointerEnter={() => setHoverSource(s.id)}
                    onPointerLeave={() => setHoverSource(null)}
                  >
                    <div className="th-src__top">
                      <span className="th-kind" data-kind={s.kind}>{s.kind}</span>
                      {st !== "used" && <span className="th-src__state">{STATE_LABEL[st]}</span>}
                      {st === "used" && <span key="stamp" className="th-stamp" aria-hidden="true">used</span>}
                    </div>
                    <p className="th-src__title">{s.title}</p>
                    <p className="th-src__why">{s.why}</p>
                    <div className="th-src__foot">
                      {st === "used" || finished ? (
                        <span className="th-cites">
                          <span className="th-cites__lbl">used in</span>
                          {citations(s.sec, sections.length).map((c) => (
                            <button key={c.label} type="button" className="th-cite" onClick={() => onJumpToSection?.(c.index)} aria-label={`Jump to ${c.label}, ${sections[c.index]?.title ?? ""}`}>
                              {c.label}
                            </button>
                          ))}
                        </span>
                      ) : (
                        <span className="th-cites__lbl">{st === "reading" ? "reading now" : "for " + s.sec}</span>
                      )}
                      {usedBy.length > 0 && <span className="th-usedby">step {usedBy.join(", ")}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ---------------- Checks ---------------- */}
          <section id={`${uid}-pane-checks`} role="tabpanel" aria-labelledby={`${uid}-tab-checks`} hidden={tab !== "checks"} className="th-pane">
            {!started && <EmptyNote>Checks run while I write. Each one ticks when the section it covers is done.</EmptyNote>}
            <ul className="th-checks">
              {CHECKS.map((c, i) => (
                <li key={c.text} className="th-check" data-state={checkStates[i]}>
                  <span className="th-check__mark" aria-hidden="true">
                    {checkStates[i] === "pass" ? (
                      <svg viewBox="0 0 20 20"><path d="M4 10.5 8.2 14.5 16 5.2" /></svg>
                    ) : checkStates[i] === "checking" ? <span className="th-spin" /> : null}
                  </span>
                  <span>
                    <span className="th-check__text">{c.text}</span>
                    <span className="th-check__detail">
                      {checkStates[i] === "pass" ? c.detail : checkStates[i] === "checking" ? "checking…" : `runs with §${c.at + 1}`}
                    </span>
                  </span>
                  <span className="sr-only">{checkStates[i] === "pass" ? "passed" : checkStates[i]}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>

      {/* Source preview: popover in the top layer, anchored to the hovered chip where CSS anchor positioning exists. */}
      <div ref={popRef} className="th-pop" data-anchor={supportsAnchor} data-open="false" {...(supportsPopover ? { popover: "manual" } : {})} role="tooltip">
        {preview && (
          <>
            <span className="th-kind" data-kind={preview.kind}>{preview.kind}</span>
            <strong className="th-pop__title">{preview.title}</strong>
            <span className="th-pop__why">{preview.why}</span>
            <span className="th-pop__sec">used in {preview.sec}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface ChipEvents {
  onPointerEnter: (e: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onFocus: (e: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
}

interface ThoughtRowProps {
  index: number;
  head: string;
  body: string;
  current: boolean;
  waiting: boolean;
  linked: boolean;
  hovered: boolean;
  hoverSource: string | null;
  sources: Source[];
  onHover: (on: boolean) => void;
  onChip: (s: Source) => void;
  chipEvents: (s: Source) => ChipEvents;
}

function ThoughtRow({ index, head, body, current, waiting, linked, hovered, sources, onHover, onChip, chipEvents, hoverSource }: ThoughtRowProps) {
  const { shown, streaming } = useStreamedText(body, current && !waiting);
  return (
    <li
      className="th-step"
      data-current={current}
      data-waiting={waiting}
      data-linked={linked}
      data-hovered={hovered}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      style={{ "--i": index } as CSSProperties}
    >
      <span className="th-step__dot" aria-hidden="true" />
      <div className="th-step__main">
        <p className="th-step__head">
          {head}
          {waiting && <span className="th-badge">waiting on you</span>}
        </p>
        <p className="th-step__body">
          {shown}
          {current && streaming && <span className="th-caret" aria-hidden="true" />}
          {current && streaming && <span className="sr-only">{body}</span>}
        </p>
        {sources.length > 0 && (!current || !streaming) && (
          <div className="th-leans">
            <svg className="th-connector" viewBox="0 0 30 26" aria-hidden="true"><path d="M3 1 C 3 14, 8 20, 27 21" /><path d="M22 17 27 21 22 24.5" /></svg>
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                className="th-chip"
                data-kind={s.kind}
                data-lit={hovered || hoverSource === s.id}
                onClick={() => onChip(s)}
                aria-label={`${s.kind}: ${s.title}. Show in sources`}
                {...chipEvents(s)}
              >
                <span className="th-chip__k">{s.kind === "PAST SR" ? "SR" : s.kind.slice(0, 3)}</span>
                {short(s.title)}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function short(t: string) {
  const s = t.split(" · ")[0];
  return s.length > 26 ? s.slice(0, 24).trimEnd() + "…" : s;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="th-empty">
      <img src="/assets/hard-hat-eyes.svg" alt="" width="56" height="56" />
      <p>{children}</p>
    </div>
  );
}

/** Hand-drawn ring: a wobbly circle with an ink arc for sources used. */
function CoverageRing({ used, total }: { used: number; total: number }) {
  const pct = total ? (used / total) * 100 : 0;
  return (
    <span className="th-ring" role="img" aria-label={`${used} of ${total} sources used`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path className="th-ring__bg" d="M20 4.2c8.9-.3 15.9 6.6 15.8 15.6-.1 8.8-7.2 16.1-16 16-8.6-.1-15.5-7.4-15.6-15.9C4.1 11.2 11.3 4.5 20 4.2Z" />
        <path className="th-ring__fg" pathLength={100} style={{ strokeDasharray: `${pct} 100`, opacity: used ? 1 : 0 }} d="M20 4.2c8.9-.3 15.9 6.6 15.8 15.6-.1 8.8-7.2 16.1-16 16-8.6-.1-15.5-7.4-15.6-15.9C4.1 11.2 11.3 4.5 20 4.2Z" />
      </svg>
      <span className="th-ring__n">{used}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */

/** The vertical "thinking & sources" tab on the right edge (a pill at the bottom on phones). */
export function ThinkingHandle({ open, onToggle, live }: { open: boolean; onToggle: () => void; live: boolean }): React.JSX.Element {
  return (
    <button
      type="button"
      className="th-handle"
      aria-expanded={open}
      aria-controls="db-think"
      data-live={live}
      data-open={open}
      onClick={onToggle}
    >
      <span className="th-handle__dot" aria-hidden="true" />
      thinking &amp; sources
    </button>
  );
}
