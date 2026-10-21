// Fig 1 · Tower crane: one storey per finished document section.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--dark") ? "dark" : "light";
const W = 560, H = 520;

// ---- model ----
export const SECTIONS = 11;          // one storey per document section
const FOOT_Z = 4, STOREY = 9, SLAB = 2;
const topOf = (n) => FOOT_Z + n * STOREY;                 // roof level with n storeys
const BLD = { x: -14, y: -24, w: 64, d: 48, r: 1.5 };
const BC = [BLD.x + BLD.w / 2, BLD.y + BLD.d / 2];        // building centre (18, 0)
const MAST = [-72, 0], MH = 7;                              // mast centre, half width
const JIB_Z = 156, HEAD_Z = 192, JIB_END = 104, CJ_END = -128;
const TROLLEY_X = BC[0];
const HANG = 16;                                           // load hangs this far above the roof

const PLATE = { x: -146, y: -76, w: 300, d: 156, r: 8 };
const P = k.fitProjection(
  [...k.boxCorners(PLATE, -16, 0), [MAST[0], 0, HEAD_Z + 2], [JIB_END, 0, JIB_Z + 9], [CJ_END, 0, JIB_Z + 6], [TROLLEY_X, 0, topOf(SECTIONS) + 30]],
  W, H, { pad: 26, azimuth: 40 });

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const seg = (a, b) => k.segment(a, b, P);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const box = (x0, y0, z0, w, d, h, r = 0.6, steps = 2, bevel = 0) => k.slabOf({ x: x0, y: y0, w, d, r }, z0, h, P, steps, bevel);

// ---- base ----
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
  // ruler strip along the near long edge
  const strip = { x: -126, y: PLATE.y + PLATE.d - 15, w: 200, d: 7, r: 1 };
  o.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  o.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate with rule lines
  const lab = { x: 92, y: PLATE.y + PLATE.d - 22, w: 40, d: 13, r: 1.2 };
  o.push(S(k.slabOf(lab, 0, 0.8, P, 3, 0.4), { tone: "mid" }));
  [3.6, 6.6, 9.6].forEach((dy, i) => o.push(L(k.lineOnTop([lab.x + 4, lab.y + dy], [lab.x + (i === 2 ? 22 : 34), lab.y + dy], 0.8, P), { tone: "faint", free: "end" })));
  o.push(D(k.corners(lab, 1.6).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return o.join("");
}

// ---- site clutter behind ----
function rebarStack() {
  const o = [];
  const pal = { x: -132, y: 28, w: 38, d: 26, r: 0.6 };
  for (const [x, y] of byDepth([[pal.x + 3, pal.y + 3], [pal.x + pal.w - 6, pal.y + 3], [pal.x + 3, pal.y + pal.d - 6], [pal.x + pal.w - 6, pal.y + pal.d - 6]]))
    o.push(S(box(x, y, 0, 3, 3, 3), { tone: "lo" }));
  o.push(S(k.slabOf(pal, 3, 2, P, 2, 0.4), { tone: "mid" }));
  for (let i = 0; i < 4; i++) o.push(L(k.lineOnTop([pal.x, pal.y + 4 + i * 6], [pal.x + pal.w, pal.y + 4 + i * 6], 5, P), { tone: "faint" }));
  // bundle of bars as a row of thin rods along x
  const rows = [[33, 5], [37, 5], [41, 5], [35, 7.6], [39, 7.6]];
  for (const [y, z] of rows.sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const F = { x: pal.x - 2, y: pal.y + y - 28 - 1.2 + 2, w: pal.w + 4, d: 2.4, r: 1.2 };
    o.push(S(k.slabOf(F, z, 2.4, P, 3), { tone: "hi", crease: "none" }));
  }
  // two tie bands
  for (const x of [pal.x + 8, pal.x + pal.w - 8]) o.push(S(box(x, pal.y + 3.6, 5, 1.6, 11.6, 5.4, 0.4), { tone: "lo", crease: "none" }));
  return o.join("");
}

function cabin() {
  const o = [];
  const C = { x: 62, y: -66, w: 40, d: 24, r: 1 };
  for (const [x, y] of byDepth(k.corners(C, 3))) o.push(S(box(x - 2, y - 2, 0, 4, 4, 2.4), { tone: "lo" }));
  o.push(S(k.slabOf(C, 2.4, 17, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(C, 10, P, 2), { tone: "faint" }) }));
  o.push(S(k.slabOf(k.insetPlan(C, -1.6), 19.4, 1.6, P, 2, 0.5), { tone: "mid" }));
  // door and window on the near (+y) face
  const y = C.y + C.d;
  const door = [[C.x + 6, y, 2.4], [C.x + 6, y, 15], [C.x + 13, y, 15], [C.x + 13, y, 2.4]];
  o.push(L(k.pathOf(door.map(at)), { tone: "lo" }));
  o.push(D([at([C.x + 11.6, y, 8.6])], { size: 0.5 }));
  const win = [[C.x + 20, y, 8], [C.x + 34, y, 8], [C.x + 34, y, 15], [C.x + 20, y, 15]];
  o.push(L(k.pathOf(win.map(at), true), { tone: "lo" }));
  o.push(L(seg([C.x + 27, y, 8], [C.x + 27, y, 15]), { tone: "faint" }));
  // vent slots on the +x face
  for (let i = 0; i < 4; i++) o.push(L(seg([C.x + C.w, C.y + 6, 12 + i * 1.6], [C.x + C.w, C.y + 18, 12 + i * 1.6]), { tone: "faint" }));
  return o.join("");
}

