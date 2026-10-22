import type { FormEvent } from "react";

interface Props { text: string; placeholder: string; onText: (v: string) => void; onSend: () => void; idPrefix?: string }

/** Sticky underline composer: paperclip for a soil report or an old SR, text field, send. */
export function Composer({ text, placeholder, onText, onSend, idPrefix = "ch" }: Props) {
  const inputId = `${idPrefix}-msg-input`;
  const submit = (e: FormEvent) => { e.preventDefault(); onSend(); };
  return (
    <form onSubmit={submit} className="ch-composer">
      <button type="button" className="ch-clip" aria-label="Attach a file, like a soil report or an old SR" title="Attach a soil report or an old SR">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M13.5 6.5 L7.6 12.4 A1.8 1.8 0 0 0 10.1 14.9 L16 9 A3.4 3.4 0 0 0 11.2 4.2 L5.1 10.3 A5 5 0 0 0 12.2 17.4 L16.4 13.2" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <label htmlFor={inputId} className="sr-only">Message</label>
      <input id={inputId} className="ch-input" type="text" value={text} onChange={(e) => onText(e.target.value)} placeholder={placeholder} autoComplete="off" />
      <button type="submit" className="ch-box ch-box--ink">send</button>
    </form>
  );
}
