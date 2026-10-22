import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type Ref } from "react";
import { AskPopover } from "./AskPopover";
import { PageView } from "./PageView";
import { PAGES, PH, PW, pageX } from "./pages";
import { StickyNote } from "./StickyNote";
import { clamp, smoothPath } from "./geometry";
import { TRAY, type Board, type Camera, type CameraApi, type NoteColor, type Pt, type Tool } from "./types";

type Gesture =
  | { kind: "pan"; sx: number; sy: number; px: number; py: number }
  | { kind: "move"; sx: number; sy: number; moved: boolean; items: { kind: "note" | "sticker"; id: string; el: HTMLElement; x: number; y: number }[] }
  | { kind: "draw"; stroke: "pen" | "hl"; pts: Pt[] }
  | { kind: "pinch"; d0: number; z0: number; wx: number; wy: number };

interface Props {
  ref: Ref<CameraApi>;
  board: Board;
  tool: Tool;
  stickerIdx: number;
  selected: string[];
  askAt: { x: number; y: number } | null;
  commit: (fn: (b: Board) => Board) => void;
  edit: (fn: (b: Board) => Board) => void;
  nextId: (prefix: string) => string;
  onSelect: (ids: string[]) => void;
  onToolDone: () => void;
  onAsk: (at: { x: number; y: number } | null) => void;
  onAskPick: (opt: string) => void;
  onZoom: (pct: number) => void;
}

const NOTE_CYCLE: NoteColor[] = ["yellow", "peach", "green", "blue"];
const MIN_Z = 0.15;
const MAX_Z = 2.5;

