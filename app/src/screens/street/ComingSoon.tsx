/**
 * "Coming soon" lots on Spec Street: the next things Docbuilder will help with.
 * Display only for now. When one ships, move it into the street as a real door.
 */
type Lot = { code?: string; name: string };

const LOTS: Lot[] = [
  { code: "SRQ", name: "SR for quote" },
  { name: "Bid period support" },
  { code: "TBE", name: "Technical bid evaluation" },
  { code: "SRP", name: "SR conformed for award" },
  { name: "Appendices" },
  { name: "Agile data entry" },
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
            <span className="sr-only">Coming soon.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
