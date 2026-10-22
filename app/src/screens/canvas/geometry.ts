import type { Pt } from "./types";

/** Smooth a pointer trail with quadratic curves through midpoints. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  const f = (n: number) => n.toFixed(1);
  if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`).join(" ");
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${f(last[0])} ${f(last[1])}`;
}

/** The hand-drawn loop around "Class D" (clause 4.1) in the seeded mockup. */
export function seededCircle(): Pt[] {
  const out: Pt[] = [];
  for (let k = 0; k <= 40; k++) {
    const a = -2.6 + (k / 40) * 6.9;
    out.push([2040 + Math.cos(a) * 56 * (1 + k * 0.004), 300 + Math.sin(a) * 18]);
  }
  return out;
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
