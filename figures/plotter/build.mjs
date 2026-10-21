// Fig 2 · Drafting plotter: draws the document; each finished section stacks a page in the out-tray.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../anatomy/kit/iso-kit.mjs";
import * as G from "../../anatomy/kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--dark") ? "dark" : "light";
const W = 560, H = 380;
export const SECTIONS = 11;

const PLATE = { x: -150, y: -96, w: 330, d: 186, r: 8 };
const BED = { x: -104, y: -70, w: 200, d: 128, r: 3 };
const BED_Z = 12;
const SHEET = { x: -36, y: -56, w: 72, d: 98, r: 0.4 };
const RAIL_X = [-98, 90];
const GZ = 50;                       // gantry beam height
const TRAY = { x: 112, y: -34, w: 52, d: 72, r: 2 };
const PAGE = { x: 117, y: -29, w: 42, d: 58, r: 0.4 };

const P = k.fitProjection([...k.boxCorners(PLATE, -16, 0), [0, BED.y, GZ + 14], [0, BED.y + BED.d, GZ + 14], [-40, -88, 26]], W, H, { pad: 26, azimuth: 38 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const seg = (a, b) => k.segment(a, b, P);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const box = (x, y, z, w, d, h, r = 0.6, steps = 2, bevel = 0) => k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel);

function base() {
  const o = [`<path class="iso-halo" d="${k.haloOf(PLATE, -16, 12, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    o.push(S(k.cylinder(x, y, 8, -16, 1.6, P, 28), { tone: "lo" }));
    o.push(S(k.cylinder(x, y, 6, -14.4, 2.4, P, 28), { tone: "mid" }));
  }
  o.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  o.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 11);
  o.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  o.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const lab = { x: 118, y: PLATE.y + PLATE.d - 24, w: 44, d: 14, r: 1.2 };
  o.push(S(k.slabOf(lab, 0, 0.8, P, 3, 0.4), { tone: "mid" }));
  [3.8, 7, 10.2].forEach((dy, i) => o.push(L(k.lineOnTop([lab.x + 4, lab.y + dy], [lab.x + (i === 2 ? 24 : 38), lab.y + dy], 0.8, P), { tone: "faint", free: "end" })));
  o.push(D(k.corners(lab, 1.6).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return o.join("");
}

// paper roll at the back, on two cradles
function roll() {
  const o = [];
  for (const x of [-70, 50]) o.push(S(box(x, -90, 0, 8, 12, 14, 0.6), { tone: "mid" }));
  const F = G.frameAlong([-80, -84, 22], [1, 0, 0]);
  o.push(S(G.disc(0, 140, 9, F, P), { tone: "hi", crease: "lo" }));
  o.push(S(G.disc(-4, 0, 3, F, P), { tone: "mid" }));
  o.push(S(G.disc(140, 144, 3, F, P), { tone: "mid" }));
  // paper web from the roll down onto the bed's back edge
  o.push(S(k.extrude([[-40, -84], [40, -84], [40, BED.y + 2], [-40, BED.y + 2]], BED_Z + 0.2, 0.3, P), { tone: "hi", crease: "none" }));
  return o.join("");
}

function bed() {
  const o = [];
  o.push(S(k.slabOf(BED, 0, BED_Z, P, 3, 0.8), { tone: "mid", inner: L(k.sideSeam(BED, 4, P, 3), { tone: "faint" }) }));
  // vacuum hold-down holes as a faint dot grid on the bed
  const pts = [];
  for (let x = BED.x + 10; x < BED.x + BED.w - 8; x += 9) for (let y = BED.y + 10; y < BED.y + BED.d - 8; y += 9)
    if (!(x > SHEET.x - 3 && x < SHEET.x + SHEET.w + 3 && y > SHEET.y - 3 && y < SHEET.y + SHEET.d + 3)) pts.push(at([x, y, BED_Z]));
  o.push(D(pts, { size: 0.35, tone: "lo" }));
  // rails along y on each side
  for (const x of RAIL_X) {
    o.push(S(box(x, BED.y + 4, BED_Z, 8, BED.d - 8, 3, 0.6, 2, 0.4), { tone: "mid" }));
    const t = k.topTicks(BED.y + 8, BED.y + BED.d - 8, 4, 5, x + 0.6, BED_Z + 3, [1.6, 3], P, "y");
    o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  }
  // end stops
  for (const x of RAIL_X) for (const y of [BED.y + 1, BED.y + BED.d - 5]) o.push(S(box(x - 1, y, BED_Z, 10, 4, 6, 0.6), { tone: "mid" }));
  return o.join("");
}

function sheet() {
  const o = [];
  o.push(S(k.slabOf(SHEET, BED_Z, 0.5, P, 2), { tone: "hi", crease: "none" }));
  // clamps holding the sheet corners
  for (const [x, y] of byDepth(k.corners(SHEET, 0))) o.push(S(box(x - 3, y - 3, BED_Z + 0.5, 6, 6, 1.2, 0.6), { tone: "mid" }));
  return o.join("");
}
// the page as it is drawn: title block and text rules, revealed by the host
const RULES = [];
(() => {
  const z = BED_Z + 0.55, x0 = SHEET.x + 7, x1 = SHEET.x + SHEET.w - 7;
  RULES.push(k.lineOnTop([x0, SHEET.y + 9], [x0 + 34, SHEET.y + 9], z, P));
  RULES.push(k.lineOnTop([x0, SHEET.y + 14], [x0 + 22, SHEET.y + 14], z, P));
  for (let i = 0; i < 11; i++) {
    const y = SHEET.y + 24 + i * 6;
    RULES.push(k.lineOnTop([x0 + (i % 4 === 0 ? 0 : 5), y], [x1 - (i % 3 === 2 ? 18 : 0), y], z, P));
  }
  const tb = { x: SHEET.x + SHEET.w - 30, y: SHEET.y + SHEET.d - 14, w: 24, d: 9, r: 0 };
  RULES.push(k.planOutline(tb, z, P, 1));
})();

// gantry, built at rest at y = 0 and moved along y by the host
function gantry() {
  const o = [];
  const y0 = -6;
  for (const x of RAIL_X) {
    o.push(S(box(x - 1, y0, BED_Z + 3, 10, 12, 6, 0.8, 2, 0.4), { tone: "mid" }));
    o.push(S(box(x + 1, y0 + 2, BED_Z + 9, 6, 8, GZ - BED_Z - 9, 0.6, 2, 0.3), { tone: "mid" }));
  }
  o.push(S(box(RAIL_X[0] - 2, y0, GZ, RAIL_X[1] - RAIL_X[0] + 12, 12, 8, 0.8, 2, 0.5), { tone: "mid", inner: L(k.sideSeam({ x: RAIL_X[0] - 2, y: y0, w: RAIL_X[1] - RAIL_X[0] + 12, d: 12, r: 0.8 }, GZ + 4, P, 2), { tone: "faint" }) }));
  o.push(D([RAIL_X[0] + 4, RAIL_X[1] + 4].map((x) => at([x, y0 + 12, GZ + 4])), { size: 0.5 }));
  // motor on the right tower
  o.push(S(k.cylinder(RAIL_X[1] + 4, y0 + 6, 4.6, GZ + 8, 7, P, 24), { tone: "mid" }));
  o.push(L(k.knurl(RAIL_X[1] + 4, y0 + 6, 4.6, GZ + 9, GZ + 14, 20, P), { tone: "faint" }));
  return o.join("");
}
// carriage on the beam, built at x = 0, moved along x by the host
function carriage() {
  const o = [];
  const y0 = -6;
  o.push(S(box(-8, y0 + 10, GZ - 2, 16, 8, 14, 1, 2, 0.4), { tone: "mid" }));
  o.push(D([[-5, GZ + 9], [5, GZ + 9]].map(([x, z]) => at([x, y0 + 18, z])), { size: 0.5 }));
  // pen holder and pen down to the sheet
  o.push(S(k.cylinder(0, y0 + 14, 3, GZ - 8, 6, P, 18), { tone: "mid" }));
  o.push(S(k.cylinder(0, y0 + 14, 1.6, BED_Z + 1.4, GZ - 8 - BED_Z - 1.4, P, 14), { tone: "hi", lit: true, crease: "none" }));
  o.push(D([at([0, y0 + 14, BED_Z + 0.6])], { size: 1, tone: "lit" }));
  return o.join("");
}

function tray() {
  const o = [];
  o.push(S(k.slabOf(TRAY, 0, 4, P, 3, 0.6), { tone: "mid" }));
  // back and side fences
  o.push(S(box(TRAY.x, TRAY.y, 4, TRAY.w, 3, 10, 0.6), { tone: "mid" }));
  o.push(S(box(TRAY.x, TRAY.y, 4, 3, TRAY.d, 10, 0.6), { tone: "mid" }));
  return o.join("");
}
const PAGE_T = 1.1;
const pageGroup = (i) => {
  const z = 4 + i * PAGE_T;
  const plan = { ...PAGE, x: PAGE.x + ((i * 37) % 5) * 0.5 - 1, y: PAGE.y + ((i * 23) % 5) * 0.4 - 1 };
  return `<g data-part="page-${i}">${S(k.slabOf(plan, z, PAGE_T * 0.8, P, 2), { tone: "hi", crease: "none" })}${L(k.lineOnTop([plan.x + 6, plan.y + 8], [plan.x + 26, plan.y + 8], z + PAGE_T * 0.8, P), { tone: "faint", free: true })}</g>`;
};

function controls() {
  const o = [];
  const C = { x: -142, y: 34, w: 32, d: 44, r: 2 };
  o.push(S(k.slabOf(C, 0, 16, P, 3, 0.6), { tone: "mid" }));
  const knobs = [[C.x + 9, C.y + 32], [C.x + 21, C.y + 32]];
  for (const [x, y] of byDepth(knobs)) {
    o.push(S(k.cylinder(x, y, 4, 16, 4, P, 24), { tone: "mid" }));
    o.push(L(k.knurl(x, y, 4, 16, 20, 18, P), { tone: "lo" }));
    o.push(L(k.lineOnTop([x, y], [x, y - 4], 20, P), { tone: "hi" }));
  }
  const win = { x: C.x + 5, y: C.y + 6, w: 22, d: 14, r: 1 };
  o.push(S(k.slabOf(win, 16, 0.4, P, 2), { tone: "lo", crease: "none" }));
  o.push(D([at([C.x + 27, C.y + 26, 16])], { size: 0.9, tone: "lit" }));
  // cable from the box to the bed, ending on dots
  o.push(k.wireSvg(at([C.x + C.w, C.y + 8, 8]), at([BED.x, BED.y + BED.d - 20, 6]), { via: [at([C.x + C.w + 10, C.y + 2, 4])], tone: "lo" }));
  return o.join("");
}

const VY = k.axisVector(P, [0, 1, 0]), VX = k.axisVector(P, [1, 0, 0]);
const body = [
  base(), roll(), bed(), sheet(),
  `<g data-part="rules">${RULES.map((d, i) => `<path data-rule="${i}" class="iso-line" data-tone="lo" data-free="end" d="${d}"/>`).join("")}</g>`,
  tray(),
  ...Array.from({ length: SECTIONS }, (_, i) => pageGroup(i)),
  `<g data-part="gantry">${gantry()}<g data-part="carriage">${carriage()}</g></g>`,
  controls(),
];
const svg = k.figureSvg({ width: W, height: H, standalone: theme, label: "A flatbed drafting plotter draws the document page by page. Each finished section drops a page onto the out-tray on the right.", body });
export const RIG = { sections: SECTIONS, rules: RULES.length, vy: VY, vx: VX, yRange: [SHEET.y + 6, SHEET.y + SHEET.d - 6], xRange: [SHEET.x + 6, SHEET.x + SHEET.w - 6] };
writeFileSync(join(HERE, "plotter.svg"), svg);
const layer = (name, parts, label) => writeFileSync(join(HERE, "plotter-" + name + ".svg"), k.figureSvg({ width: W, height: H, standalone: theme, label, body: parts }));
layer("back", [base(), roll(), bed(), sheet()], "Plotter base, paper roll, bed and sheet.");
layer("rules", [`<g data-part="rules">${RULES.map((d, i) => `<path data-rule="${i}" class="iso-line" data-tone="lo" data-free="end" d="${d}"/>`).join("")}</g>`], "Lines drawn on the sheet.");
layer("tray", [tray()], "Out-tray.");
for (let i = 0; i < SECTIONS; i++) layer("page-" + i, [pageGroup(i)], "Page " + (i + 1));
layer("gantry", [gantry()], "Gantry.");
layer("carriage", [carriage()], "Carriage and pen.");
layer("front", [controls()], "Control box.");
writeFileSync(join(HERE, "plotter.json"), JSON.stringify(RIG));
const live = `
const RIG = ${JSON.stringify(RIG)};
const s = document.querySelector('.iso-stage svg');
const pages = [...Array(RIG.sections).keys()].map(i => s.querySelector('[data-part="page-' + i + '"]'));
const g = s.querySelector('[data-part="gantry"]'), c = s.querySelector('[data-part="carriage"]');
const q = new URLSearchParams(location.search).get('p'); const p = q === null ? 4 : +q;
pages.forEach((e, i) => e.style.opacity = i < p ? 1 : 0);
const y = RIG.yRange[0] + (RIG.yRange[1] - RIG.yRange[0]) * 0.45, x = RIG.xRange[0] + (RIG.xRange[1] - RIG.xRange[0]) * 0.6;
g.setAttribute('transform', 'translate(' + RIG.vy[0] * y + ' ' + RIG.vy[1] * y + ')');
c.setAttribute('transform', 'translate(' + RIG.vx[0] * x + ' ' + RIG.vx[1] * x + ')');
document.querySelector('[data-readout]').textContent = p + ' of 11 sections';
`;
const page = k.pageHtml({ title: "Drafting plotter", theme,
  body: k.plateHtml({ fig: "Fig 2", title: "Drafting plotter", hint: "Each section stacks a page", readout: "", keys: [{ mark: "lit", label: "The pen: what is being written now" }, { mark: "raised", label: "Pages in the tray: sections finished" }],
    caption: "A flatbed plotter draws the document. The gantry sweeps the sheet, the pen writes the clauses, and each finished section drops a page onto the out-tray.",
    body: `<div class="iso-stage">${k.figureSvg({ width: W, height: H, label: "Drafting plotter", body })}</div>` }),
  script: live });
writeFileSync(join(HERE, theme === "light" ? "plotter-light.html" : "plotter.html"), page);
console.log("ok");
