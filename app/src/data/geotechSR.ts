/**
 * Demo content for one SR: "Geotech SR, North pad" (SR-24-0142).
 * Shared by the chat (questions + drafting), the thinking & sources panel,
 * the flip-book reveal and the canvas. Swap this for real API data later.
 */

export type DocType = "SR" | "MR" | "PEP";

export interface Question {
  key: string;
  title: string;
  /** Why the AI asks this. Shown under the question. */
  why: string;
  opts: string[];
  /** What the AI says back after the answer. */
  ack: string;
}

export const QUESTIONS: Question[] = [
  { key: "site", title: "which site is this for?", why: "Sets the address, access route and site contact on the cover page.", opts: ["North pad", "Substation B", "Cooling tower area"], ack: "Got it, North pad. I have the site plan for that one." },
  { key: "scope", title: "what do you need the contractor to do?", why: "Decides which work sections go in. Lab testing adds about 3 pages.", opts: ["Boreholes", "Test pits", "Boreholes and lab testing"], ack: "Okay, I will add a lab testing section with the standard suite." },
  { key: "soil", title: "what's the expected soil class?", why: "Drives the drilling method and how much casing they should price.", opts: ["Class C", "Class D", "Class E"], ack: "Noted. The contractor will confirm it on site." },
  { key: "boreholes", title: "how many boreholes, and how deep?", why: "This is the biggest cost line, so vendors price it per metre.", opts: ["3 × 20 m", "5 × 15 m", "6 × 25 m"], ack: "That works for a crane footing." },
  { key: "timing", title: "when do you need them on site?", why: "Goes into the schedule and the mobilisation milestone.", opts: ["Within 2 weeks", "This month", "Next quarter"], ack: "Okay." },
  { key: "deliverables", title: "what should the vendor hand over?", why: "Factual is logs and lab data. Interpretive adds design advice and costs more.", opts: ["Factual report", "Interpretive report", "Both reports"], ack: "That is the last one." },
];

/** Answer used when the user picks "not sure". */
export const UNSURE = "Contractor to propose";

export interface Section {
  n: number;
  title: string;
  /** Approximate page count of the section. */
  pages: number;
  /** One-paragraph summary used in the outline, the flip-book and the canvas. */
  body: string;
}

/** The outline of the long document. Answers fill the placeholders. */
export function buildOutline(answers: (string | undefined)[]): Section[] {
  const A = (i: number, d: string) => answers[i] || d;
  const rows: [string, number, string][] = [
    ["Purpose and background", 1, `Investigate ground conditions at the ${A(0, "[site]")} ahead of design of the tower crane footing.`],
    ["Scope of work", 4, `${A(1, "[scope]")}, ${A(3, "[boreholes]")}, logging, sampling at each change in strata and two standpipes.`],
    ["Site information and access", 2, "Access from the north gate, laydown next to the batch plant, site induction required before mobilising."],
    ["Ground conditions", 2, `Expected ${A(2, "[soil class]")}. Contractor confirms on site and stops work on groundwater or obstructions.`],
    ["Fieldwork requirements", 5, "Rotary drilling with casing as needed, SPTs every 1.5 m, core where rock is met, all holes backfilled."],
    ["Laboratory testing", 3, "Classification, moisture, Atterberg limits, PSD, consolidation and triaxial on selected samples."],
    ["HSE requirements", 3, "Permit to dig, underground services scan, exclusion zones around rigs, daily toolbox talks."],
    ["Schedule and milestones", 1, `Mobilise ${A(4, "[timing]").toLowerCase()}. Fieldwork about two weeks, results ten working days after the last hole.`],
    ["Deliverables and reporting", 2, `${A(5, "[reports]")}, borehole logs, photos and lab results in the project template.`],
    ["Commercial and pricing schedule", 3, "Lump sum mobilisation, rates per metre drilled, provisional sums for standby and extra testing."],
    ["Appendices", 4, "Site plan, crane footing layout, borehole location drawing, pricing schedule template."],
  ];
  return rows.map(([title, pages, body], i) => ({ n: i + 1, title, pages, body }));
}

