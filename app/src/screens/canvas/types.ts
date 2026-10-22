export type Tool = "select" | "hand" | "pen" | "hl" | "note" | "sticker" | "erase";
export type NoteColor = "yellow" | "peach" | "green" | "blue";
export type Pt = [number, number];

export interface Note { id: string; x: number; y: number; color: NoteColor; rot: number; text: string; byAI?: boolean }
export interface PlacedSticker { id: string; src: string; x: number; y: number; w: number; rot: number }
export interface Stroke { id: string; kind: "pen" | "hl"; pts: Pt[] }

/** Everything the user put on the canvas. Undo history stores snapshots of this. */
export interface Board { notes: Note[]; stickers: PlacedSticker[]; strokes: Stroke[] }

export interface Camera { zoom: number; px: number; py: number }

/** Imperative camera controls the viewport exposes to the panels around it. */
export interface CameraApi {
  zoomBy: (factor: number) => void;
  fit: () => void;
  goPage: (i: number) => void;
}

export const NOTE_COLORS: Record<NoteColor, [string, string]> = {
  yellow: ["#fbe97a", "#f7df5a"],
  peach: ["#f6c08a", "#f0b071"],
  green: ["#c6ee9c", "#b5e283"],
  blue: ["#cfe0f6", "#bcd2f0"],
};

export const TRAY = [
  { label: "RFI sticker", src: "/assets/rfi.svg", w: 120 },
  { label: "Measure twice sticker", src: "/assets/measure-twice.svg", w: 220 },
  { label: "Hard hat sticker", src: "/assets/hard-hat-eyes.svg", w: 130 },
  { label: "Smiley sticker", src: "/assets/smiley.svg", w: 100 },
  { label: "Spec checked sticker", src: "/assets/specd-signed.svg", w: 150 },
  { label: "Tape measure sticker", src: "/assets/tool-tape-measure.png", w: 140 },
] as const;

export const HINTS: Partial<Record<Tool, string>> = {
  pen: "Sketchpen: draw anywhere",
  hl: "Highlighter: drag over text, then ask docbuilder",
  note: "Click anywhere to drop a sticky note",
  sticker: "Pick a sticker, then click to place it",
  erase: "Click a note, sticker or line to remove it",
  hand: "Drag to move around",
};
