import { HeroStickers } from "./HeroStickers";
import { useId, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { AppHeader } from "../../components/AppHeader";
import { linkTo, navigate } from "../../lib/router";
import { BUILDINGS, DOORS, FILTERS, GAP, PROPS, PROP_W, TRY_PROMPTS, type Door, type Filter, type Prop } from "./streetData";
import "./street.css";

/** Street scroll speed in px per second. */
const SPEED = 38;

type Slot = { kind: "door"; door: Door } | { kind: "prop"; prop: Prop };

/** Doors with a prop after every third one, repeated until the run is long enough to loop. */
function buildRun(filter: Filter): Slot[] {
  const list = DOORS.filter((d) => filter === "all" || d.doc === filter);
  const run: Slot[] = [];
  list.forEach((door, i) => {
    run.push({ kind: "door", door });
    if (i % 3 === 2) run.push({ kind: "prop", prop: PROPS[Math.floor(i / 3) % PROPS.length] });
  });
  if (run.length && run[run.length - 1].kind !== "prop") run.push({ kind: "prop", prop: PROPS[1] });
  const base = run.slice();
  let out = run;
  while (out.length < 10) out = out.concat(base);
  return out;
}

const chatHref = (d: Door) => `/chat?type=${d.doc.toLowerCase()}&kind=${d.slug}`;

export default function StreetScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [ask, setAsk] = useState("");
  const askId = useId();

  const run = useMemo(() => buildRun(filter), [filter]);
  const widthPx = run.reduce((a, s) => a + (s.kind === "prop" ? PROP_W : BUILDINGS[s.door.kind].w) + GAP, 0);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: DOORS.length, SR: 0, MR: 0, PEP: 0 };
    DOORS.forEach((d) => { c[d.doc] += 1; });
    return c;
  }, []);
  const doorCount = filter === "all" ? DOORS.length : counts[filter];

  const start = (e: FormEvent) => {
    e.preventDefault();
    const q = ask.trim();
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  return (
    <div className="st-page">
      <AppHeader />

      <section className="st-hero">
        <div className="db-grid st-hero__grid" aria-hidden="true" />
        <HeroStickers />
        <h1 className="st-hero__title">what are we drafting today?</h1>
        <p className="st-hero__sub">Tell me what you need, or knock on a door down Spec Street.</p>
        <form onSubmit={start} className="st-field">
          <label htmlFor={askId} className="sr-only">Describe the document you need</label>
          <input id={askId} className="st-input" type="text" value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="e.g. an SR for 3 boreholes at the North pad" />
          <button type="submit" className="st-start">Start drafting</button>
        </form>
        <div className="st-try">
          <span className="st-try__label">try:</span>
          {TRY_PROMPTS.map((t) => (
            <button key={t} type="button" className="st-trychip" onClick={() => setAsk(t)}>{t}</button>
          ))}
        </div>
      </section>

      <section className="st-street" aria-label="Spec Street, document types">
        <div className="st-street__head">
          <div className="st-street__title">
            <h2>Spec Street</h2>
            <span>{doorCount} doors open</span>
          </div>
          <div role="group" aria-label="Filter by document type" className="st-filters">
            {FILTERS.map(([key, label]) => (
              <button key={key} type="button" className="st-filter" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {label} <span className="st-filter__n">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="st-clip">
          <div className="st-skywrap" aria-hidden="true">
            <div className="st-sky" style={{ animationDuration: `${Math.round(3200 / (SPEED * 0.35))}s` }}>
              {[0, 1, 2, 3].map((i) => <img key={i} src="/assets/sky-skyline.svg" alt="" />)}
            </div>
          </div>
          <div className="st-track" key={filter} style={{ animationDuration: `${Math.round(widthPx / SPEED)}s` }}>
            {run.concat(run).map((s, i) => {
              const dup = i >= run.length;
              if (s.kind === "prop") {
                return (
                  <div key={i} className="st-prop" aria-hidden="true">
                    <img src={s.prop.img} alt="" style={{ height: s.prop.height, marginBottom: s.prop.sink ? -s.prop.sink : undefined }} />
                  </div>
                );
              }
              return <DoorView key={i} door={s.door} dup={dup} showDim={(i % run.length) % 5 === 1} />;
            })}
          </div>
        </div>
        <div className="st-kerb" aria-hidden="true" />
      </section>

      <footer className="st-foot">
        <span>Hover the street to stop it. Drafts save as you go.</span>
        <div aria-label="Sheet title block" role="img" className="st-titleblock">
          <span className="st-tb__project"><span className="st-tb__k">PROJECT</span><span className="st-tb__name">AI Docbuilder</span></span>
          <span className="st-tb__cell"><span className="st-tb__k">SHEET</span>Spec Street</span>
          <span className="st-tb__cell"><span className="st-tb__k">SCALE</span>1 : 100</span>
          <span className="st-tb__cell st-tb__cell--last"><span className="st-tb__k">REV</span>A · 1 of 1</span>
        </div>
      </footer>
    </div>
  );
}

function DoorView({ door, dup, showDim }: { door: Door; dup: boolean; showDim: boolean }) {
  const b = BUILDINGS[door.kind];
  const href = chatHref(door);
  const sign: CSSProperties = { left: b.sign[0], top: b.sign[1], width: b.sign[2], height: b.sign[3] };
  const win: CSSProperties = { left: b.win[0] + 8, top: b.win[1] + 8, width: b.win[2] - 16, height: b.win[3] - 16 };
  return (
    <a
      href={href}
      onClick={linkTo(href)}
      className="st-door"
      aria-label={`Start a ${door.type} ${door.doc} at ${door.name}`}
      aria-hidden={dup || undefined}
      tabIndex={dup ? -1 : 0}
      style={{ width: b.w, height: b.h }}
    >
      {showDim && (
        <>
          <span className="st-dim st-dim--w" aria-hidden="true">
            <span className="st-dim__line" />
            <span className="st-dim__label">{(b.w / 40).toFixed(1)} m</span>
          </span>
          <span className="st-dim st-dim--h" aria-hidden="true">
            <span className="st-dim__line" />
            <span className="st-dim__label">{(b.h / 40).toFixed(1)} m</span>
          </span>
        </>
      )}
      <img className="st-door__bldg" src={`/assets/bldg-${door.slug}.svg`} alt="" />
      <span className="st-sign" style={sign}>
        <span className="st-sign__name" style={{ fontSize: b.size }}>{door.name}</span>
        {b.plate && <span className="st-sign__plate">{door.type} · {door.doc}</span>}
      </span>
      <img className="st-doodle" src={`/assets/doodle-${door.slug}.svg`} alt="" style={win} />
      <span className="st-tip" role="tooltip">
        <span className="st-tip__head">
          <span className="st-tag" data-doc={door.doc}>{door.doc}</span>
          <span className="st-tip__type">{door.type}</span>
        </span>
        <span className="st-tip__blurb">{door.blurb}</span>
        <span className="st-tip__foot">
          <span className="st-tip__qs">{door.qs}</span>
          <span className="st-tip__knock">knock →</span>
        </span>
      </span>
    </a>
  );
}
