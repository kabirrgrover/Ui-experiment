import { DOC_META, buildOutline } from "../../data/geotechSR";

export const PW = 794;
export const PH = 1123;
export const GAP = 96;
export const pageX = (i: number) => i * (PW + GAP);

export const DEFAULT_ANSWERS = ["North pad", "Boreholes and lab testing", "Class D", "3 × 20 m", "Within 2 weeks", "Factual report"];
export const OUTLINE = buildOutline(DEFAULT_ANSWERS);
export const TOTAL_PAGES = OUTLINE.reduce((a, s) => a + s.pages, 0); // 30, cover included in the count
export const DOC = DOC_META;

export type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; num: string; text: string }
  | { kind: "table" };

export interface PageDef { label: string; cover?: boolean; blocks?: Block[] }

const h = (text: string): Block => ({ kind: "h", text });
const p = (num: string, text: string): Block => ({ kind: "p", num, text });

/** The first 6 pages of the SR, as shown in the mockup. */
export const PAGES: PageDef[] = [
  { label: "Cover", cover: true },
  { label: "Purpose and scope", blocks: [
    h("1. Purpose and background"),
    p("1.1", "The Contractor shall investigate ground conditions at the North pad ahead of design of the tower crane footing."),
    p("1.2", "Results will be used by the Company to confirm bearing capacity, settlement and the need for piling."),
    h("2. Scope of work"),
    p("2.1", "Drill three (3) boreholes to 20 m below existing grade, or to refusal, at the locations shown in Appendix B."),
    p("2.2", "Log each borehole continuously and take samples at every change in strata and at least every 1.5 m."),
    p("2.3", "Install standpipe piezometers in BH-01 and BH-03 and record groundwater levels for two weeks after completion."),
    p("2.4", "Carry out the laboratory testing listed in Section 6 on samples selected with the Company."),
  ] },
  { label: "Site and ground", blocks: [
    h("3. Site information and access"),
    p("3.1", "Access is from the north gate. Laydown space is available next to the batch plant."),
    p("3.2", "All personnel shall complete the site induction before mobilising."),
    h("4. Ground conditions"),
    p("4.1", "The expected soil is Class D. The Contractor shall confirm conditions on site and report any difference to the Company."),
    p("4.2", "Stop drilling and inform the Company if groundwater, fill or obstructions are met."),
  ] },
  { label: "Fieldwork", blocks: [
    h("5. Fieldwork requirements"),
    p("5.1", "Use rotary drilling with temporary casing where needed to keep the hole stable."),
    p("5.2", "Carry out standard penetration tests at 1.5 m intervals in soil."),
    { kind: "table" },
    p("5.3", "Backfill each borehole with cement-bentonite grout on completion."),
  ] },
  { label: "Lab testing and HSE", blocks: [
    h("6. Laboratory testing"),
    p("6.1", "Classification, moisture content, Atterberg limits and particle size distribution on all disturbed samples."),
    p("6.2", "Consolidation and triaxial tests on selected undisturbed samples."),
    h("7. HSE requirements"),
    p("7.1", "A permit to dig and an underground services scan are required before each borehole."),
    p("7.2", "Keep an exclusion zone around the rig and hold a toolbox talk at the start of each shift."),
  ] },
  { label: "Schedule and pricing", blocks: [
    h("8. Schedule"),
    p("8.1", "Mobilise within two weeks of award. Fieldwork is expected to take about two weeks."),
    h("9. Deliverables"),
    p("9.1", "Factual report with borehole logs, photographs and laboratory results, issued in the project template."),
    h("10. Commercial"),
    p("10.1", "Lump sum for mobilisation, rates per metre drilled and provisional sums for standby and extra testing."),
  ] },
];

export const BOREHOLES = [
  ["BH-01", "20.0 m", "Crane base, NE corner", "Yes"],
  ["BH-02", "20.0 m", "Crane base, SW corner", "No"],
  ["BH-03", "20.0 m", "Laydown area", "Yes"],
] as const;
