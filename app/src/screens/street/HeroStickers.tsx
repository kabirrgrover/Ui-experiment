import { useRef, type PointerEvent as RPointerEvent } from "react";

/**
 * Stickers slapped around the Spec Street hero. Purely decorative (aria-hidden),
 * but you can peel and drag them around; they stay where you drop them for the session.
 */
type Spot = { src: string; w: number; left: string; top: string; tilt: number; mobile?: boolean };

const SPOTS: Spot[] = [
  { src: "/assets/docbuilder-word.svg", w: 180, left: "3%", top: "44%", tilt: -6 },
  { src: "/assets/dont-just-spec.svg", w: 200, left: "80%", top: "46%", tilt: 5, mobile: true },
  { src: "/assets/draft-draft-redraft.svg", w: 120, left: "5%", top: "2%", tilt: -3 },
  { src: "/assets/out-on-site.svg", w: 180, left: "84%", top: "4%", tilt: -4 },
  { src: "/assets/cone.png", w: 80, left: "17%", top: "74%", tilt: 8, mobile: true },
];

export function HeroStickers() {
  const drag = useRef<{ el: HTMLElement; x: number; y: number; ox: number; oy: number } | null>(null);

  const down = (e: RPointerEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const ox = Number(el.dataset.x ?? 0), oy = Number(el.dataset.y ?? 0);
    drag.current = { el, x: e.clientX, y: e.clientY, ox, oy };
    el.classList.add("is-peeled");
  };
  const move = (e: RPointerEvent<HTMLImageElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = d.ox + e.clientX - d.x, y = d.oy + e.clientY - d.y;
    d.el.dataset.x = String(x); d.el.dataset.y = String(y);
    d.el.style.translate = `${x}px ${y}px`;
  };
  const up = () => {
    drag.current?.el.classList.remove("is-peeled");
    drag.current = null;
  };

  return (
    <div className="st-stickers" aria-hidden="true">
      {SPOTS.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt=""
          draggable={false}
          className={"st-sticker" + (s.mobile ? " st-sticker--mobile" : "")}
          style={{ width: s.w, left: s.left, top: s.top, rotate: `${s.tilt}deg`, animationDelay: `${300 + i * 140}ms` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      ))}
    </div>
  );
}
