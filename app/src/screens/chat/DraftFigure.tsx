import type { CSSProperties } from "react";

/** Layers come from figures/crane and figures/plotter (anatomy kit builds). Same viewBox, stacked. */
const STOREYS = Array.from({ length: 11 }, (_, i) => `/assets/crane-storey-${i}.svg`);
const PAGES = Array.from({ length: 11 }, (_, i) => `/assets/plotter-page-${i}.svg`);

const layer = (on: boolean, drop: number): CSSProperties => ({
  opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : drop}%)`,
});

export type FigureName = "crane" | "plotter";

/**
 * The drafting-wait figure. `set` = finished sections (0..11).
 * Crane: one storey lands per section, the hoist climbs 2.385% per storey and the rope shortens.
 * Plotter: gantry and carriage sweep, rules ink in, one page drops into the tray per section.
 */
export function DraftFigure({ name, set }: { name: FigureName; set: number }) {
  const n = Math.min(11, set);
  if (name === "crane") {
    const live = n < 11;
    return (
      <div role="img" aria-label={`A tower crane sets one storey for each finished section. ${n} of 11 storeys set.`} className="ch-fig ch-fig--crane">
        <img src="/assets/crane-back.svg" alt="" className="ch-layer" />
        {STOREYS.map((src, i) => <img key={src} src={src} alt="" className="ch-layer ch-layer--part" style={layer(i < n, -4)} />)}
        <img src="/assets/crane-top.svg" alt="" className="ch-layer" />
        <div className="ch-rope" style={{ opacity: live ? 1 : 0, height: `${((136.42 - 12.401 * n) / 5.2).toFixed(2)}%` }} />
        <div className="ch-bob ch-layer">
          <img src="/assets/crane-hoist.svg" alt="" className="ch-layer ch-hoist" style={{ opacity: live ? 1 : 0, transform: `translateY(${(-2.385 * n).toFixed(2)}%)` }} />
        </div>
      </div>
    );
  }
  return (
    <div role="img" aria-label={`A drafting plotter draws the document. ${n} of 11 pages in the tray.`} className="ch-fig ch-fig--plotter">
      <img src="/assets/plotter-back.svg" alt="" className="ch-layer" />
      <img src="/assets/plotter-rules.svg" alt="" className="ch-layer ch-ink" />
      <img src="/assets/plotter-tray.svg" alt="" className="ch-layer" />
      {PAGES.map((src, i) => <img key={src} src={src} alt="" className="ch-layer ch-layer--part" style={layer(i < n, -3)} />)}
      <div className="ch-gantry ch-layer">
        <img src="/assets/plotter-gantry.svg" alt="" className="ch-layer" />
        <img src="/assets/plotter-carriage.svg" alt="" className="ch-layer ch-carriage" />
      </div>
      <img src="/assets/plotter-front.svg" alt="" className="ch-layer" />
    </div>
  );
}

/** Small finished crane for the done header. */
export function CraneThumb() {
  return (
    <div aria-hidden="true" className="ch-thumb">
      <img src="/assets/crane-back.svg" alt="" className="ch-layer" />
      {STOREYS.map((src) => <img key={src} src={src} alt="" className="ch-layer" />)}
      <img src="/assets/crane-top.svg" alt="" className="ch-layer" />
    </div>
  );
}
