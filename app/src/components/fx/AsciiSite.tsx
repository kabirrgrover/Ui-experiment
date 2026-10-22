import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";
import "./fx.css";

/**
 * A tiny ASCII building site that drifts past, six rows tall, in pencil grey.
 * Writes text straight into a <pre> (no React re-render per frame), ~7 fps,
 * paused offscreen. Static under reduced motion.
 */
/** One repeating tile of the site, hand-drawn. Every row is the same width. */
const TILE = [
  "         ____________________                                                                            ",
  "         |\\/\\/\\/|/\\/\\/\\/\\/\\/|              .                                                             ",
  "         |/\\/\\/\\|      |                  /_\\                     _____                                  ",
  "         |\\/\\/\\/|      |                 |[ ]|      ___          |#|#|#|        ,                        ",
  "         |/\\/\\/\\|     [_]      ___       |[ ]|     |[ ]|  /\\     |#|#|#|       /|\\        ._.            ",
  "_________|\\/\\/\\/|______________|_|_______|___|_____|___|_/__\\____|_|_|_|______/_|_\\_______|_|____________"
];
const ROWS = TILE.length;
const W = TILE[0].length;

export function AsciiSite({ width = 140 }: { width?: number }) {
  const pre = useRef<HTMLPreElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = pre.current;
    if (!el) return;
    let offset = 0, visible = true, timer = 0;
    const draw = () => {
      const lines = Array.from({ length: ROWS }, () => "");
      for (let c = 0; c < width; c++) {
        const x = (c + offset) % W;
        for (let r = 0; r < ROWS; r++) lines[r] += TILE[r][x];
      }
      el.textContent = lines.join("\n");
    };
    draw();
    if (reduced) return;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    timer = window.setInterval(() => { if (!visible) return; offset++; draw(); }, 140);
    return () => { clearInterval(timer); io.disconnect(); };
  }, [width, reduced]);

  return <pre ref={pre} className="fx-ascii" aria-hidden="true" />;
}
