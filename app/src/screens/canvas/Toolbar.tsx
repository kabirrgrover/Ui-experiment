import type { Tool } from "./types";

const ICONS: Record<Tool, string> = {
  select: "M5 3 L5 19 L9.5 14.5 L12.5 21 L15 20 L12 13.5 L18 13.5 Z",
  hand: "M8 13 V6 A1.5 1.5 0 0 1 11 6 V12 M11 11 V4.5 A1.5 1.5 0 0 1 14 4.5 V12 M14 11.5 V6 A1.5 1.5 0 0 1 17 6 V14 C17 18 15 21 11 21 C8 21 6.5 19.5 5 17 L3.6 14.4 A1.5 1.5 0 0 1 6.2 12.9 L8 15",
  pen: "M4 20 L8 19 L19 8 L16 5 L5 16 Z M14 7 L17 10",
  hl: "M9 15 L5 19 H10 L12 17 M9 15 L16 4 L20 7 L13 18 Z",
  note: "M5 4 H19 V14 L14 20 H5 Z M14 20 V14 H19",
  sticker: "M12 3 A9 9 0 1 0 21 12 L21 12 A9 9 0 0 1 12 3 Z M21 12 C17 12 12 11 12 3",
  erase: "M4 15 L13 6 L19 12 L12 19 H7 Z M9 10 L15 16 M7 19 H20",
};

export const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "select", label: "Select and move", key: "V" },
  { id: "hand", label: "Hand, pan around", key: "H" },
  { id: "pen", label: "Sketchpen", key: "P" },
  { id: "hl", label: "Highlighter", key: "Y" },
  { id: "note", label: "Sticky note", key: "N" },
  { id: "sticker", label: "Stickers", key: "S" },
  { id: "erase", label: "Eraser", key: "E" },
];

export function Toolbar({ tool, onPick }: { tool: Tool; onPick: (t: Tool) => void }) {
  return (
    <div role="toolbar" aria-label="Tools" className="cv-toolbar" onPointerDown={(e) => e.stopPropagation()}>
      {TOOLS.map((t) => (
        <button key={t.id} type="button" className="cv-tool" aria-label={t.label} title={`${t.label} (${t.key})`} aria-pressed={tool === t.id} onClick={() => onPick(t.id)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[t.id]} /></svg>
          <span className="cv-key" aria-hidden="true">{t.key}</span>
        </button>
      ))}
    </div>
  );
}
