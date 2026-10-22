import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const GLYPHS = "#%&*+=-/\\|_<>~:";

/**
 * Text that resolves left to right out of ASCII glyphs whenever it changes
 * (after React Bits' Decrypted Text). Screen readers get the plain text.
 */
export function ScrambleText({ text, duration = 520 }: { text: string; duration?: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) { setShown(text); return; }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const fixed = Math.floor(p * text.length);
      let s = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setShown(s);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, duration, reduced]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </>
  );
}
