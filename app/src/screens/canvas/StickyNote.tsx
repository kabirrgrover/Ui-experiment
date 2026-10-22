import { memo } from "react";
import { NOTE_COLORS, type Note } from "./types";

interface Props { note: Note; selected: boolean; autoFocus?: boolean; onText: (id: string, text: string) => void }

export const StickyNote = memo(function StickyNote({ note, selected, autoFocus, onText }: Props) {
  const [paper, band] = NOTE_COLORS[note.color];
  return (
    <div
      className={`cv-note cv-placed${selected ? " is-selected" : ""}`}
      data-note={note.id}
      style={{ left: note.x, top: note.y, background: paper, ["--r" as string]: `${note.rot}deg` }}
    >
      <div className="cv-note__band cv-grab" data-notehandle={note.id} aria-label="Drag note" style={{ background: band }} />
      <div className="cv-note__pin" aria-hidden="true" />
      <div className="cv-note__body">
        <label htmlFor={`note-${note.id}`} className="sr-only">Note text</label>
        <textarea id={`note-${note.id}`} value={note.text} onChange={(e) => onText(note.id, e.target.value)} placeholder="write a note…" autoFocus={autoFocus} />
      </div>
      {note.byAI && <span className="cv-note__by">docbuilder</span>}
    </div>
  );
});
