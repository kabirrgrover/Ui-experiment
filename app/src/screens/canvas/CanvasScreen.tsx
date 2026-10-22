import { useCallback, useEffect, useRef, useState } from "react";
import { linkTo } from "../../lib/router";
import { AskBar } from "./AskBar";
import { answerFor } from "./AskPopover";
import { seededCircle } from "./geometry";
import { DOC, TOTAL_PAGES } from "./pages";
import { PagesPanel } from "./PagesPanel";
import { StickerTray } from "./StickerTray";
import { Toolbar, TOOLS } from "./Toolbar";
import { useBoard } from "./useBoard";
import { Viewport } from "./Viewport";
import { ZoomControls } from "./ZoomControls";
import { HINTS, type Board, type CameraApi, type Note, type PlacedSticker, type Tool } from "./types";
import "./canvas.css";

const initialBoard = (): Board => ({
  notes: [
    { id: "n1", x: 430, y: 500, color: "yellow", rot: -3, text: "check the depth with the crane vendor before this goes out" },
    { id: "n2", x: 1500, y: 860, color: "peach", rot: 2.5, text: "who signs off the HSE section?" },
  ],
  strokes: [
    { id: "s1", kind: "hl", pts: [[1888, 363], [2392, 363]] },
    { id: "s2", kind: "pen", pts: seededCircle() },
  ],
  stickers: [{ id: "k1", src: "/assets/rfi.svg", x: 2580, y: 560, w: 120, rot: -8 }],
});

type Clip = { notes: Note[]; stickers: PlacedSticker[] };

/** Edit mode: Figma/Excalidraw-style markup over the drafted SR. */
export default function CanvasScreen() {
  const { board, commit, edit, undo, redo } = useBoard(initialBoard);
  const [tool, setTool] = useState<Tool>("select");
  const [hint, setHint] = useState("");
  const [stickerIdx, setStickerIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [askAt, setAskAt] = useState<{ x: number; y: number } | null>(null);
  const [zoomPct, setZoomPct] = useState(46);
  const camera = useRef<CameraApi>(null);
  const seq = useRef(20);
  const clip = useRef<Clip | null>(null);
  const pasteN = useRef(0);

  const nextId = useCallback((prefix: string) => `${prefix}${++seq.current}`, []);
  const pickTool = useCallback((t: Tool) => { setTool(t); setHint(HINTS[t] ?? ""); }, []);

  const aiNote = useCallback((text: string, at: { x: number; y: number } | null) => {
    const id = nextId("n");
    commit((b) => ({ ...b, notes: [...b.notes, { id, x: (at ? at.x : 900) + 40, y: (at ? at.y : 300) - 30, color: "blue", rot: 1.5, text, byAI: true }] }));
    setAskAt(null);
  }, [commit, nextId]);

  // Keyboard: tools, zoom, undo/redo, clipboard, delete.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.matches?.("input, textarea") ?? false;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (k === "escape") { setAskAt(null); setSelected([]); pickTool("select"); setHint(""); if (typing) el.blur(); return; }
      if (typing) return;
      if (mod && k === "z") { e.preventDefault(); if (e.shiftKey) { redo(); } else { undo(); } return; }
      if (mod && k === "y") { e.preventDefault(); redo(); return; }
      if (mod && (k === "c" || k === "x")) {
        if (!selected.length) return;
        e.preventDefault();
        clip.current = { notes: board.notes.filter((n) => selected.includes(n.id)), stickers: board.stickers.filter((s) => selected.includes(s.id)) };
        pasteN.current = 0;
        if (k === "x") { commit((b) => ({ ...b, notes: b.notes.filter((n) => !selected.includes(n.id)), stickers: b.stickers.filter((s) => !selected.includes(s.id)) })); setSelected([]); }
        return;
      }
      if (mod && k === "v") {
        const c = clip.current;
        if (!c) return;
        e.preventDefault();
        const off = 30 * ++pasteN.current;
        const notes = c.notes.map((n) => ({ ...n, id: nextId("n"), x: n.x + off, y: n.y + off }));
        const stickers = c.stickers.map((s) => ({ ...s, id: nextId("k"), x: s.x + off, y: s.y + off }));
        commit((b) => ({ ...b, notes: [...b.notes, ...notes], stickers: [...b.stickers, ...stickers] }));
        setSelected([...notes, ...stickers].map((x) => x.id));
        return;
      }
      if (mod && k === "a") { e.preventDefault(); setSelected([...board.notes, ...board.stickers].map((x) => x.id)); return; }
      if ((k === "delete" || k === "backspace") && selected.length) {
        e.preventDefault();
        commit((b) => ({ ...b, notes: b.notes.filter((n) => !selected.includes(n.id)), stickers: b.stickers.filter((s) => !selected.includes(s.id)) }));
        setSelected([]);
        return;
      }
      if (mod || e.altKey) return;
      const t = TOOLS.find((x) => x.key.toLowerCase() === k);
      if (t) { pickTool(t.id); return; }
      if (k === "+" || k === "=") camera.current?.zoomBy(1.2);
      else if (k === "-") camera.current?.zoomBy(1 / 1.2);
      else if (k === "0") camera.current?.fit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, selected, commit, undo, redo, nextId, pickTool]);

  return (
    <div className="cv-screen">
      <header className="cv-header">
        <div className="cv-header__left">
          <a href="/chat?state=done" onClick={linkTo("/chat?state=done")} aria-label="Back to chat" className="cv-back">← chat</a>
          <span aria-hidden="true" className="cv-divider" />
          <div className="cv-titles">
            <span className="cv-title">{DOC.title.toLowerCase()}</span>
            <span className="cv-sub">{DOC.id} · Rev A · {TOTAL_PAGES} pages · saved</span>
          </div>
        </div>
        <div className="cv-header__right">
          <span role="img" aria-label="You and docbuilder are here" className="cv-faces">
            <span className="cv-face">k</span>
            <span className="cv-face cv-face--ai">ai</span>
          </span>
          <a href="#" className="cv-box" onClick={(e) => e.preventDefault()}>share</a>
          <a href="#" className="cv-box cv-box--primary" onClick={(e) => e.preventDefault()}>download</a>
        </div>
      </header>

      <div className="cv-main">
        <PagesPanel onGo={(i) => camera.current?.goPage(i)} />
        <div className="cv-stage">
          <Viewport
            ref={camera}
            board={board}
            tool={tool}
            stickerIdx={stickerIdx}
            selected={selected}
            askAt={askAt}
            commit={commit}
            edit={edit}
            nextId={nextId}
            onSelect={setSelected}
            onToolDone={() => { setTool("select"); setHint(""); }}
            onAsk={setAskAt}
            onAskPick={(o) => aiNote(answerFor(o), askAt)}
            onZoom={setZoomPct}
          />
          <Toolbar tool={tool} onPick={pickTool} />
          {tool === "sticker" && <StickerTray picked={stickerIdx} onPick={(i) => { setStickerIdx(i); setHint(""); }} />}
          {hint && tool !== "sticker" && <div className="cv-hint" role="status">{hint}</div>}
          <ZoomControls pct={zoomPct} onIn={() => camera.current?.zoomBy(1.2)} onOut={() => camera.current?.zoomBy(1 / 1.2)} onFit={() => camera.current?.fit()} />
          <AskBar onAsk={(t) => aiNote(`On it: "${t}". I will show the edit as a tracked change.`, null)} />
        </div>
      </div>
    </div>
  );
}
