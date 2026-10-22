import { useId, useState, type CSSProperties } from "react";
import { AppHeader } from "../../components/AppHeader";
import { linkTo, navigate, useQuery } from "../../lib/router";
import {
  ALL_FOLDERS, BY_PROJECT, BY_TYPE, COLORS, DOCS, DOODLES, FOLDER_PATH, GROUPS, PAPER_SLOTS, SINGLE_PAPER, STAMP_COLOR, STICKERS,
  type Folder, type Grouping,
} from "./foldersData";
import "./folders.css";

export default function FoldersScreen() {
  const query = useQuery();
  const open = query.get("open");
  const current = ALL_FOLDERS.find((f) => f.id === open) ?? null;
  const [group, setGroup] = useState<Grouping>("type");
  const [q, setQ] = useState("");

  return (
    <div className="fo-page">
      <AppHeader current="folders" />
      <main className="fo-main">
        {current ? (
          <OpenedFolder key={current.id} folder={current} q={q} />
        ) : (
          <FolderGrid group={group} setGroup={setGroup} q={q} setQ={setQ} />
        )}
      </main>
    </div>
  );
}

function FolderGrid({ group, setGroup, q, setQ }: { group: Grouping; setGroup: (g: Grouping) => void; q: string; setQ: (s: string) => void }) {
  const findId = useId();
  const list = group === "type" ? BY_TYPE : group === "project" ? BY_PROJECT : ALL_FOLDERS;
  return (
    <div className="fo-in">
      <div className="fo-top">
        <div>
          <h1 className="fo-title">your folders</h1>
          <p className="fo-sub">Everything you have drafted, sorted by type and by project.</p>
        </div>
        <div className="fo-actions">
          <form className="fo-search" onSubmit={(e) => e.preventDefault()} role="search">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11 L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <label htmlFor={findId} className="sr-only">Search documents</label>
            <input id={findId} type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="search SRs, MRs, PEPs…" />
          </form>
          <button type="button" className="fo-box">+ new folder</button>
        </div>
      </div>

      <div role="group" aria-label="Group by" className="fo-groups">
        {GROUPS.map(([key, label]) => (
          <button key={key} type="button" className="fo-chip" aria-pressed={group === key} onClick={() => setGroup(key)}>{label}</button>
        ))}
      </div>

      <div className="fo-grid">
        {list.map((f) => <FolderButton key={f.id} folder={f} />)}
      </div>
    </div>
  );
}

function FolderButton({ folder: f }: { folder: Folder }) {
  const c = COLORS[f.color];
  const glass = { "--fo-rgb": c.rgb, clipPath: `path('${FOLDER_PATH}')` } as CSSProperties;
  return (
    <button type="button" className="fo-folder" onClick={() => navigate(`/folders?open=${f.id}`)} aria-label={`Open folder ${f.name}, ${f.n} documents`}>
      <span className="fo-folder__body">
        <span className="fo-folder__back" aria-hidden="true" style={{ background: c.solid }} />
        {f.papers.map((p, i) => {
          const [left, top, rot, hover] = f.papers.length === 1 ? SINGLE_PAPER : PAPER_SLOTS[i];
          return (
            <span key={p} className="fo-paper" aria-hidden="true" style={{ left, top, transform: `rotate(${rot}deg)`, "--r2": `${hover}deg` } as CSSProperties}>
              <img src={DOODLES[p]} alt="" />
            </span>
          );
        })}
        <span className="fo-front" aria-hidden="true">
          <span className="fo-glass" style={glass} />
          <svg width="280" height="180" viewBox="0 0 280 180" className="fo-rim">
            <path d={FOLDER_PATH} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="2" />
            <path d="M18 150 H262 M18 158 H262" stroke="rgba(255,255,255,.75)" strokeWidth="1.5" />
          </svg>
          {f.stickers.map(([name, top, left, width, rot]) => (
            <img key={name} src={STICKERS[name]} alt="" className="fo-sticker" style={{ top, left, width, transform: `rotate(${rot}deg)` }} />
          ))}
        </span>
      </span>
      <span className="fo-name">{f.name}</span>
      <span className="fo-count">{f.n} documents</span>
    </button>
  );
}

function OpenedFolder({ folder, q }: { folder: Folder; q: string }) {
  const c = COLORS[folder.color];
  const docs = (DOCS[folder.id] ?? DOCS.sr).filter((d) => !q || (d.title + d.num).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fo-in">
      <a href="/folders" onClick={linkTo("/folders")} className="fo-back">← all folders</a>
      <div className="fo-openhead">
        <span aria-hidden="true" className="fo-swatch" style={{ background: `rgba(${c.rgb},.7)`, borderColor: c.solid }} />
        <h1 className="fo-title fo-title--open">{folder.name}</h1>
        <span className="fo-count">{folder.n} documents</span>
      </div>
      <div className="fo-docs">
        {docs.map((d) => (
          <a key={d.num} href="/canvas" onClick={linkTo("/canvas")} className="fo-doc">
            <span className="fo-doc__thumb" style={{ background: `rgba(${c.rgb},.35)` }}><img src={DOODLES[d.doodle]} alt="" /></span>
            <span className="fo-doc__info">
              <span className="fo-doc__row">
                <span className="fo-doc__type">{d.doc}</span>
                <span className="fo-doc__stamp" style={{ color: STAMP_COLOR[d.status], borderColor: STAMP_COLOR[d.status] }}>{d.status.toUpperCase()}</span>
              </span>
              <span className="fo-doc__title">{d.title}</span>
              <span className="fo-doc__meta">{d.num} · {d.when}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
