import { PAGES, TOTAL_PAGES } from "./pages";

export function PagesPanel({ onGo }: { onGo: (i: number) => void }) {
  return (
    <nav aria-label="Pages" className="cv-pages">
      <div className="cv-eyebrow">PAGES</div>
      {PAGES.map((p, i) => (
        <button key={p.label} type="button" className="cv-pg" onClick={() => onGo(i)}>
          <span aria-hidden="true" className="cv-pg__thumb">{i + 1}</span>
          <span className="cv-pg__label">{p.label}</span>
        </button>
      ))}
      <div className="cv-pages__foot">Showing {PAGES.length} of {TOTAL_PAGES} pages in this mockup.</div>
    </nav>
  );
}
