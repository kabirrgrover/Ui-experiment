export function ZoomControls({ pct, onIn, onOut, onFit }: { pct: number; onIn: () => void; onOut: () => void; onFit: () => void }) {
  return (
    <div className="cv-zoom" onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="cv-mini" aria-label="Zoom out" onClick={onOut}>−</button>
      <button type="button" className="cv-mini cv-mini--pct" aria-label="Zoom to fit" onClick={onFit}>{pct}%</button>
      <button type="button" className="cv-mini" aria-label="Zoom in" onClick={onIn}>+</button>
    </div>
  );
}
