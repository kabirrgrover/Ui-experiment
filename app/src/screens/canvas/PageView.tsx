import { memo } from "react";
import { BOREHOLES, DOC, PH, PW, TOTAL_PAGES, pageX, type PageDef } from "./pages";

export const PageView = memo(function PageView({ page, i }: { page: PageDef; i: number }) {
  return (
    <article aria-label={`Page ${i + 1}, ${page.label}`} className="cv-page" style={{ left: pageX(i), width: PW, height: PH }}>
      <div className="cv-page__run">
        <span>{DOC.id} · Geotechnical investigation, North pad</span>
        <span>Rev A · page {i + 1} of {TOTAL_PAGES}</span>
      </div>
      {page.cover ? (
        <div className="cv-cover">
          <div className="cv-cover__kicker">SERVICE REQUISITION</div>
          <h1>Geotechnical investigation, North pad</h1>
          <p>Ground investigation ahead of design of the tower crane footing. Boreholes, sampling and laboratory testing.</p>
          <span className="cv-stamp">DRAFT<span>NOT FOR ISSUE</span></span>
          <table className="cv-titleblock">
            <tbody>
              <tr><td>SR number</td><td>{DOC.id}</td><td>Discipline</td><td>Civil / geotechnical</td></tr>
              <tr><td>Site</td><td>North pad</td><td>Requested by</td><td>[Name]</td></tr>
              <tr><td>Revision</td><td>A · first draft</td><td>Date</td><td>[Date]</td></tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cv-body">
          {page.blocks?.map((b, k) =>
            b.kind === "h" ? <h2 key={k}>{b.text}</h2>
            : b.kind === "p" ? <p key={k}><span className="cv-num">{b.num}</span><span>{b.text}</span></p>
            : (
              <table key={k} className="cv-table">
                <thead><tr><th>Borehole</th><th className="r">Depth</th><th>Location</th><th>Standpipe</th></tr></thead>
                <tbody>{BOREHOLES.map((r) => <tr key={r[0]}><td>{r[0]}</td><td className="r">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
              </table>
            ),
          )}
        </div>
      )}
    </article>
  );
});
