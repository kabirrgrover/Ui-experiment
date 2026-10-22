import { useState } from "react";

/**
 * Company logo slot. Drop the official file at /public/brand/bechtel-logo.svg (or .png)
 * and it appears; until then nothing renders. Never redraw the logo.
 */
const SOURCES = ["/brand/bechtel-logo.svg", "/brand/bechtel-logo.png"];

export function BrandLogo({ height = 22 }: { height?: number }) {
  const [i, setI] = useState(0);
  if (i >= SOURCES.length) return null;
  return (
    <img
      src={SOURCES[i]}
      alt="Bechtel"
      className="db-brandlogo"
      style={{ height, width: "auto" }}
      onError={() => setI((n) => n + 1)}
    />
  );
}
