// Fig 3 · Anatomy of AI DocBuilder: one drafting workbench whose modules are the product's parts.
// node build.mjs            -> writes light and dark outputs
// Modules (stable ids, used by the front end for hover highlight):
//   questions  card feeder        guided questions feed the job
//   sources    drawer cabinet     standards, past SRs, drawings, vendor docs, procedures, templates
//   drafting   gantry plotter     writes the document section by section (the lit pen)
//   checks     dial gauge         reasoning and checks, the needle reads confidence
//   review     stamp arm          review and approval stamp
//   folders    out-tray + folder  finished docs filed into folders
//   canvas     markup table       pen, highlighter and sticky notes for edits
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../anatomy/kit/iso-kit.mjs";
import * as G from "../../anatomy/kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 640, H = 420;

const PLATE = { x: -184, y: -112, w: 362, d: 204, r: 10 };
const P = k.fitProjection([...k.boxCorners(PLATE, -16, 0), [-170, -100, 74], [-60, -100, 64], [10, -60, 66], [130, -80, 60], [130, -10, 70]], W, H, { pad: 26, azimuth: 38 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const box = (x, y, z, w, d, h, r = 0.6, steps = 2, bevel = 0) => k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], a[2] ?? 0], P) - k.depthOf([b[0], b[1], b[2] ?? 0], P));
const screws = (plan, inset, z) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size: 0.45 });

// world extents per module, used for hover bboxes and ordering
const MODS = {
  sources: { label: "Sources", desc: "Drawers of standards, past SRs, drawings, vendor docs, procedures and templates the AI reads from.", box: [-170, -104, 0, 70, 54, 72] },
  questions: { label: "Guided questions", desc: "Card feeder: each answer card feeds the job and decides which sections go in.", box: [-90, -102, 0, 44, 46, 62] },
  drafting: { label: "Drafting engine", desc: "Gantry plotter that writes the document section by section. The lit pen is what is being written now.", box: [-40, -86, 0, 134, 128, 66] },
  checks: { label: "Checks & reasoning", desc: "Dial gauge on the fence: the needle reads how sure the draft is against its sources.", box: [118, -104, 0, 40, 40, 58] },
  review: { label: "Review stamp", desc: "Stamp arm that marks a finished draft for review, approved or on hold.", box: [112, -48, 0, 56, 52, 70] },
  folders: { label: "Folders", desc: "Out-tray where finished pages stack, then slide into a pastel folder.", box: [44, 30, 0, 128, 60, 34] },
  canvas: { label: "Canvas", desc: "Markup table with a pen, a highlighter and sticky notes for editing the draft.", box: [-176, -36, 0, 116, 120, 30] },
};

