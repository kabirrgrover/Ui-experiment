import { useCallback, useReducer } from "react";
import type { Board } from "./types";

interface History { board: Board; past: Board[]; future: Board[] }
type Action =
  | { type: "apply"; fn: (b: Board) => Board; record: boolean }
  | { type: "undo" }
  | { type: "redo" };

const LIMIT = 100;

function reducer(s: History, a: Action): History {
  switch (a.type) {
    case "apply": {
      const next = a.fn(s.board);
      if (next === s.board) return s;
      return a.record ? { board: next, past: [...s.past, s.board].slice(-LIMIT), future: [] } : { ...s, board: next };
    }
    case "undo": {
      const prev = s.past[s.past.length - 1];
      return prev ? { board: prev, past: s.past.slice(0, -1), future: [s.board, ...s.future] } : s;
    }
    case "redo": {
      const [next, ...rest] = s.future;
      return next ? { board: next, past: [...s.past, s.board], future: rest } : s;
    }
  }
}

/** Board state with undo/redo. `commit` records history; `edit` (typing) does not. */
export function useBoard(initial: () => Board) {
  const [s, dispatch] = useReducer(reducer, undefined, () => ({ board: initial(), past: [], future: [] }));
  const commit = useCallback((fn: (b: Board) => Board) => dispatch({ type: "apply", fn, record: true }), []);
  const edit = useCallback((fn: (b: Board) => Board) => dispatch({ type: "apply", fn, record: false }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  return { board: s.board, commit, edit, undo, redo, canUndo: s.past.length > 0 };
}
