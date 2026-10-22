/** Message bubbles in the thread. */

export function AiMessage({ text }: { text: string }) {
  return (
    <div className="ch-msg ch-ai">
      <div className="ch-who">docbuilder</div>
      <div>{text}</div>
    </div>
  );
}

/** The user's answer. Clickable to change it while still asking; a sparkle pops when it lands. */
export function UserMessage({ text, onEdit }: { text: string; onEdit?: () => void }) {
  return (
    <button type="button" className="ch-msg ch-mine" onClick={onEdit} aria-label={onEdit ? `Change your answer: ${text}` : text} data-editable={onEdit ? true : undefined}>
      {text}
      <img className="ch-pop" src="/assets/sparkle-orange.svg" alt="" />
      {onEdit && <span className="ch-edit" aria-hidden="true">edit</span>}
    </button>
  );
}

/** Small-talk reply with a sticker slapped next to it. */
export function EggMessage({ img, text }: { img: string; text: string }) {
  return (
    <div className="ch-msg ch-egg">
      <img className="ch-slap" src={img} alt="" />
      <div><div className="ch-who">docbuilder</div>{text}</div>
    </div>
  );
}
