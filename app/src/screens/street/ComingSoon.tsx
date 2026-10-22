/**
 * "Coming soon" lots on Spec Street: the next things Docbuilder will help with.
 * Display only for now. When one ships, move it into the street as a real door.
 */
type Lot = { code?: string; name: string; line: string };

const LOTS: Lot[] = [
  { code: "SRQ", name: "SR for quote", line: "Turn a finished SR into a bid package: instructions, pricing schedule, closing date." },
  { name: "Bid period support", line: "Log bidder questions, draft answers and addenda, keep every bidder on the same page." },
  { code: "TBE", name: "Technical bid evaluation", line: "Check every bid against every requirement, with the page it came from." },
  { code: "SRP", name: "SR conformed for award", line: "Fold in addenda and agreed deviations, then lock the award version." },
  { name: "Appendices", line: "See what's missing, number the attachments, keep every cross-reference right." },
  { name: "Agile data entry", line: "Answer click by click. Smart options, fill from files, keyboard first." },
];

export function ComingSoon() {
  return (
    <section className="st-soon" aria-labelledby="st-soon-title">
      <div className="st-soon__head">
        <h2 id="st-soon-title" className="st-soon__title">next up on Spec Street</h2>
        <p className="st-soon__sub">Lots are marked out. These are coming soon.</p>
        <img className="st-soon__tape" src="/assets/hazard-tape.svg" alt="" aria-hidden="true" />
      </div>
      <ul className="st-soon__lots">
        {LOTS.map((l, i) => (
          <li key={l.name} className="st-lot" style={{ rotate: `${[-0.8, 0.6, -0.4, 0.9, -0.7, 0.5][i]}deg` }}>
            <div className="st-lot__top">
              {l.code ? <span className="st-lot__code">{l.code}</span> : <span />}
              <span className="st-lot__stamp" aria-hidden="true">coming soon</span>
            </div>
            <h3 className="st-lot__name">{l.name}</h3>
            <p className="st-lot__line">{l.line}</p>
            <span className="sr-only">Coming soon.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
