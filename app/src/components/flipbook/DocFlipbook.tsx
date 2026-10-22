import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { DOC_META, Section } from "../../data/geotechSR";
import "./DocFlipbook.css";

export interface DocFlipbookProps {
  open: boolean;
  meta: typeof DOC_META;
  sections: Section[];
  onOpenCanvas: () => void;
  onDownload: () => void;
  onClose: () => void;
  /** Margin notes keyed by section number. Defaults to the geotech demo's notes. */
  margin?: Record<number, string>;
}

interface Leaf { front: ReactNode; back: ReactNode; frontLabel: string; backLabel: string }

/** Margin notes the AI leaves on a couple of pages (keyed by section number). */
const MARGIN: Record<number, string> = {
  4: "contractor confirms the class on site",
  10: "rates left blank on purpose",
};

const RM = "(prefers-reduced-motion: reduce)";

/**
 * "Doc ready" reveal. The cover flips open in 3D, the pages riffle, and the book
 * settles on the contents spread with the next actions underneath.
 */
export function DocFlipbook({ open, meta, sections, onOpenCanvas, onDownload, onClose, margin = MARGIN }: DocFlipbookProps): React.JSX.Element | null {
  if (!open) return null;
  return <Book meta={meta} sections={sections} onOpenCanvas={onOpenCanvas} onDownload={onDownload} onClose={onClose} margin={margin} />;
}