function barriers() {
  const o = [];
  for (const x of [-66, -40, -14, 12]) {
    const B = { x, y: 50, w: 22, d: 7, r: 0.8 };
    o.push(S(k.slabOf(B, 0, 3, P, 2, 0.4), { tone: "mid" }));
    o.push(S(k.slabOf(k.insetPlan(B, 1.6), 3, 5.6, P, 2, 0.4), { tone: "mid" }));
    o.push(L(seg([B.x + 6, B.y + B.d - 1.6, 4.6], [B.x + 16, B.y + B.d - 1.6, 4.6]), { tone: "faint" }));
  }
  return o.join("");
}

// ---- crane: footing and mast (behind the building) ----
function mast() {
  const o = [];
  const F = { x: MAST[0] - 15, y: -15, w: 30, d: 30, r: 1 };
  o.push(S(k.slabOf(F, 0, 6, P, 2, 0.6), { tone: "mid" }));
  const bolts = k.corners(F, 4);
  o.push(L(bolts.map(([x, y]) => k.ring(x, y, 1.6, 6, P, 12)).join(""), { tone: "lo" }));
  o.push(D(bolts.map(([x, y]) => at([x, y, 6])), { size: 0.5 }));
  const legs = [[MAST[0] - MH, -MH], [MAST[0] + MH, -MH], [MAST[0] - MH, MH], [MAST[0] + MH, MH]];
  const z0 = 6, z1 = 140;
  // back legs, back-face lacing hidden, then front faces lacing, front legs
  const back = legs.filter(([x, y]) => !(x > MAST[0] && y > 0));
  for (const [x, y] of byDepth(back)) o.push(S(k.cylinder(x, y, 1.4, z0, z1 - z0, P, 12), { tone: "mid", crease: "none" }));
  const lace = [];
  const step = 12;
  for (let z = z0; z < z1 - 1; z += step) {
    const zz = Math.min(z + step, z1);
    // +y face (from x0 to x1 at y = +MH)
    lace.push(seg([MAST[0] - MH, MH, z], [MAST[0] + MH, MH, zz]));
    lace.push(seg([MAST[0] - MH, MH, zz], [MAST[0] + MH, MH, zz]));
    // +x face
    lace.push(seg([MAST[0] + MH, -MH, zz], [MAST[0] + MH, MH, z]));
    lace.push(seg([MAST[0] + MH, -MH, zz], [MAST[0] + MH, MH, zz]));
  }
  o.push(L(lace.join(""), { tone: "lo" }));
  o.push(S(k.cylinder(MAST[0] + MH, MH, 1.4, z0, z1 - z0, P, 12), { tone: "mid", crease: "none" }));
  // section joints: small collars every 3 bays
  for (let z = z0 + 36; z < z1; z += 36) for (const [x, y] of byDepth(legs.filter(([x, y]) => x > MAST[0] || y > 0)))
    o.push(S(k.cylinder(x, y, 2, z - 1, 2, P, 12), { tone: "mid", crease: "none" }));
  // ladder rungs on the -x side are hidden; climbing ladder up the +y face edge
  return o.join("");
}