function base() {
  const o = [`<path class="iso-halo" d="${k.haloOf(PLATE, -16, 12, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 26))) {
    o.push(S(k.cylinder(x, y, 9, -16, 1.6, P, 28), { tone: "lo" }));
    o.push(S(k.cylinder(x, y, 7, -14.4, 2.4, P, 28), { tone: "mid" }));
  }
  o.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -6, P, 8), { tone: "faint" }) }));
  o.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const sc = k.corners(PLATE, 12);
  o.push(L(sc.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  o.push(D(sc.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge
  const rs = { x: -52, y: PLATE.y + PLATE.d - 12, w: 92, d: 7, r: 0.6 };
  o.push(S(k.slabOf(rs, 0, 0.8, P, 2, 0.3), { tone: "mid" }));
  const t = k.topTicks(rs.x + 4, rs.x + rs.w - 4, 4, 5, rs.y + 0.6, 0.8, [1.8, 3.4], P, "x");
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // label plate front right
  const lab = { x: 58, y: PLATE.y + 5, w: 46, d: 12, r: 1.2 };
  o.push(S(k.slabOf(lab, 0, 0.8, P, 3, 0.4), { tone: "mid" }));
  [3.6, 6.4, 9].forEach((dy, i) => o.push(L(k.lineOnTop([lab.x + 4, lab.y + dy], [lab.x + (i === 2 ? 22 : 38), lab.y + dy], 0.8, P), { tone: "faint", free: true })));
  o.push(screws(lab, 1.6, 0.8));
  // grooves that mark the work zones
  o.push(L(k.planOutline({ x: -46, y: -92, w: 146, d: 140, r: 3 }, 0, P, 3), { tone: "faint" }));
  return o.join("");
}

// ---------- sources: a cabinet of six drawers, two columns, fronts on the +y face ----------
function sources() {
  const [x, y, , w, d, h] = MODS.sources.box;
  const o = [];
  o.push(S(box(x, y, 0, w, d, 4, 1, 2, 0.4), { tone: "lo" }));                 // plinth
  o.push(S(box(x + 2, y + 2, 4, w - 4, d - 4, h - 8, 1, 2, 0.6), { tone: "mid", inner: L(k.sideSeam({ x: x + 2, y: y + 2, w: w - 4, d: d - 4, r: 1 }, h - 12, P, 2), { tone: "faint" }) }));
  o.push(S(box(x, y, h - 4, w, d, 4, 1.2, 2, 0.5), { tone: "mid" }));          // top cap
  o.push(screws({ x, y, w, d }, 3, h));
  const fy = y + d - 2;                                                       // drawer fronts stand proud of the face
  const colW = (w - 12) / 2, rowH = (h - 18) / 3;
  const dr = [];
  for (let c = 0; c < 2; c++) for (let r = 2; r >= 0; r--) dr.push([x + 4 + c * (colW + 4), 8 + r * (rowH + 2)]);
  for (const [dx, , dz] of byDepth(dr.map(([a, b]) => [a, fy, b])).filter(([a, , b]) => !(a > x + colW && b > 8 + 1.5 * (rowH + 2)))) {
    o.push(S(box(dx, fy, dz, colW, 3, rowH, 0.5, 2, 0.3), { tone: "hi" }));
    // label card holder and pull on each drawer face
    const z = dz + rowH * 0.62, cx = dx + colW / 2;
    o.push(L(k.segment([cx - 7, fy + 3, z], [cx + 7, fy + 3, z], P) + k.segment([cx - 7, fy + 3, z + 4], [cx + 7, fy + 3, z + 4], P) + k.segment([cx - 7, fy + 3, z], [cx - 7, fy + 3, z + 4], P) + k.segment([cx + 7, fy + 3, z], [cx + 7, fy + 3, z + 4], P), { tone: "lo" }));
    o.push(S(box(cx - 4, fy + 3, dz + 3, 8, 2, 2.4, 0.4), { tone: "mid" }));
  }
  // one drawer pulled open, index cards standing in it (the source being read)
  const ox = x + 4 + colW + 4, oz = 8 + 2 * (rowH + 2);
  o.push(S(box(ox, fy + 3, oz + 1, colW, 14, rowH - 6, 0.4, 2, 0.2), { tone: "mid" }));
  for (let i = 0; i < 4; i++) o.push(S(box(ox + 3 + i * 0.4, fy + 5 + i * 2.6, oz + 2, colW - 6, 0.8, rowH - 3 - (i % 2) * 1.5, 0.2), { tone: "hi", crease: "none" }));
  return o.join("");
}

// ---------- questions: card feeder with a stacked hopper and a feed roller ----------
function questions() {
  const [x, y, , w, d] = MODS.questions.box;
  const o = [];
  o.push(S(box(x, y, 0, w, d, 30, 1.2, 2, 0.6), { tone: "mid", inner: L(k.sideSeam({ x, y, w, d, r: 1.2 }, 8, P, 2), { tone: "faint" }) }));
  o.push(screws({ x, y, w, d }, 3, 30));
  // hopper walls
  o.push(S(box(x + 4, y + 4, 30, 3, d - 14, 26, 0.4), { tone: "mid" }));
  o.push(S(box(x + 4, y + 4, 30, w - 8, 3, 26, 0.4), { tone: "mid" }));
  // card stack: answers waiting to feed
  for (let i = 0; i < 9; i++) o.push(S(box(x + 8 + (i % 3) * 0.3, y + 8, 30 + i * 2.2, w - 16, d - 20, 1.4, 0.3, 2), { tone: "hi", crease: "none" }));
  o.push(L(k.lineOnTop([x + 12, y + 14], [x + 30, y + 14], 30 + 9 * 2.2 - 0.8, P) + k.lineOnTop([x + 12, y + 19], [x + 24, y + 19], 30 + 9 * 2.2 - 0.8, P), { tone: "faint", free: true }));
  o.push(S(box(x + w - 7, y + 4, 30, 3, d - 14, 26, 0.4), { tone: "mid" }));
  // feed roller across the mouth, along x, with end bearings
  const F = G.frameAlong([x + 2, y + d - 6, 34], [1, 0, 0]);
  o.push(S(G.disc(0, w - 4, 3.6, F, P), { tone: "hi", crease: "lo" }));
  o.push(S(G.disc(-3, 0, 2, F, P), { tone: "mid" }), S(G.disc(w - 4, w - 1, 2, F, P), { tone: "mid" }));
  // one card leaving the roller, on its way to the plotter
  o.push(S(k.extrude([[x + 10, y + d - 2], [x + w - 10, y + d - 2], [x + w - 10, y + d + 10], [x + 10, y + d + 10]], 30.5, 0.6, P), { tone: "hi", crease: "none" }));
  // counter knob on the side
  o.push(S(k.cylinder(x + w - 8, y + d - 10, 4, 30, 4, P, 24), { tone: "mid" }));
  o.push(L(k.knurl(x + w - 8, y + d - 10, 4, 30.4, 33.6, 18, P), { tone: "lo" }));
  return o.join("");
}

// ---------- drafting: a flatbed plotter with gantry and the lit pen ----------
const BED = { x: -36, y: -82, w: 126, d: 120, r: 3 }, BZ = 10, GZ = 52, RX = [-30, 76];
const SHEET = { x: -10, y: -66, w: 66, d: 88, r: 0.4 };
function drafting() {
  const o = [];
  o.push(S(k.slabOf(BED, 0, BZ, P, 3, 0.8), { tone: "mid", inner: L(k.sideSeam(BED, 4, P, 3), { tone: "faint" }) }));
  const pts = [];
  for (let x = BED.x + 8; x < BED.x + BED.w - 6; x += 8) for (let y = BED.y + 8; y < BED.y + BED.d - 6; y += 8)
    if (!(x > SHEET.x - 3 && x < SHEET.x + SHEET.w + 3 && y > SHEET.y - 3 && y < SHEET.y + SHEET.d + 3) && !RX.some((r) => x > r - 2 && x < r + 10)) pts.push(at([x, y, BZ]));
  o.push(D(pts, { size: 0.32, tone: "lo" }));
  for (const x of RX) {
    o.push(S(box(x, BED.y + 4, BZ, 8, BED.d - 8, 3, 0.6, 2, 0.4), { tone: "mid" }));
    const t = k.topTicks(BED.y + 8, BED.y + BED.d - 8, 4, 5, x + 0.6, BZ + 3, [1.6, 3], P, "y");
    o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  }
  o.push(S(k.slabOf(SHEET, BZ, 0.5, P, 2), { tone: "hi", crease: "none" }));
  // clauses already written
  const z = BZ + 0.55, x0 = SHEET.x + 6, x1 = SHEET.x + SHEET.w - 6, R = [];
  R.push(k.lineOnTop([x0, SHEET.y + 8], [x0 + 30, SHEET.y + 8], z, P));
  for (let i = 0; i < 8; i++) R.push(k.lineOnTop([x0 + (i % 4 === 0 ? 0 : 4), SHEET.y + 18 + i * 6], [x1 - (i % 3 === 2 ? 16 : 0), SHEET.y + 18 + i * 6], z, P));
  R.push(k.planOutline({ x: SHEET.x + SHEET.w - 28, y: SHEET.y + SHEET.d - 12, w: 22, d: 8, r: 0 }, z, P, 1));
  o.push(L(R.join(""), { tone: "lo", free: true }));
  for (const [x, y] of byDepth(k.corners(SHEET, 0))) o.push(S(box(x - 3, y - 3, BZ + 0.5, 6, 6, 1.2, 0.6), { tone: "mid" }));
  // gantry parked at the written line
  const gy = SHEET.y + 52;
  for (const x of RX) {
    o.push(S(box(x - 1, gy - 6, BZ + 3, 10, 12, 6, 0.8, 2, 0.4), { tone: "mid" }));
    o.push(S(box(x + 1, gy - 4, BZ + 9, 6, 8, GZ - BZ - 9, 0.6, 2, 0.3), { tone: "mid" }));
  }
  const beam = { x: RX[0] - 2, y: gy - 6, w: RX[1] - RX[0] + 12, d: 12, r: 0.8 };
  o.push(S(k.slabOf(beam, GZ, 8, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(beam, GZ + 4, P, 2), { tone: "faint" }) }));
  o.push(D([RX[0] + 4, RX[1] + 4].map((x) => at([x, gy + 6, GZ + 4])), { size: 0.5 }));
  o.push(S(k.cylinder(RX[1] + 4, gy, 4.6, GZ + 8, 7, P, 24), { tone: "mid" }));
  o.push(L(k.knurl(RX[1] + 4, gy, 4.6, GZ + 9, GZ + 14, 20, P), { tone: "faint" }));
  // carriage and pen
  const cx = SHEET.x + 40;
  o.push(S(box(cx - 8, gy + 4, GZ - 2, 16, 8, 14, 1, 2, 0.4), { tone: "mid" }));
  o.push(D([[cx - 5, GZ + 9], [cx + 5, GZ + 9]].map(([x, zz]) => at([x, gy + 12, zz])), { size: 0.5 }));
  o.push(S(k.cylinder(cx, gy + 8, 3, GZ - 8, 6, P, 18), { tone: "mid" }));
  o.push(S(k.cylinder(cx, gy + 8, 1.6, BZ + 1.4, GZ - 8 - BZ - 1.4, P, 14), { tone: "hi", lit: true, crease: "none" }));
  o.push(D([at([cx, gy + 8, BZ + 0.6])], { size: 1, tone: "lit" }));
  return o.join("");
}

// ---------- checks: a dial gauge face up on a column, needle on the reading ----------
function checks() {
  const [x, y] = MODS.checks.box;
  const cx = x + 20, cy = y + 20;
  const o = [];
  o.push(S(box(x + 4, y + 4, 0, 32, 32, 6, 1.2, 2, 0.6), { tone: "lo" }));
  o.push(screws({ x: x + 4, y: y + 4, w: 32, d: 32 }, 3, 6));
  o.push(S(k.cylinder(cx, cy, 4, 6, 30, P, 20), { tone: "mid" }));
  o.push(S(k.cylinder(cx, cy, 6, 34, 4, P, 24), { tone: "mid" }));          // clamp collar
  o.push(L(k.knurl(cx, cy, 6, 34.4, 37.6, 20, P), { tone: "faint" }));
  o.push(S(k.cylinder(cx, cy, 17, 38, 9, P, 48, 0.6), { tone: "mid" }));    // bezel
  o.push(S(k.slabOf({ x: cx - 15, y: cy - 15, w: 30, d: 30, r: 15 }, 47, 0.3, P, 40), { tone: "hi", crease: "none" }));
  const t = k.radialTicks(cx, cy, 14, 40, 5, 47.3, [1.4, 2.8], P);
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  const a = 0.78 * Math.PI * 2;
  o.push(L(k.lineOnTop([cx - Math.sin(a) * 3, cy + Math.cos(a) * 3], [cx + Math.sin(a) * 12.6, cy - Math.cos(a) * 12.6], 47.6, P), { tone: "hi" }));
  o.push(S(k.cylinder(cx, cy, 1.4, 47.3, 0.8, P, 12), { tone: "mid" }));
  // stem nut where the dial meets the column
  o.push(S(box(cx - 3, cy + 15, 40, 6, 3, 5, 0.4), { tone: "mid" }));
  return o.join("");
}

// ---------- review: stamp arm on a pillar, stamp head over an ink pad and a page ----------
function review() {
  const [x, y] = MODS.review.box;
  const o = [];
  const px = x + 44, py = y + 10;                               // pillar at the back right
  const hx = x + 18, hy = y + 34;                               // stamp head over the pad
  o.push(S(box(x + 2, y + 20, 0, 34, 30, 3, 0.8, 2, 0.4), { tone: "lo" }));          // stamping plate
  o.push(screws({ x: x + 2, y: y + 20, w: 34, d: 30 }, 2.4, 3));
  o.push(S(box(hx - 10, hy - 8, 3, 20, 16, 0.6, 0.3), { tone: "hi", crease: "none" })); // page being stamped
  o.push(L(k.lineOnTop([hx - 7, hy - 4], [hx + 6, hy - 4], 3.65, P) + k.lineOnTop([hx - 7, hy], [hx + 2, hy], 3.65, P), { tone: "faint", free: true }));
  o.push(S(box(px - 9, py - 9, 0, 18, 18, 6, 1, 2, 0.5), { tone: "mid" }));
  o.push(screws({ x: px - 9, y: py - 9, w: 18, d: 18 }, 2.6, 6));
  o.push(S(k.cylinder(px, py, 4, 6, 52, P, 20), { tone: "mid" }));
  o.push(S(k.cylinder(px, py, 5.6, 54, 7, P, 24), { tone: "mid" }));
  o.push(L(k.knurl(px, py, 5.6, 54.4, 60.6, 20, P), { tone: "faint" }));
  // arm from the pillar head across to above the stamp, along -x then +y
  o.push(S(box(hx - 3, py - 3, 56, px - hx, 6, 5, 0.6, 2, 0.3), { tone: "mid" }));
  o.push(S(box(hx - 3, py - 3, 56, 6, hy - py + 3, 5, 0.6, 2, 0.3), { tone: "mid" }));
  o.push(D([at([hx + 6, py, 61]), at([px - 8, py, 61])], { size: 0.45 }));
  // stem, handle and rubber block hovering just above the page
  o.push(S(k.cylinder(hx, hy, 1.8, 26, 30, P, 14), { tone: "mid" }));
  o.push(S(box(hx - 9, hy - 7, 14, 18, 14, 12, 0.8, 2, 0.4), { tone: "hi" }));
  o.push(S(box(hx - 8, hy - 6, 10, 16, 12, 4, 0.4), { tone: "lo" }));
  o.push(S(k.cylinder(hx, hy, 5, 61, 4, P, 24), { tone: "mid" }));
  o.push(L(k.knurl(hx, hy, 5, 61.4, 64.6, 20, P), { tone: "faint" }));
  return o.join("");
}

// ---------- folders: out-tray of finished pages next to a folder with pages filed in it ----------
function folders() {
  const [x, y] = MODS.folders.box;
  const o = [];
  const T = { x: x + 84, y: y + 2, w: 40, d: 50, r: 2 };
  o.push(S(k.slabOf(T, 0, 4, P, 3, 0.6), { tone: "mid" }));
  o.push(S(box(T.x, T.y, 4, T.w, 3, 10, 0.6), { tone: "mid" }));
  o.push(S(box(T.x, T.y, 4, 3, T.d, 10, 0.6), { tone: "mid" }));
  for (let i = 0; i < 7; i++) {
    const p = { x: T.x + 6 + ((i * 37) % 5) * 0.4, y: T.y + 6 + ((i * 23) % 5) * 0.4, w: 30, d: 38, r: 0.3 };
    o.push(S(k.slabOf(p, 4 + i * 1.1, 0.9, P, 2), { tone: "hi", crease: "none" }));
  }
  o.push(L(k.lineOnTop([T.x + 12, T.y + 14], [T.x + 30, T.y + 14], 4 + 7 * 1.1 - 0.2, P), { tone: "faint", free: true }));
  // folder lying flat: back leaf with a tab, three filed pages sticking out, front leaf on top
  const F = { x: x + 8, y: y + 20, w: 50, d: 34, r: 1.6 };
  o.push(S(k.slabOf(F, 0, 1.2, P, 3, 0.3), { tone: "mid" }));
  o.push(S(k.slabOf({ x: F.x + F.w - 18, y: F.y + F.d - 1, w: 14, d: 5, r: 1.4 }, 0, 1.2, P, 3), { tone: "mid" }));
  for (let i = 0; i < 3; i++) o.push(S(k.slabOf({ x: F.x + 4 + i * 3, y: F.y - 6 + i * 1.5, w: F.w - 10, d: F.d - 4, r: 0.2 }, 1.2 + i * 0.6, 0.5, P, 2), { tone: "hi", crease: "none" }));
  o.push(S(k.slabOf({ x: F.x, y: F.y + 3, w: F.w, d: F.d - 3, r: 1.6 }, 3.2, 1.2, P, 3, 0.3), { tone: "hi" }));
  o.push(L(k.lineOnTop([F.x + 6, F.y + 12], [F.x + 26, F.y + 12], 4.4, P), { tone: "lo", free: true }));
  return o.join("");
}

// ---------- canvas: a markup table with a page, sticky notes, a pen and a highlighter ----------
function canvas() {
  const [x, y, , w, d] = MODS.canvas.box;
  const T = { x, y, w, d, r: 2 };
  const o = [];
  for (const [lx, ly] of byDepth(k.corners(T, 6))) o.push(S(box(lx - 3, ly - 3, 0, 6, 6, 16, 0.6, 2, 0.3), { tone: "lo" }));
  o.push(S(k.slabOf(T, 16, 5, P, 3, 0.8), { tone: "mid", inner: L(k.sideSeam(T, 18.5, P, 3), { tone: "faint" }) }));
  o.push(screws(T, 4, 21));
  const pg = { x: x + 22, y: y + 14, w: 58, d: 74, r: 0.3 };
  o.push(S(k.slabOf(pg, 21, 0.5, P, 2), { tone: "hi", crease: "none" }));
  const z = 21.6, R = [];
  for (let i = 0; i < 9; i++) R.push(k.lineOnTop([pg.x + 6, pg.y + 10 + i * 6.5], [pg.x + pg.w - 6 - (i % 3 === 1 ? 14 : 0), pg.y + 10 + i * 6.5], z, P));
  o.push(L(R.join(""), { tone: "lo", free: true }));
  // highlight band and a hand circle on the page
  o.push(S(k.slabOf({ x: pg.x + 4, y: pg.y + 29.5, w: 34, d: 4, r: 1 }, 21.55, 0.15, P, 2), { tone: "lo", crease: "none", flat: true }));
  o.push(L(k.ring(pg.x + 40, pg.y + 49, 6, 21.7, P, 28), { tone: "mid" }));
  // sticky notes stuck at the edge
  o.push(S(box(pg.x + pg.w - 8, pg.y - 6, 21.5, 18, 18, 0.8, 0.3), { tone: "hi" }));
  o.push(S(box(x + 4, y + 50, 21, 16, 16, 0.8, 0.3), { tone: "hi" }));
  o.push(L(k.lineOnTop([pg.x + pg.w - 4, pg.y], [pg.x + pg.w + 6, pg.y], 22.4, P) + k.lineOnTop([x + 7, y + 56], [x + 16, y + 56], 21.9, P), { tone: "faint", free: true }));
  // pen lying along y on the right of the page, and a highlighter along x at the front
  const Fp = G.frameAlong([x + w - 14, y + 18, 23.2], [0, 1, 0]);
  o.push(S(G.disc(0, 52, 2, Fp, P), { tone: "hi", crease: "lo" }));
  o.push(S(G.disc(52, 58, 1.2, Fp, P), { tone: "mid" }));
  o.push(S(G.disc(-6, 0, 2.2, Fp, P), { tone: "mid" }));
  const Fh = G.frameAlong([x + 20, y + d - 8, 23.6], [1, 0, 0]);
  o.push(S(G.disc(0, 30, 2.6, Fh, P), { tone: "mid", crease: "lo" }));
  o.push(S(G.disc(30, 38, 2.8, Fh, P), { tone: "hi" }));
  return o.join("");
}

// ---------- cables: feeder and cabinet to the plotter, plotter to the gauge ----------
function cables() {
  return [
    k.wireSvg(at([-52, -70, 12]), at([BED.x, -60, 6]), { via: [at([-44, -66, 6])], tone: "lo" }),
    k.wireSvg(at([-112, -60, 20]), at([BED.x, -30, 6]), { via: [at([-80, -42, 4]), at([-50, -34, 4])], tone: "lo" }),
    k.wireSvg(at([BED.x + BED.w, -70, 6]), at([122, -80, 3]), { via: [at([106, -76, 2])], tone: "lo" }),
  ].join("");
}

const BUILD = { sources, questions, drafting, checks, review, folders, canvas };
const center = (id) => { const [x, y, z, w, d, h] = MODS[id].box; return k.depthOf([x + w / 2, y + d / 2, z + h / 2], P); };
const ORDER = Object.keys(MODS).sort((a, b) => center(a) - center(b));

const bboxOf = (id) => {
  const [x, y, z, w, d, h] = MODS[id].box;
  const pts = k.boxCorners({ x, y, w, d }, z, z + h).map((p) => at(p));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const r = (v) => Math.round(v * 10) / 10;
  return { x: r(Math.min(...xs)), y: r(Math.min(...ys)), w: r(Math.max(...xs) - Math.min(...xs)), h: r(Math.max(...ys) - Math.min(...ys)) };
};

const group = (id) => `<g data-part="${id}" data-module="${id}">${BUILD[id]()}</g>`;
const body = [base(), `<g data-part="cables">${cables()}</g>`, ...ORDER.map(group)];
const LABEL = "Anatomy of AI DocBuilder: one drafting workbench. A card feeder of guided questions and a cabinet of sources feed a plotter that writes the document; a dial gauge checks it, a stamp arm reviews it, finished pages stack into a folder, and a markup table holds the canvas.";

const json = {
  title: "Anatomy of AI DocBuilder", width: W, height: H, order: ORDER,
  modules: Object.keys(MODS).map((id) => ({ id, label: MODS[id].label, description: MODS[id].desc, bbox: bboxOf(id), layers: { light: `parts-${id}.svg`, dark: `parts-${id}-dark.svg` } })),
  base: { light: "parts-base.svg", dark: "parts-base-dark.svg" },
  composed: { light: "parts.svg", dark: "parts-dark.svg" },
  stacking: "Draw parts-base first, then the module layers in `order` (back to front). All layers share the same viewBox.",
};

for (const theme of ["light", "dark"]) {
  const sfx = theme === "light" ? "" : "-dark";
  writeFileSync(join(HERE, `parts${sfx}.svg`), k.figureSvg({ width: W, height: H, standalone: theme, label: LABEL, body }));
  writeFileSync(join(HERE, `parts-base${sfx}.svg`), k.figureSvg({ width: W, height: H, standalone: theme, label: "Base plate and cables.", body: [base(), `<g data-part="cables">${cables()}</g>`] }));
  for (const id of ORDER) writeFileSync(join(HERE, `parts-${id}${sfx}.svg`), k.figureSvg({ width: W, height: H, standalone: theme, label: MODS[id].label, body: [group(id)] }));
  const live = `
const M = ${JSON.stringify(json.modules.map(({ id, label, description }) => ({ id, label, description })))};
const s = document.querySelector('.iso-stage svg'), out = document.querySelector('[data-readout]');
const show = (id) => { s.querySelectorAll('[data-module]').forEach(g => g.style.opacity = !id || g.dataset.module === id ? 1 : .28); const m = M.find(m => m.id === id); out.textContent = m ? m.label : '7 parts'; };
s.querySelectorAll('[data-module]').forEach(g => { g.style.transition = 'opacity 200ms ease'; g.addEventListener('pointerenter', () => show(g.dataset.module)); g.addEventListener('pointerleave', () => show(null)); });
const q = new URLSearchParams(location.search).get('m'); show(q);
`;
  const page = k.pageHtml({ title: "Anatomy of AI DocBuilder", theme, width: 760,
    body: k.plateHtml({ fig: "Fig 3", title: "Anatomy of AI DocBuilder", hint: "Hover a part", readout: "7 parts",
      keys: [{ mark: "lit", label: "The pen: the section being written now" }, { mark: "raised", label: "Paper: questions, sources, pages and notes" }],
      caption: "Questions feed in at the back, sources come out of the drawers, the plotter writes, the gauge checks, the stamp reviews, pages file into a folder, and the table on the left is the canvas.",
      body: `<div class="iso-stage">${k.figureSvg({ width: W, height: H, label: LABEL, body })}</div>` }),
    script: live });
  writeFileSync(join(HERE, `parts-${theme}.html`), page);
}
writeFileSync(join(HERE, "parts.json"), JSON.stringify(json, null, 1));
console.log("ok", ORDER.join(" "));
