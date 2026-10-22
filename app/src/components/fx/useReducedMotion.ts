import { useSyncExternalStore } from "react";

const q = "(prefers-reduced-motion: reduce)";
const sub = (fn: () => void) => { const m = matchMedia(q); m.addEventListener("change", fn); return () => m.removeEventListener("change", fn); };

export function useReducedMotion(): boolean {
  return useSyncExternalStore(sub, () => matchMedia(q).matches, () => false);
}