// ---- building: footing + storeys (each its own group) ----
function footing() {
  const o = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(BLD, -6), 0, 1, P)}" style="filter:blur(3px)"/>`];
  o.push(S(k.slabOf(k.insetPlan(BLD, -4), 0, FOOT_Z, P, 2, 0.6), { tone: "mid" }));
  // starter bars poking up at the corners of the slab
  return o.join("");
}
const COLS = (plan, inset) => k.corners(plan, inset).concat([[plan.x + plan.w / 2, plan.y + inset], [plan.x + plan.w / 2, plan.y + plan.d - inset]]);
function storey(i) {
  const z = topOf(i), o = [];
  for (const [x, y] of byDepth(COLS(BLD, 3))) o.push(S(box(x - 1.8, y - 1.8, z, 3.6, 3.6, STOREY - SLAB, 0.4), { tone: "hi", crease: "lo" }));
  // window band: a mullion row on the two near faces, ending on the columns
  const sl = { ...BLD };
  o.push(S(k.slabOf(sl, z + STOREY - SLAB, SLAB, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  return o.join("");
}
function storeyGlass(i) {
  const z = topOf(i);
  const o = [];
  // glazing as faint panes between columns on the two near faces (ends on columns and slab)
  const y = BLD.y + BLD.d - 3, x = BLD.x + BLD.w - 3;
  const lines = [];
  for (let gx = BLD.x + 9; gx < BLD.x + BLD.w - 5; gx += 6.5) if (Math.abs(gx - (BLD.x + BLD.w / 2)) > 3) lines.push(seg([gx, y, z], [gx, y, z + STOREY - SLAB]));
  for (let gy = BLD.y + 9; gy < BLD.y + BLD.d - 5; gy += 6.5) lines.push(seg([x, gy, z], [x, gy, z + STOREY - SLAB]));
  o.push(L(lines.join(""), { tone: "faint" }));
  return o.join("");
}

// ---- crane top: slewing, cab, counter-jib, jib, head, ties ----
function craneTop() {
  const o = [];
  const z = 140;
  o.push(S(k.cylinder(MAST[0], 0, 11, z, 3, P, 40, 0.5), { tone: "mid" }));
  o.push(L(k.knurl(MAST[0], 0, 11, z + 0.4, z + 2.6, 40, P), { tone: "faint" }));
  o.push(S(box(MAST[0] - 9, -9, z + 3, 18, 18, 4, 0.8), { tone: "mid" }));
  // counter-jib deck and counterweights (behind the mast on -x)
  o.push(S(box(CJ_END, -5, JIB_Z - 4, MAST[0] - 9 - CJ_END, 10, 3, 0.6), { tone: "mid" }));
  for (let i = 0; i < 3; i++) {
    const cx = CJ_END + 2 + i * 7.4;
    o.push(S(box(cx, -7, JIB_Z - 26, 6.6, 14, 22, 0.6, 2, 0.4), { tone: "lo", crease: "mid" }));
  }
  // hoist winch drum on the counter-jib
  o.push(S(box(-104, -5.6, JIB_Z - 1, 12, 11.2, 5, 1), { tone: "mid" }));
  o.push(L(k.knurl(-98, 0, 4, JIB_Z - 1, JIB_Z + 4, 8, P), { tone: "faint" }));
  // tower head A-frame
  const head = [[MAST[0] - 6, -5], [MAST[0] + 6, -5], [MAST[0] - 6, 5], [MAST[0] + 6, 5]];
  const apex = [MAST[0], 0, HEAD_Z];
  o.push(L(head.map(([x, y]) => seg([x, y, z + 7], apex)).join(""), { tone: "mid" }));
  o.push(S(box(MAST[0] - 2, -2, HEAD_Z - 2, 4, 4, 4, 0.6), { tone: "mid" }));
  // pendant ties from apex to jib end and counter-jib end, ending on dots
  o.push(L(seg([MAST[0], 0, HEAD_Z], [JIB_END - 30, 0, JIB_Z + 8]) + seg([MAST[0], 0, HEAD_Z], [CJ_END + 4, 0, JIB_Z - 1]), { tone: "lo" }));
  o.push(D([at([JIB_END - 30, 0, JIB_Z + 8]), at([CJ_END + 4, 0, JIB_Z - 1]), at(apex)], { size: 0.7 }));
  // cab on the +y side of the slewing unit
  const cab = { x: MAST[0] - 4, y: 9, w: 12, d: 11, r: 1 };
  o.push(S(k.slabOf(cab, z - 2, 12, P, 2, 0.5), { tone: "mid" }));
  const cy = cab.y + cab.d;
  o.push(L(k.pathOf([[cab.x + 2, cy, z + 3], [cab.x + 10, cy, z + 3], [cab.x + 10, cy, z + 8.6], [cab.x + 2, cy, z + 8.6]].map(at), true), { tone: "lo" }));
  // jib: two bottom chords, a top chord and lacing
  const x0 = MAST[0] + 7;
  for (const y of [-4.6, 3]) o.push(S(box(x0, y, JIB_Z - 1.6, JIB_END - x0, 1.6, 1.6, 0.3), { tone: "mid", crease: "none" }));
  const lace = [];
  for (let x = x0; x < JIB_END - 1; x += 8) {
    lace.push(seg([x, 3.8, JIB_Z], [x + 4, 0, JIB_Z + 8]));
    lace.push(seg([x + 4, 0, JIB_Z + 8], [Math.min(x + 8, JIB_END), 3.8, JIB_Z]));
  }
  o.push(L(lace.join(""), { tone: "lo" }));
  o.push(S(box(x0, -0.8, JIB_Z + 8, JIB_END - x0, 1.6, 1.6, 0.3), { tone: "mid", crease: "none" }));
  o.push(S(box(JIB_END - 1, -5.4, JIB_Z - 2, 2.6, 10.8, 11, 0.4), { tone: "mid" }));
  return o.join("");
}

function trolley() {
  const o = [];
  const T = { x: TROLLEY_X - 7, y: -6, w: 14, d: 12, r: 1 };
  o.push(S(k.slabOf(T, JIB_Z - 6, 4.4, P, 2, 0.4), { tone: "mid" }));
  o.push(D([[T.x + 3, 6], [T.x + 11, 6]].map(([x, y]) => at([x, y, JIB_Z - 1.6])), { size: 0.9 }));
  o.push(S(k.cylinder(TROLLEY_X, 0, 2.4, JIB_Z - 8, 2, P, 14), { tone: "mid" }));
  return o.join("");
}

// hoist group, built at rest for n = 0 storeys
const REST_Z = topOf(0) + HANG;      // underside of the hanging load
function hoist() {
  const o = [];
  const z = REST_Z;
  // slings: from the hook to the load's two near top corners (ends land on dots)
  const hookZ = z + SLAB + 20;
  const load = { ...BLD };
  o.push(S(k.slabOf(load, z, SLAB, P, 2, 0.4), { tone: "hi", lit: true, crease: "lo" }));
  for (const [x, y] of byDepth(COLS(load, 3))) o.push(S(box(x - 1.4, y - 1.4, z - 2.4, 2.8, 2.8, 2.4, 0.3), { tone: "hi", lit: true, crease: "none" }));
  const pick = [[load.x + 4, load.y + 4], [load.x + load.w - 4, load.y + 4], [load.x + 4, load.y + load.d - 4], [load.x + load.w - 4, load.y + load.d - 4]];
  o.push(L(pick.map(([x, y]) => seg([TROLLEY_X, 0, hookZ], [x, y, z + SLAB])).join(""), { tone: "lo" }));
  o.push(D(pick.map(([x, y]) => at([x, y, z + SLAB])), { size: 0.7 }));
  // hook block and hook
  o.push(S(box(TROLLEY_X - 3, -2.6, hookZ + 1, 6, 5.2, 6, 0.6), { tone: "mid" }));
  o.push(L(k.pathOf([at([TROLLEY_X, 0, hookZ + 1]), at([TROLLEY_X, 0, hookZ - 0.6]), at([TROLLEY_X + 1.6, 0, hookZ - 0.6])]), { tone: "mid" }));
  o.push(D([at([TROLLEY_X, 0, hookZ])], { size: 0.8, tone: "hi" }));
  return o.join("");
}
const ROPE_TOP = at([TROLLEY_X, 0, JIB_Z - 8]);
const ROPE_REST = at([TROLLEY_X, 0, REST_Z + SLAB + 20 + 7]);
const VZ = k.axisVector(P, [0, 0, 1]);

// ---- assemble, back to front ----
const body = [
  base(),
  rebarStack(),
  mast(),
  cabin(),
  barriers(),
  footing(),
  ...Array.from({ length: SECTIONS }, (_, i) => `<g data-part="storey-${i}">${storey(i)}${storeyGlass(i)}</g>`),
  craneTop(),
  `<path data-part="rope" class="iso-line" data-tone="mid" d="${k.pathOf([ROPE_TOP, ROPE_REST])}"/>`,
  trolley(),
  `<g data-part="hoist">${hoist()}</g>`,
];

const svg = k.figureSvg({
  width: W, height: H, standalone: theme,
  label: "A tower crane on a site pad sets one precast storey onto a building for each document section that is finished. Eleven sections make eleven storeys.",
  body,
});

// what the host page needs to drive it
export const RIG = { sections: SECTIONS, storey: STOREY, foot: FOOT_Z, hang: HANG, restZ: REST_Z, vz: VZ, ropeTop: ROPE_TOP, ropeRest: ROPE_REST };
writeFileSync(join(HERE, "crane.svg"), svg);
const layer = (name, parts, label) => writeFileSync(join(HERE, "crane-" + name + ".svg"), k.figureSvg({ width: W, height: H, standalone: theme, label, body: parts }));
layer("back", [base(), rebarStack(), mast(), cabin(), barriers(), footing()], "Site pad with the crane mast, a rebar stack, barriers and the site cabin.");
for (let i = 0; i < SECTIONS; i++) layer("storey-" + i, [storey(i) + storeyGlass(i)], "Storey " + (i + 1));
layer("top", [craneTop(), trolley()], "Crane jib, counter-jib, cab and trolley.");
layer("hoist", [hoist()], "The storey on the hook.");
writeFileSync(join(HERE, "crane.json"), JSON.stringify(RIG));

// a standalone page with a demo loop, for checking
const live = `
const RIG = ${JSON.stringify(RIG)};
const svg = document.querySelector('.iso-stage svg');
const storeys = [...Array(RIG.sections).keys()].map(i => svg.querySelector('[data-part="storey-' + i + '"]'));
const hoist = svg.querySelector('[data-part="hoist"]'), rope = svg.querySelector('[data-part="rope"]');
const readout = document.querySelector('[data-readout]');
let n = 0, z = 0;
function show(p) {
  storeys.forEach((g, i) => { g.style.opacity = i < p ? 1 : 0; });
  const dz = (p * RIG.storey);
  hoist.setAttribute('transform', 'translate(' + (RIG.vz[0] * dz).toFixed(1) + ' ' + (RIG.vz[1] * dz).toFixed(1) + ')');
  hoist.style.opacity = p < RIG.sections ? 1 : 0;
  rope.setAttribute('d', 'M' + RIG.ropeTop[0] + ' ' + RIG.ropeTop[1] + 'L' + (RIG.ropeRest[0] + RIG.vz[0] * dz).toFixed(1) + ' ' + (RIG.ropeRest[1] + RIG.vz[1] * dz).toFixed(1));
  readout.textContent = p + ' of ' + RIG.sections + ' sections';
}
const q = new URLSearchParams(location.search).get('p');
if (q !== null) show(+q); else { show(0); setInterval(() => { n = (n + 1) % (RIG.sections + 1); show(n); }, 900); }
`;
const page = k.pageHtml({
  title: "Tower crane", theme,
  body: k.plateHtml({ fig: "Fig 1", title: "Tower crane", hint: "Each section sets a storey", readout: "0 of 11 sections",
    keys: [{ mark: "lit", label: "The storey on the hook: the section being written" }, { mark: "raised", label: "Storeys already set: sections finished" }],
    caption: "A tower crane on a site pad. Each finished section of the document is one precast storey set on the building, so its height is the draft's progress.",
    body: `<div class="iso-stage">${k.figureSvg({ width: W, height: H, label: "Tower crane building one storey per section.", body })}</div>` }),
  script: live,
});
writeFileSync(join(HERE, theme === "light" ? "crane-light.html" : "crane.html"), page);
console.log("wrote crane.svg, crane.json, page");
