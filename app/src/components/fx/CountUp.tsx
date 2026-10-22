import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** Counts from 0 to `to` the first time it scrolls into view (after React Bits' Count Up). */
export function CountUp({ to, duration = 700 }: { to: number; duration?: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) { setN(to); return; }
    const node = el.current;
    if (!node) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration, reduced]);

  return <span ref={el} style={{ fontVariantNumeric: "tabular-nums" }}>{n}</span>;
}
