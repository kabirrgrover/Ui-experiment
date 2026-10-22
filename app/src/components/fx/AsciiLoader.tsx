import { useEffect, useState } from "react";
import "./fx.css";

/** Shown while a screen's code loads: a tiny ASCII crane lifting a block. */
const FRAMES = [0, 1, 2, 3, 2, 1];

export function AsciiLoader() {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setF((n) => (n + 1) % FRAMES.length), 160);
    return () => clearInterval(t);
  }, []);
  const h = FRAMES[f];
  const rope = ["        |", "        |", "        |"].slice(0, 3 - h).join("\n");
  const art = [" ____________", " |/\\/\\/\\/|", rope, "       [#]", " |      ", "_|________"].filter(Boolean).join("\n");
  return (
    <div className="fx-loader" role="status">
      <pre aria-hidden="true">{art}</pre>
      <span className="sr-only">Loading</span>
    </div>
  );
}