function Book({ meta, sections, onOpenCanvas, onDownload, onClose, margin = MARGIN }: Omit<DocFlipbookProps, "open">) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const reduced = useMemo(() => window.matchMedia(RM).matches, []);
  const totalPages = sections.reduce((a, s) => a + s.pages, 0);

  // Pages after the cover: contents, one per section, an end page.
  const leaves = useMemo<Leaf[]>(() => {
    const pages: { node: ReactNode; label: string }[] = [
      { node: <Contents meta={meta} sections={sections} />, label: "contents" },
      ...sections.map((s) => ({ node: <SectionPage meta={meta} s={s} note={margin[s.n]} />, label: `§${s.n} ${s.title}` })),
      { node: <EndPage meta={meta} sections={sections} total={totalPages} />, label: "end of draft" },
    ];
    const out: Leaf[] = [{ front: <Cover meta={meta} sections={sections} total={totalPages} />, frontLabel: "cover", back: pages[0].node, backLabel: pages[0].label }];
    for (let i = 1; i < pages.length; i += 2) {
      out.push({ front: pages[i].node, frontLabel: pages[i].label, back: pages[i + 1]?.node ?? <Blank />, backLabel: pages[i + 1]?.label ?? "blank" });
    }
    return out;
  }, [meta, sections, totalPages, margin]);
  const n = leaves.length;

  const [f, setF] = useState(reduced ? 1 : 0);
  const [dur, setDur] = useState(900);
  const [turning, setTurning] = useState<Set<number>>(new Set());
  const [settled, setSettled] = useState(reduced);
  const [peek, setPeek] = useState(false);
  const fRef = useRef(f);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };

  const flipTo = useCallback((next: number, ms: number) => {
    const target = Math.max(0, Math.min(n, next));
    const prev = fRef.current;
    if (target === prev) return;
    const lo = Math.min(prev, target), hi = Math.max(prev, target);
    const changed: number[] = [];
    for (let i = lo; i < hi; i++) changed.push(i);
    fRef.current = target;
    setDur(ms);
    setF(target);
    setTurning((t) => new Set([...t, ...changed]));
    timers.current.push(window.setTimeout(() => setTurning((t) => { const c = new Set(t); changed.forEach((i) => c.delete(i)); return c; }), ms + 40));
  }, [n]);

  // Open as a modal; play the reveal.
  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    primaryRef.current?.focus({ preventScroll: true });
    if (reduced) return () => clearTimers();
    later(950, () => flipTo(1, 950));
    const fwdStart = 2050;
    for (let k = 2; k <= n; k++) later(fwdStart + (k - 2) * 120, () => flipTo(k, 420));
    const backStart = fwdStart + (n - 2) * 120 + 650;
    for (let k = n - 1; k >= 1; k--) later(backStart + (n - 1 - k) * 95, () => flipTo(k, 380));
    later(backStart + (n - 2) * 95 + 520, () => setSettled(true));
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userFlip = (dir: 1 | -1) => {
    clearTimers();
    setSettled(true);
    flipTo(fRef.current + dir, 700);
  };

  // Pointer: tap a side to flip, or drag/swipe horizontally.
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => { down.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = down.current; down.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) { userFlip(dx < 0 ? 1 : -1); return; }
    const r = e.currentTarget.getBoundingClientRect();
    userFlip(e.clientX > r.left + r.width / 2 ? 1 : -1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.target instanceof HTMLButtonElement && (e.key === " " || e.key === "Enter")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); userFlip(1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); userFlip(-1); }
    if (e.key === "Home") { e.preventDefault(); clearTimers(); setSettled(true); flipTo(0, 700); }
    if (e.key === "End") { e.preventDefault(); clearTimers(); setSettled(true); flipTo(n, 700); }
  };

  const leftLabel = f > 0 ? leaves[f - 1].backLabel : "";
  const rightLabel = f < n ? leaves[f].frontLabel : "back cover";
  const spreadLabel = [leftLabel, rightLabel].filter(Boolean).join(" · ");

  return (
    <dialog
      ref={dialogRef}
      className="fb-dialog"
      aria-labelledby="fb-title"
      aria-describedby="fb-sub"
      data-reduced={reduced}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onKeyDown={onKeyDown}
    >
      <div className="fb-top">
        <div>
          <h2 id="fb-title" className="fb-title">your SR is ready</h2>
          <p id="fb-sub" className="fb-sub">{meta.id} · {totalPages} pages · {sections.length} sections · saved to Folders</p>
        </div>
        <button type="button" className="fb-x" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5.5 15 14.6M14.6 5 5.4 15" /></svg>
        </button>
      </div>

      <div className="fb-stage">
        <div
          className="fb-book"
          data-closed={f === 0}
          data-end={f === n}
          data-turning={turning.size > 0}
          style={{ "--dur": `${dur}ms` } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="group"
          aria-roledescription="flip book"
          aria-label={`${meta.title}. Showing ${spreadLabel}. Use the arrow keys to turn pages.`}
        >
          <div className="fb-base fb-base--left" aria-hidden="true" />
          <div className="fb-base fb-base--right" aria-hidden="true"><div className="fb-backcover">AI Docbuilder</div></div>
          {leaves.map((leaf, i) => {
            const flipped = i < f;
            const z = flipped ? i + 1 : 2 * n - i;
            const visible = i === f || i === f - 1;
            return (
              <div
                key={i}
                className="fb-leaf"
                data-flipped={flipped}
                data-turn={turning.has(i) ? (flipped ? "fwd" : "back") : undefined}
                data-peek={peek && i === f && f > 0}
                style={{ zIndex: z } as CSSProperties}
                aria-hidden={!visible}
              >
                <div className="fb-face fb-front">{leaf.front}</div>
                <div className="fb-face fb-back">{leaf.back}</div>
              </div>
            );
          })}
          {f < n && (
            <span
              className="fb-corner"
              aria-hidden="true"
              onPointerEnter={() => setPeek(true)}
              onPointerLeave={() => setPeek(false)}
            />
          )}
        </div>
        {settled && (
          <>
            <img className="fb-sticker fb-sticker--a" src="/assets/specd-signed.svg" alt="" />
            <img className="fb-sticker fb-sticker--b" src="/assets/sparkle-orange.svg" alt="" />
          </>
        )}
      </div>

      <div className="fb-bar">
        <div className="fb-nav">
          <button type="button" className="fb-arrow" onClick={() => userFlip(-1)} disabled={f === 0} aria-label="Previous page">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
          </button>
          <span className="fb-where" aria-live="polite">{spreadLabel}</span>
          <button type="button" className="fb-arrow" onClick={() => userFlip(1)} disabled={f === n} aria-label="Next page">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
          </button>
        </div>
        <div className="fb-actions">
          <button type="button" className="db-btn" onClick={onDownload}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" /></svg>
            download
          </button>
          <button type="button" className="db-btn db-btn--primary" onClick={onOpenCanvas} ref={primaryRef}>
            open in canvas
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m0 0-5-5m5 5-5 5" /></svg>
          </button>
        </div>
      </div>
    </dialog>
  );
}

