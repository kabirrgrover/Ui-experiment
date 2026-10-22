import type { DocType } from "../../data/geotechSR";

export type BuildingKind = "shop" | "warehouse" | "tower" | "kiosk" | "gable";

export interface BuildingShape {
  w: number;
  h: number;
  /** Sign box: left, top, width, height. */
  sign: [number, number, number, number];
  /** Window box the doodle sits in: left, top, width, height. */
  win: [number, number, number, number];
  size: number;
  plate: boolean;
}

export const BUILDINGS: Record<BuildingKind, BuildingShape> = {
  shop: { w: 260, h: 300, sign: [34, 58, 192, 50], win: [34, 166, 128, 120], size: 22, plate: true },
  warehouse: { w: 330, h: 290, sign: [38, 100, 252, 44], win: [188, 162, 108, 100], size: 22, plate: true },
  tower: { w: 230, h: 400, sign: [36, 40, 158, 46], win: [38, 280, 108, 112], size: 20, plate: true },
  kiosk: { w: 230, h: 280, sign: [44, 138, 142, 30], win: [46, 176, 138, 76], size: 17, plate: false },
  gable: { w: 270, h: 330, sign: [44, 126, 182, 44], win: [44, 186, 116, 112], size: 20, plate: true },
};

export interface Door {
  /** Slug used for the chat route and asset names. */
  slug: string;
  doc: DocType;
  kind: BuildingKind;
  name: string;
  type: string;
  blurb: string;
  qs: string;
}

export const DOORS: Door[] = [
  { slug: "geotech", doc: "SR", kind: "shop", name: "Dirt Lab", type: "Geotech", blurb: "Soil investigation: boreholes, test pits and lab testing.", qs: "about 6 questions" },
  { slug: "bridging", doc: "SR", kind: "warehouse", name: "Span Works", type: "Bridging", blurb: "Temporary bridging and crossings for site access.", qs: "about 5 questions" },
  { slug: "pressure-testing", doc: "SR", kind: "kiosk", name: "Pressure Point", type: "Pressure testing", blurb: "Hydro and pneumatic pressure tests for piping systems.", qs: "about 7 questions" },
  { slug: "field-machinery", doc: "SR", kind: "warehouse", name: "Big Iron", type: "Field machinery", blurb: "Excavators, loaders and plant hire for the field.", qs: "about 6 questions" },
  { slug: "cable-testing", doc: "SR", kind: "shop", name: "Live Wire", type: "Cable testing", blurb: "Insulation, continuity and HV cable testing.", qs: "about 5 questions" },
  { slug: "mr", doc: "MR", kind: "warehouse", name: "Supply Yard", type: "Material requisition", blurb: "What to buy: specs, quantities and delivery dates.", qs: "about 8 questions" },
  { slug: "pfc-panels", doc: "SR", kind: "tower", name: "Power Factor", type: "PFC panels", blurb: "Power factor correction panels: supply and install.", qs: "about 6 questions" },
  { slug: "material-delivery", doc: "SR", kind: "gable", name: "Drop-Off Depot", type: "Material delivery", blurb: "Trucked deliveries of bulk and heavy materials.", qs: "about 5 questions" },
  { slug: "welding", doc: "SR", kind: "shop", name: "Hot Seam", type: "Welding", blurb: "Welding services, procedures and inspection.", qs: "about 6 questions" },
  { slug: "pep", doc: "PEP", kind: "tower", name: "Plan HQ", type: "Project execution plan", blurb: "Scope, schedule, people and how the job gets done.", qs: "about 10 questions" },
  { slug: "elevator", doc: "SR", kind: "tower", name: "Going Up", type: "Elevator", blurb: "Elevator supply, install and commissioning.", qs: "about 6 questions" },
  { slug: "tower-crane-foundations", doc: "SR", kind: "gable", name: "Firm Footing", type: "Tower crane foundations", blurb: "Design and pour of tower crane footings.", qs: "about 7 questions" },
  { slug: "concrete-testing", doc: "SR", kind: "kiosk", name: "Slump & Co.", type: "Concrete testing", blurb: "Slump, cylinder and core testing for concrete.", qs: "about 5 questions" },
];

export interface Prop {
  img: string;
  /** Rendered height in px. */
  height: number;
  /** Pull the prop down a little so it sits on the kerb. */
  sink?: number;
}

export const PROPS: Prop[] = [
  { img: "/assets/prop-lamp.svg", height: 190 },
  { img: "/assets/prop-tree.svg", height: 170 },
  { img: "/assets/cone.png", height: 74, sink: 4 },
  { img: "/assets/prop-signpost.svg", height: 180 },
];

/** Prop slots count as 110px wide when timing the loop. */
export const PROP_W = 110;
export const GAP = 36;

export type Filter = "all" | DocType;

export const FILTERS: [Filter, string][] = [
  ["all", "Everything"],
  ["SR", "Service requisitions"],
  ["MR", "Material requisitions"],
  ["PEP", "Execution plans"],
];

export const TRY_PROMPTS = ["PEP for a substation upgrade", "MR for rebar, level 2", "Hydro test for the cooling loop"];
