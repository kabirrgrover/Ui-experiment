import { useEffect, useState, useSyncExternalStore } from "react";

const RM = "(prefers-reduced-motion: reduce)";

/** True when the user asked for reduced motion. Updates live. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(RM);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

/**
 * Reveals `text` word by word while `active` is true, like a model streaming tokens.
 * Returns the visible part and whether it is still streaming.
 */
export function useStreamedText(text: string, active: boolean, msPerWord = 55): { shown: string; streaming: boolean } {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const [count, setCount] = useState(active && !reduced ? 0 : words.length);

  useEffect(() => {
    if (!active || reduced) { setCount(words.length); return; }
    setCount(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= words.length) window.clearInterval(id);
    }, msPerWord);
    return () => window.clearInterval(id);
    // words.length is derived from text
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active, reduced, msPerWord]);

  return { shown: words.slice(0, count).join(" "), streaming: count < words.length };
}
