import type { DocType } from "../../data/geotechSR";

/** Doodle per subject, shown on papers peeking out of folders and on doc thumbnails. */
export const DOODLES = {
  geotech: "/assets/doodle-geotech.svg",
  bridging: "/assets/doodle-bridging.svg",
  pressure: "/assets/doodle-pressure-testing.svg",
  machinery: "/assets/doodle-field-machinery.svg",
  cable: "/assets/doodle-cable-testing.svg",
  pfc: "/assets/doodle-pfc-panels.svg",
  delivery: "/assets/doodle-material-delivery.svg",
  welding: "/assets/doodle-welding.svg",
  elevator: "/assets/doodle-elevator.svg",
  crane: "/assets/doodle-tower-crane-foundations.svg",
  concrete: "/assets/doodle-concrete-testing.svg",
  mr: "/assets/doodle-mr.svg",
  pep: "/assets/doodle-pep.svg",
} as const;
export type DoodleKey = keyof typeof DOODLES;

export const STICKERS = {
  hello: "/assets/hello-sr.svg",
  tape: "/assets/tool-tape-measure.png",
  hat: "/assets/hard-hat-eyes.svg",
  rfi: "/assets/rfi.svg",
  smiley: "/assets/smiley.svg",
  specd: "/assets/specd-signed.svg",
  level: "/assets/tool-level.svg",
} as const;
export type StickerKey = keyof typeof STICKERS;

/** Glass tint as "r,g,b" plus the solid back-panel colour. */
export const COLORS = {
  butter: { rgb: "245,218,140", solid: "#e9c45d" },
  sky: { rgb: "181,227,247", solid: "#8ccbe6" },
  sage: { rgb: "150,190,170", solid: "#78a894" },
  pink: { rgb: "255,200,214", solid: "#f1a3b8" },
  lilac: { rgb: "232,186,242", solid: "#cf93dd" },
  peach: { rgb: "248,201,141", solid: "#e9a65a" },
} as const;
export type FolderColor = keyof typeof COLORS;

/** A sticker slapped on the folder front: name, top, left, width, rotation. */
export type StickerPlacement = [StickerKey, number, number, number, number];

export interface Folder {
  id: string;
  name: string;
  n: number;
  color: FolderColor;
  papers: DoodleKey[];
  stickers: StickerPlacement[];
}

export const BY_TYPE: Folder[] = [
  { id: "sr", name: "Service requisitions", n: 12, color: "butter", papers: ["geotech", "welding", "crane"], stickers: [["hello", 92, 18, 72, -8], ["specd", 66, 176, 70, 12]] },
  { id: "mr", name: "Material requisitions", n: 7, color: "sky", papers: ["mr", "delivery"], stickers: [["tape", 84, 168, 56, 10], ["smiley", 54, 34, 44, -10]] },
  { id: "pep", name: "Execution plans", n: 3, color: "sage", papers: ["pep"], stickers: [["hat", 66, 26, 70, -6], ["level", 108, 160, 70, 8]] },
];

export const BY_PROJECT: Folder[] = [
  { id: "north", name: "North pad", n: 9, color: "pink", papers: ["bridging", "concrete", "geotech"], stickers: [["rfi", 70, 176, 58, 8], ["hello", 96, 22, 64, -6]] },
  { id: "subb", name: "Substation B", n: 4, color: "lilac", papers: ["pfc", "cable"], stickers: [["smiley", 58, 36, 60, -10], ["tape", 92, 168, 52, 6]] },
  { id: "shared", name: "Shared with me", n: 5, color: "peach", papers: ["elevator", "machinery"], stickers: [["level", 104, 140, 66, -12], ["hat", 54, 30, 56, 8]] },
];

export const ALL_FOLDERS = [...BY_TYPE, ...BY_PROJECT];

export type Grouping = "type" | "project" | "all";
export const GROUPS: [Grouping, string][] = [["type", "By document type"], ["project", "By project"], ["all", "Everything"]];

export type DocStatus = "Draft" | "For review" | "Approved";

export interface DocCard {
  doc: DocType;
  title: string;
  num: string;
  when: string;
  status: DocStatus;
  doodle: DoodleKey;
}

const d = (doc: DocType, title: string, num: string, when: string, status: DocStatus, doodle: DoodleKey): DocCard => ({ doc, title, num, when, status, doodle });

/** Demo docs. Folders without their own list fall back to the SR list, like the design. */
export const DOCS: Record<string, DocCard[]> = {
  sr: [
    d("SR", "Geotech, North pad", "SR-24-0142", "2 hours ago", "Draft", "geotech"),
    d("SR", "Bridging, East gate", "SR-24-0131", "3 days ago", "Approved", "bridging"),
    d("SR", "Concrete testing, pour 4", "SR-24-0122", "2 weeks ago", "For review", "concrete"),
    d("SR", "Welding inspection, pipe rack", "SR-24-0117", "3 weeks ago", "Approved", "welding"),
    d("SR", "Elevator, tower B", "SR-24-0104", "last month", "Draft", "elevator"),
  ],
  mr: [
    d("MR", "Rebar, level 2", "MR-24-0087", "yesterday", "For review", "mr"),
    d("MR", "Aggregate deliveries, Q4", "MR-24-0079", "2 weeks ago", "Approved", "delivery"),
  ],
  pep: [d("PEP", "Substation upgrade", "PEP-24-0009", "last week", "Approved", "pep")],
};

export const STAMP_COLOR: Record<DocStatus, string> = { Draft: "#5f5e5b", "For review": "#a3451a", Approved: "#2f7d4f" };

/** Folder front outline: rounded body with a tab on the left. Used for the glass clip and the white rim. */
export const FOLDER_PATH = "M18 1 H150 C162 1 166 5 172 13 L178 23 H262 Q279 23 279 40 V162 Q279 179 262 179 H18 Q1 179 1 162 V18 Q1 1 18 1 Z";

/** Paper positions when a folder holds 2 or 3 papers: left, top, rest tilt, hover tilt. */
export const PAPER_SLOTS: [number, number, number, number][] = [[60, 6, -9, -13], [104, -6, 3, 5], [150, 10, 11, 15]];
export const SINGLE_PAPER: [number, number, number, number] = [100, 4, -3, 4];
