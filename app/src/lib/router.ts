import { useSyncExternalStore, type MouseEvent } from "react";

/** Routes in the app. Keep in sync with App.tsx. */
export type Route = "/" | "/chat" | "/canvas" | "/folders";

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("popstate", fn);
  return () => { listeners.delete(fn); window.removeEventListener("popstate", fn); };
};
const read = () => window.location.pathname + window.location.search;

export function usePath(): string {
  return useSyncExternalStore(subscribe, read, () => "/");
}

/** Navigate with a cross-fade View Transition where the browser supports it. */
export function navigate(to: string) {
  if (to === read()) return;
  const go = () => { window.history.pushState(null, "", to); listeners.forEach((l) => l()); window.scrollTo(0, 0); };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(go);
  else go();
}

/** onClick handler for <a href> that keeps routing client side. */
export function linkTo(to: string) {
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
}

export function useQuery(): URLSearchParams {
  const p = usePath();
  return new URLSearchParams(p.split("?")[1] ?? "");
}
