import { useEffect } from "react";

/**
 * A few short ink strokes burst from the click point on primary actions and answer picks
 * (after React Bits' Click Spark, drawn in ink instead of glow). Mount once at the app root.
 * Opt any element in with `data-spark`.
 */
const SELECTOR = ".db-btn--primary, .ch-opt, .st-start, [data-spark]";

export function InkSparks() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest(SELECTOR)) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const R = 34;
      svg.setAttribute("width", String(R * 2));
      svg.setAttribute("height", String(R * 2));
      svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, { position: "fixed", left: `${e.clientX - R}px`, top: `${e.clientY - R}px`, pointerEvents: "none", zIndex: "100", overflow: "visible" });
      const rot = Math.random() * 40;
      for (let i = 0; i < 7; i++) {
        const a = ((i / 7) * 360 + rot) * (Math.PI / 180);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(R + Math.cos(a) * 10));
        line.setAttribute("y1", String(R + Math.sin(a) * 10));
        line.setAttribute("x2", String(R + Math.cos(a) * 19));
        line.setAttribute("y2", String(R + Math.sin(a) * 19));
        line.setAttribute("stroke", "#111111");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        line.animate(
          [{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * 9}px, ${Math.sin(a) * 9}px)`, opacity: 0 }],
          { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
        );
        svg.appendChild(line);
      }
      document.body.appendChild(svg);
      window.setTimeout(() => svg.remove(), 420);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