export type SourceKind = "STANDARD" | "PAST SR" | "DRAWING" | "VENDOR" | "PROCEDURE" | "TEMPLATE";

/** A reference doc the AI reads. These are stripped internal docs users don't open, so the UI shows name, type and where it was used, never quotes. */
export interface Source {
  id: string;
  kind: SourceKind;
  title: string;
  why: string;
  /** Section index (0-based) at which drafting reads this source. */
  at: number;
  /** Where in the doc it was used. */
  sec: string;
}

export const SOURCES: Source[] = [
  { id: "std-geo", kind: "STANDARD", title: "Company geotechnical investigation standard", why: "Clause structure, sampling and logging rules.", at: 0, sec: "§1–6" },
  { id: "sr-0098", kind: "PAST SR", title: "SR-24-0098 · Geotech, South yard", why: "A similar job. Reused the layout and the pricing schedule.", at: 1, sec: "§2, §10" },
  { id: "plan-c", kind: "DRAWING", title: "North pad site plan, rev C", why: "Gate, laydown area and borehole locations.", at: 2, sec: "§3, App. B" },
  { id: "crane-loads", kind: "VENDOR", title: "Tower crane footing loads (vendor PDF)", why: "Why 20 m depth clears the pressure bulb.", at: 3, sec: "§4" },
  { id: "astm-d1586", kind: "STANDARD", title: "ASTM D1586 · Standard penetration test", why: "SPT method and interval in the fieldwork section.", at: 4, sec: "§5" },
  { id: "ptd", kind: "PROCEDURE", title: "Permit to dig procedure", why: "Services scan and permit before each hole.", at: 6, sec: "§7" },
  { id: "price-tpl", kind: "TEMPLATE", title: "Pricing schedule template", why: "Lump sum, rates per metre, provisional sums.", at: 9, sec: "§10" },
];

export interface ThoughtStep {
  head: string;
  body: string;
  /** Source ids this step leaned on. */
  uses?: string[];
}

/** One reasoning step per section. */
export const THINKING: ThoughtStep[] = [
  { head: "Read your answers", body: "North pad, boreholes plus lab testing, class D. Scope sized for a crane footing.", uses: ["std-geo"] },
  { head: "Found a similar SR", body: "SR-24-0098 at the South yard is close. Using its layout so reviewers see a familiar shape.", uses: ["sr-0098"] },
  { head: "Checked the site plan", body: "Access from the north gate. Placed BH-01 and BH-02 on the crane base corners.", uses: ["plan-c"] },
  { head: "Sized the depth", body: "Vendor footing loads say 20 m clears the pressure bulb with margin.", uses: ["crane-loads"] },
  { head: "Wrote fieldwork", body: "SPT every 1.5 m per ASTM D1586, rotary with casing for class D.", uses: ["astm-d1586", "std-geo"] },
  { head: "Asked about standby", body: "Weather days change the price a lot, so I asked instead of guessing." },
  { head: "Added HSE", body: "Permit to dig and services scan before every hole.", uses: ["ptd"] },
  { head: "Set the schedule", body: "Mobilise in two weeks, results ten working days after the last hole." },
  { head: "Listed deliverables", body: "Factual report, logs, photos, lab data in the project template." },
  { head: "Priced it", body: "Lump sum, rates per metre, provisional sums from the template.", uses: ["price-tpl", "sr-0098"] },
  { head: "Final pass", body: "Numbered clauses, cross-references and the cover block." },
];

/** Live one-liner shown under the drafting figure, one per section. */
export const NOW_LINES = [
  "reading the geotech standard…", "opening SR-24-0098 from the South yard…", "checking the North pad site plan…",
  "pulling the crane vendor footing loads…", "writing fieldwork with ASTM D1586…", "waiting on your answer about standby…",
  "adding the permit to dig steps…", "writing the schedule…", "listing deliverables…", "building the pricing schedule…", "final pass on numbering…",
];

export const DOC_META = { id: "SR-24-0142", type: "SR" as DocType, title: "Geotech SR, North pad", project: "North pad crane base" };

/** Drafting state machine phases. */
export type DraftPhase = "ask" | "write" | "wait" | "done";
