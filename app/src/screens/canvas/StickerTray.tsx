import { TRAY } from "./types";

export function StickerTray({ picked, onPick }: { picked: number; onPick: (i: number) => void }) {
  return (
    <div className="cv-tray" role="group" aria-label="Pick a sticker" onPointerDown={(e) => e.stopPropagation()}>
      {TRAY.map((t, i) => (
        <button key={t.src} type="button" aria-label={t.label} aria-pressed={picked === i} onClick={() => onPick(i)}>
          <img src={t.src} alt="" />
        </button>
      ))}
    </div>
  );
}