/* ------------------------------ pages ------------------------------ */

function Cover({ meta, sections, total }: { meta: typeof DOC_META; sections: Section[]; total: number }) {
  return (
    <div className="fb-page fb-cover">
      <div className="db-doctag" data-type={meta.type.toLowerCase()}><b>{meta.type}</b><span>service requisition</span></div>
      <h3 className="fb-cover__title">{meta.title.toLowerCase()}</h3>
      <dl className="fb-cover__meta">
        <div><dt>doc no.</dt><dd>{meta.id}</dd></div>
        <div><dt>project</dt><dd>{meta.project}</dd></div>
        <div><dt>revision</dt><dd>A · for review</dd></div>
      </dl>
      <p className="fb-cover__ready">draft ready · {total} pages · {sections.length} sections</p>
      <span className="db-stamp fb-cover__stamp" data-tone="review">draft<small>not for issue</small></span>
      <svg className="fb-cover__doodle" viewBox="0 0 120 60" aria-hidden="true">
        <path d="M4 52h112M14 52V30h22v22M36 40h18v12M54 22h24v30M78 34h16v18M94 44h14v8M60 22l6-12 6 12" />
      </svg>
      <span className="fb-foot">AI Docbuilder</span>
    </div>
  );
}

function Contents({ meta, sections }: { meta: typeof DOC_META; sections: Section[] }) {
  let page = 2;
  return (
    <div className="fb-page">
      <PageHead meta={meta} />
      <h3 className="fb-h">contents</h3>
      <ol className="fb-toc">
        {sections.map((s) => {
          const at = page; page += s.pages;
          return (
            <li key={s.n}><span className="fb-toc__n">{s.n}</span><span className="fb-toc__t">{s.title}</span><span className="fb-toc__p">{at}</span></li>
          );
        })}
      </ol>
      <span className="fb-foot">i</span>
    </div>
  );
}

function SectionPage({ meta, s, note }: { meta: typeof DOC_META; s: Section; note?: string }) {
  // Placeholder text lines, varied but stable per section.
  const widths = Array.from({ length: 9 }, (_, k) => 62 + ((s.n * 37 + k * 23) % 36));
  return (
    <div className="fb-page">
      <PageHead meta={meta} />
      <p className="fb-sec__n">§{s.n}</p>
      <h3 className="fb-sec__t">{s.title}</h3>
      <p className="fb-sec__body">{s.body}</p>
      <div className="fb-lines" aria-hidden="true">
        {widths.map((w, k) => <span key={k} style={{ width: `${k % 4 === 3 ? w - 30 : w}%` }} />)}
      </div>
      {note && <p className="fb-margin">{note}</p>}
      <span className="fb-foot">{s.pages} {s.pages === 1 ? "page" : "pages"}</span>
    </div>
  );
}

function EndPage({ meta, sections, total }: { meta: typeof DOC_META; sections: Section[]; total: number }) {
  return (
    <div className="fb-page fb-end">
      <PageHead meta={meta} />
      <h3 className="fb-h">end of draft</h3>
      <p className="fb-sec__body">{total} pages across {sections.length} sections. Every source is logged in the thinking panel.</p>
      <div className="fb-sign">
        <div><span />prepared by</div>
        <div><span />reviewed by</div>
        <div><span />approved by</div>
      </div>
    </div>
  );
}

function Blank() { return <div className="fb-page" />; }

function PageHead({ meta }: { meta: typeof DOC_META }) {
  return <div className="fb-head"><span>{meta.id}</span><span>{meta.title}</span></div>;
}
