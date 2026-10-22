import { useState, type FormEvent } from "react";

export function AskBar({ onAsk }: { onAsk: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    onAsk(t);
  };
  return (
    <form className="cv-askbar" onSubmit={submit} onPointerDown={(e) => e.stopPropagation()}>
      <label htmlFor="cv-ask" className="sr-only">Ask docbuilder</label>
      <input id="cv-ask" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="ask docbuilder to change something…" />
      <button type="submit" className="cv-box cv-box--ink">ask</button>
    </form>
  );
}