/** The infinite dotted canvas. Camera lives in a ref and is written straight to the DOM, so pan/zoom never re-render React. */
export function Viewport(p: Props) {
  const vpRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<SVGPathElement>(null);
  const cam = useRef<Camera>({ zoom: 0.46, px: 40, py: 60 });
  const gesture = useRef<Gesture | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const space = useRef(false);
  const seq = useRef(0);
  const [freshId, setFreshId] = useState<string | null>(null);
  const { onZoom } = p;

  const apply = useCallback(() => {
    const vp = vpRef.current, world = worldRef.current;
    if (!vp || !world) return;
    const { zoom, px, py } = cam.current;
    world.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(${zoom.toFixed(4)})`;
    world.style.setProperty("--cv-inv", (1 / zoom).toFixed(4));
    vp.style.backgroundSize = `${(24 * zoom).toFixed(2)}px ${(24 * zoom).toFixed(2)}px`;
    vp.style.backgroundPosition = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
    onZoom(Math.round(zoom * 100));
  }, [onZoom]);

  useLayoutEffect(apply, [apply]);

  const size = () => ({ w: vpRef.current?.clientWidth ?? 1200, h: vpRef.current?.clientHeight ?? 760 });

  const zoomTo = useCallback((z: number, cx?: number, cy?: number) => {
    const c = cam.current;
    const nz = clamp(z, MIN_Z, MAX_Z);
    const { w, h } = size();
    const x = cx ?? w / 2, y = cy ?? h / 2;
    const wx = (x - c.px) / c.zoom, wy = (y - c.py) / c.zoom;
    cam.current = { zoom: nz, px: x - wx * nz, py: y - wy * nz };
    apply();
  }, [apply]);

  useImperativeHandle(p.ref, () => ({
    zoomBy: (f) => zoomTo(cam.current.zoom * f),
    fit: () => {
      const { w, h } = size();
      const totalW = pageX(PAGES.length - 1) + PW;
      const z = Math.min((w - 80) / totalW, (h - 160) / PH);
      cam.current = { zoom: z, px: (w - totalW * z) / 2, py: 76 };
      apply();
    },
    goPage: (i) => {
      const { w, h } = size();
      const z = Math.min(0.8, (h - 120) / PH);
      cam.current = { zoom: z, px: w / 2 - (pageX(i) + PW / 2) * z, py: 70 };
      apply();
    },
  }), [apply, zoomTo]);

  // Wheel: ctrl/cmd (and trackpad pinch) zooms at the cursor, plain wheel pans. Needs a non-passive listener.
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element).closest(".cv-note textarea")) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const r = vp.getBoundingClientRect();
        zoomTo(cam.current.zoom * Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top);
      } else {
        cam.current = { ...cam.current, px: cam.current.px - e.deltaX, py: cam.current.py - e.deltaY };
        apply();
      }
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [apply, zoomTo]);

  // Hold space to pan with any tool.
  useEffect(() => {
    const typing = (e: KeyboardEvent) => (e.target as HTMLElement).matches?.("input, textarea");
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !typing(e)) { space.current = true; vpRef.current?.classList.add("is-space"); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") { space.current = false; vpRef.current?.classList.remove("is-space"); }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const toWorld = (e: { clientX: number; clientY: number }): Pt => {
    const r = vpRef.current!.getBoundingClientRect();
    const c = cam.current;
    return [(e.clientX - r.left - c.px) / c.zoom, (e.clientY - r.top - c.py) / c.zoom];
  };

  const startPan = (e: RPointerEvent) => {
    gesture.current = { kind: "pan", sx: e.clientX, sy: e.clientY, px: cam.current.px, py: cam.current.py };
    vpRef.current?.classList.add("is-panning");
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const t = e.target as Element;
    if (t.closest("textarea, button, form, [role='toolbar'], .cv-askpop, .cv-tray")) return;
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault(); // no native text selection or focus jumps while we own the gesture
    if (e.pointerType === "touch") {
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.current.size === 2) {
        // Second finger: abandon whatever the first finger started and pinch-zoom instead.
        liveRef.current?.setAttribute("d", "");
        const [a, b] = [...touches.current.values()];
        const r = vpRef.current!.getBoundingClientRect();
        const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
        const c = cam.current;
        gesture.current = { kind: "pinch", d0: Math.hypot(a.x - b.x, a.y - b.y), z0: c.zoom, wx: (mx - c.px) / c.zoom, wy: (my - c.py) / c.zoom };
        return;
      }
    }
    vpRef.current?.setPointerCapture(e.pointerId);
    vpRef.current?.focus({ preventScroll: true });
    const w = toWorld(e);
    const { tool, board } = p;

    if (space.current || e.button === 1) { startPan(e); return; }

    const noteEl = t.closest<HTMLElement>("[data-note]");
    const handle = t.closest<HTMLElement>("[data-notehandle]");
    const stickEl = t.closest<HTMLElement>("[data-sticker]");

    if (tool === "erase") {
      if (noteEl) { const id = noteEl.dataset.note!; p.commit((b) => ({ ...b, notes: b.notes.filter((n) => n.id !== id) })); return; }
      if (stickEl) { const id = stickEl.dataset.sticker!; p.commit((b) => ({ ...b, stickers: b.stickers.filter((k) => k.id !== id) })); return; }
      const r = 24 / Math.max(cam.current.zoom, 0.5);
      const hit = board.strokes.filter((s) => s.pts.some((q) => Math.abs(q[0] - w[0]) < r && Math.abs(q[1] - w[1]) < r)).map((s) => s.id);
      if (hit.length) p.commit((b) => ({ ...b, strokes: b.strokes.filter((s) => !hit.includes(s.id)) }));
      return;
    }

    const canGrab = tool === "select" || tool === "hand" || tool === "note" || tool === "sticker";
    const grabId = (handle && handle.dataset.notehandle) || (stickEl && stickEl.dataset.sticker) || null;
    if (canGrab && (grabId || noteEl)) {
      const id = grabId ?? noteEl!.dataset.note!;
      let sel = p.selected;
      if (e.shiftKey) sel = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id];
      else if (!sel.includes(id)) sel = [id];
      p.onSelect(sel);
      if (!grabId) return; // clicked the note body: select only, the textarea takes focus
      const world = worldRef.current!;
      type Item = { kind: "note" | "sticker"; id: string; el: HTMLElement; x: number; y: number };
      const items = sel.flatMap((sid): Item[] => {
        const n = board.notes.find((x) => x.id === sid);
        if (n) { const el = world.querySelector<HTMLElement>(`[data-note="${sid}"]`); return el ? [{ kind: "note", id: sid, el, x: n.x, y: n.y }] : []; }
        const k = board.stickers.find((x) => x.id === sid);
        if (k) { const el = world.querySelector<HTMLElement>(`[data-sticker="${sid}"]`); return el ? [{ kind: "sticker", id: sid, el, x: k.x, y: k.y }] : []; }
        return [];
      });
      gesture.current = { kind: "move", sx: w[0], sy: w[1], moved: false, items };
      return;
    }

    if (tool === "note") {
      const id = p.nextId("n");
      const color = noteColor(seq.current++);
      p.commit((b) => ({ ...b, notes: [...b.notes, { id, x: w[0] - 110, y: w[1] - 20, color, rot: (seq.current % 5) - 2, text: "" }] }));
      p.onSelect([id]);
      p.onToolDone();
      setFreshId(id);
      return;
    }
    if (tool === "sticker") {
      const tr = TRAY[p.stickerIdx];
      const id = p.nextId("k");
      const rot = (seq.current++ % 7) - 3;
      p.commit((b) => ({ ...b, stickers: [...b.stickers, { id, src: tr.src, x: w[0] - tr.w / 2, y: w[1] - 40, w: tr.w, rot }] }));
      return;
    }
    if (tool === "pen" || tool === "hl") {
      gesture.current = { kind: "draw", stroke: tool, pts: [w] };
      const live = liveRef.current;
      if (live) {
        live.setAttribute("d", smoothPath([w]));
        live.setAttribute("stroke", tool === "hl" ? "rgba(243,222,60,.55)" : "#111111");
        live.setAttribute("stroke-width", tool === "hl" ? "20" : "2.6");
        live.style.mixBlendMode = tool === "hl" ? "multiply" : "normal";
      }
      p.onAsk(null);
      return;
    }
    if (tool === "select" && !e.shiftKey) p.onSelect([]);
    p.onAsk(null);
    startPan(e);
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (touches.current.has(e.pointerId)) touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.kind === "pinch") {
      const [a, b] = [...touches.current.values()];
      if (!a || !b) return;
      const r = vpRef.current!.getBoundingClientRect();
      const z = clamp(g.z0 * (Math.hypot(a.x - b.x, a.y - b.y) / g.d0), MIN_Z, MAX_Z);
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      cam.current = { zoom: z, px: mx - g.wx * z, py: my - g.wy * z };
      apply();
      return;
    }
    if (g.kind === "pan") {
      cam.current = { ...cam.current, px: g.px + e.clientX - g.sx, py: g.py + e.clientY - g.sy };
      apply();
      return;
    }
    const w = toWorld(e);
    if (g.kind === "draw") {
      const last = g.pts[g.pts.length - 1];
      if (Math.abs(last[0] - w[0]) + Math.abs(last[1] - w[1]) > 3 / cam.current.zoom) {
        g.pts.push(w);
        liveRef.current?.setAttribute("d", smoothPath(g.pts));
      }
      return;
    }
    const dx = w[0] - g.sx, dy = w[1] - g.sy;
    if (Math.abs(dx) + Math.abs(dy) > 1) g.moved = true;
    for (const it of g.items) { it.el.style.left = `${it.x + dx}px`; it.el.style.top = `${it.y + dy}px`; }
  };

  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    touches.current.delete(e.pointerId);
    const g = gesture.current;
    if (g?.kind === "pinch" && touches.current.size > 0) return; // wait for the last finger
    gesture.current = null;
    vpRef.current?.classList.remove("is-panning");
    if (!g) return;
    if (g.kind === "draw") {
      liveRef.current?.setAttribute("d", "");
      if (g.pts.length > 1) {
        const id = p.nextId("s");
        const stroke = { id, kind: g.stroke, pts: g.pts };
        p.commit((b) => ({ ...b, strokes: [...b.strokes, stroke] }));
        if (g.stroke === "hl" && g.pts.length > 2) {
          const l = g.pts[g.pts.length - 1];
          p.onAsk({ x: l[0] + 12, y: l[1] + 18 });
        }
      }
      return;
    }
    if (g.kind === "move" && g.moved) {
      const w = toWorld(e);
      const dx = w[0] - g.sx, dy = w[1] - g.sy;
      const ids = new Map(g.items.map((it) => [it.id, it]));
      p.commit((b) => ({
        ...b,
        notes: b.notes.map((n) => (ids.has(n.id) ? { ...n, x: ids.get(n.id)!.x + dx, y: ids.get(n.id)!.y + dy } : n)),
        stickers: b.stickers.map((k) => (ids.has(k.id) ? { ...k, x: ids.get(k.id)!.x + dx, y: ids.get(k.id)!.y + dy } : k)),
      }));
    }
  };

  const { edit } = p;
  const onText = useCallback((id: string, text: string) => {
    edit((b) => ({ ...b, notes: b.notes.map((n) => (n.id === id ? { ...n, text } : n)) }));
  }, [edit]);

  return (
    <div
      ref={vpRef}
      className="cv-vp"
      data-tool={p.tool}
      tabIndex={0}
      aria-label="Document canvas. Drag to pan, Control plus scroll to zoom."
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div ref={worldRef} className="cv-world">
        {PAGES.map((pg, i) => <PageView key={pg.label} page={pg} i={i} />)}

        <svg aria-hidden="true" className="cv-ink" width="6000" height="1600" viewBox="0 0 6000 1600">
          {p.board.strokes.map((s) => (
            <path
              key={s.id}
              data-stroke={s.id}
              d={smoothPath(s.pts)}
              fill="none"
              stroke={s.kind === "hl" ? "rgba(243,222,60,.55)" : "#111111"}
              strokeWidth={s.kind === "hl" ? 20 : 2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={s.kind === "hl" ? { mixBlendMode: "multiply" } : undefined}
            />
          ))}
          <path ref={liveRef} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {p.board.stickers.map((k) => (
          <img
            key={k.id}
            className={`cv-sticker cv-placed cv-grab${p.selected.includes(k.id) ? " is-selected" : ""}`}
            data-sticker={k.id}
            src={k.src}
            alt=""
            draggable={false}
            style={{ left: k.x, top: k.y, width: k.w, ["--r" as string]: `${k.rot}deg` }}
          />
        ))}

        {p.board.notes.map((n) => <StickyNote key={n.id} note={n} selected={p.selected.includes(n.id)} autoFocus={n.id === freshId} onText={onText} />)}

        {p.askAt && <AskPopover x={p.askAt.x} y={p.askAt.y} onPick={p.onAskPick} onClose={() => p.onAsk(null)} />}
      </div>
    </div>
  );
}

function noteColor(i: number): NoteColor {
  return NOTE_CYCLE[i % NOTE_CYCLE.length];
}
