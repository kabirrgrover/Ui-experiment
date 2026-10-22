import { useLayoutEffect, useRef } from "react";

export const ASK_OPTS = ["Rewrite it clearer", "Make it shorter", "Add a spec reference", "Explain this to me"] as const;

export function answerFor(opt: string) {
  return opt === "Explain this to me"
    ? "This sets the max borehole depth. 20 m clears the footing pressure bulb with margin."
    : `Done: ${opt.toLowerCase()} in Rev B. Shown as a tracked change.`;
}

/** Lives inside the zoomed world; counter-scales so it stays readable, and nudges itself back inside the viewport. */
export function AskPopover({ x, y, onPick, onClose }: { x: number; y: number; onPick: (opt: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const vp = el?.closest(".cv-vp");
    if (!el || !vp) return;
    el.style.setProperty("--cv-shift", "0px");
    const r = el.getBoundingClientRect(), v = vp.getBoundingClientRect();
    const over = r.right - (v.right - 16);
    if (over > 0) el.style.setProperty("--cv-shift", `${-Math.min(over, r.width)}px`);
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [x, y]);
  return (
    <div ref={ref} className="cv-askpop" style={{ left: x, top: y }} onPointerDown={(e) => e.stopPropagation()}>
      <div className="cv-askpop__card" role="dialog" aria-label="Ask docbuilder about this">
        <div className="cv-askpop__title">ask docbuilder about this</div>
        <div className="cv-askpop__opts">
          {ASK_OPTS.map((o) => (
            <button key={o} type="button" className="cv-chip" onClick={() => onPick(o)}>{o}</button>
          ))}
        </div>
        <button type="button" className="cv-askpop__dismiss" onClick={onClose}>dismiss</button>
      </div>
    </div>
  );
}
