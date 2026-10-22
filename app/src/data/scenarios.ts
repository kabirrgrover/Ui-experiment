/**
 * Every SR the chat can run. One Scenario = one guided chat + its draft, sources and reasoning.
 * The chat, the thinking & sources panel and the flip-book all read from here.
 * Demo content for the POC: hardcoded, plain engineering wording, no real project data.
 */
import {
  DOC_META, NOW_LINES, QUESTIONS, SOURCES, THINKING, buildOutline,
  type DocType, type Question, type Section, type Source, type ThoughtStep,
} from "./geotechSR";

export interface Check { at: number; text: string; detail: string }

export interface FollowUpQuestion {
  /** Section index (0-based) where drafting pauses to ask. */
  at: number;
  title: string;
  opts: string[];
  ack: string;
  /** Shown in the thinking panel while paused. */
  waitLine: string;
}

export interface DocMeta { id: string; type: DocType; title: string; project: string }

export interface Scenario {
  id: string;
  meta: DocMeta;
  /** Lowercase hand-lettered title on the chat. */
  display: string;
  /** Opening AI message. */
  intro: string;
  questions: Question[];
  outline: (answers: (string | undefined)[]) => Section[];
  sources: Source[];
  thinking: ThoughtStep[];
  nowLines: string[];
  checks: Check[];
  followUp: FollowUpQuestion;
  /** Answers the autoplay demo picks, one per question. */
  demoAnswers: string[];
  figure: "crane" | "plotter";
  /** Flip-book margin notes keyed by section number. */
  margin: Record<number, string>;
}

/* ------------------------------------------------------------------ geotech */

const GEOTECH: Scenario = {
  id: "geotech",
  meta: DOC_META,
  display: "geotech SR, north pad",
  intro: "Let's put together a geotech service requisition. Six questions, then I'll draft it. Attach a soil report or an old SR if you have one and I'll pull answers from it.",
  questions: QUESTIONS,
  outline: buildOutline,
  sources: SOURCES,
  thinking: THINKING,
  nowLines: NOW_LINES,
  checks: [
    { at: 0, text: "Site and scope match your answers", detail: "Cover block and §1 read back your six answers." },
    { at: 1, text: "Layout follows SR-24-0098", detail: "Same clause order, so reviewers see a familiar shape." },
    { at: 3, text: "Borehole depth clears the crane pressure bulb", detail: "20 m against the vendor footing loads." },
    { at: 4, text: "SPT interval matches ASTM D1586", detail: "Every 1.5 m, 450 mm drive in three increments." },
    { at: 6, text: "Permit to dig before every hole", detail: "Services scan within 24 h, per the procedure." },
    { at: 9, text: "No price figures invented", detail: "Rates are left blank for the vendor to fill in." },
    { at: 10, text: "Clause numbers and cross-references resolve", detail: "Every §ref points at a real clause." },
  ],
  followUp: {
    at: 5,
    title: "should the contractor price standby for weather days?",
    opts: ["Yes, a day rate", "No, contractor carries it", "Leave it to them to propose"],
    ack: "Thanks. I added a standby line to the pricing schedule and carried on.",
    waitLine: "waiting on your answer about standby…",
  },
  demoAnswers: ["North pad", "Boreholes and lab testing", "Class D", "3 × 20 m", "Within 2 weeks", "Factual report"],
  figure: "crane",
  margin: { 4: "contractor confirms the class on site", 10: "rates left blank on purpose" },
};

/* ----------------------------------------------------------------- concrete */

const CONCRETE: Scenario = {
  id: "concrete",
  meta: { id: "SR-24-0122", type: "SR", title: "Concrete testing, pour 4", project: "Level 3 slab" },
  display: "concrete testing SR, pour 4",
  intro: "Let's set up concrete testing for a pour. Six questions, then I'll draft the SR. If you have the mix design or an old testing SR, attach it and I'll use it.",
  questions: [
    { key: "pour", title: "which pour is this for?", why: "Sets the location, the mix and the pour sequence on the cover page.", opts: ["Pour 4, level 3 slab", "Pour 5, core walls", "Pour 6, transfer beams"], ack: "Got it. I have the pour sequence drawing for that one." },
    { key: "tests", title: "what testing do you need?", why: "Decides the sampling clauses. Air content needs a technician at the truck.", opts: ["Cubes only", "Cubes and slump", "Cubes, slump and air content"], ack: "Okay, I will add field tests at the point of discharge." },
    { key: "grade", title: "what's the specified concrete grade?", why: "Sets the target strength the lab reports against.", opts: ["C30/37", "C32/40", "C40/50"], ack: "Noted. I'll pull the acceptance criteria for that grade." },
    { key: "frequency", title: "how often should they sample?", why: "This is the biggest cost line. Labs price per set of cubes.", opts: ["Every 50 m³", "Every 75 m³", "Every truck"], ack: "With a minimum of one set per pour, that works." },
    { key: "timing", title: "when is the pour?", why: "Goes into mobilisation and the night work clause.", opts: ["Next week", "In two weeks", "Not scheduled yet"], ack: "Okay." },
    { key: "results", title: "which results do you need?", why: "Extra test ages mean extra cubes and a longer contract.", opts: ["7 and 28 day", "7, 28 and 56 day", "Early age too"], ack: "That is the last one." },
  ],
  outline: (a) => {
    const A = (i: number, d: string) => a[i] || d;
    return rows([
      ["Purpose and background", 1, `Sample and test concrete for ${A(0, "[pour]").toLowerCase()} to confirm it meets the specified grade.`],
      ["Scope of work", 3, `${A(1, "[tests]")}, sampled ${A(3, "[frequency]").toLowerCase()}, curing, transport and testing at an accredited lab.`],
      ["Site information and access", 2, "Access through gate 2, sampling at the pump, curing tank in the site lab container."],
      ["Specification and acceptance", 2, `Grade ${A(2, "[grade]")}. Results judged against the project concrete specification and the mix design.`],
      ["Sampling and field testing", 4, "Samples at the point of discharge, slump and temperature per truck, cubes made and marked on site."],
      ["Laboratory testing", 3, `Compressive strength at ${A(5, "[ages]").toLowerCase()}, density, and a failure report for any low result.`],
      ["HSE requirements", 2, "Work near the pump boom, PPE for wet concrete, no lone working on night pours."],
      ["Schedule and milestones", 1, `Pour ${A(4, "[timing]").toLowerCase()}. Cubes collected within 24 h, results within two days of each test age.`],
      ["Reporting", 2, "Daily field sheet, test certificates per set, and a summary table for the pour."],
      ["Commercial and pricing schedule", 3, "Rate per set of cubes, call-out rate for night pours, provisional sum for extra tests."],
      ["Appendices", 3, "Pour sequence drawing, mix design, sample labelling sheet, pricing schedule template."],
    ]);
  },
  sources: [
    { id: "std-conc", kind: "STANDARD", title: "Company concrete testing standard", why: "Clause structure and acceptance rules.", at: 0, sec: "§1–4" },
    { id: "sr-0088", kind: "PAST SR", title: "SR-24-0088 · Concrete testing, pour 2", why: "Same slab, earlier pour. Reused the layout and rates table.", at: 1, sec: "§2, §10" },
    { id: "pour-seq", kind: "DRAWING", title: "Level 3 pour sequence, rev B", why: "Pour areas, volumes and the pump position.", at: 2, sec: "§3, App. A" },
    { id: "en-12350", kind: "STANDARD", title: "EN 12350 · Testing fresh concrete", why: "Sampling, slump and air content methods.", at: 4, sec: "§5" },
    { id: "en-12390", kind: "STANDARD", title: "EN 12390 · Testing hardened concrete", why: "Making, curing and crushing the cubes.", at: 5, sec: "§6" },
    { id: "night-work", kind: "PROCEDURE", title: "Night work and pour access procedure", why: "Lighting, access and supervision for late pours.", at: 6, sec: "§7" },
    { id: "price-tpl", kind: "TEMPLATE", title: "Pricing schedule template", why: "Rates per set, call-outs, provisional sums.", at: 9, sec: "§10" },
  ],
  thinking: [
    { head: "Read your answers", body: "Pour 4 on the level 3 slab, cubes plus slump and air, grade C32/40.", uses: ["std-conc"] },
    { head: "Found a similar SR", body: "SR-24-0088 covered pour 2 on the same slab. Using its layout.", uses: ["sr-0088"] },
    { head: "Checked the pour drawing", body: "About 180 m³ from one pump at the north edge. Sampling goes there.", uses: ["pour-seq"] },
    { head: "Set acceptance", body: "Judged against the project spec for C32/40, not a generic rule." },
    { head: "Wrote field testing", body: "Slump and temperature per truck, air content per sample set.", uses: ["en-12350"] },
    { head: "Asked about spares", body: "Spare cubes help if a result is low, so I asked instead of guessing." },
    { head: "Wrote lab testing", body: "Cube making, curing and crushing per the standard.", uses: ["en-12390"] },
    { head: "Added HSE", body: "Night pour lighting and supervision from the site procedure.", uses: ["night-work"] },
    { head: "Set the schedule", body: "Collect within 24 h, results two days after each age." },
    { head: "Priced it", body: "Rate per set, night call-out, provisional sum for extra tests.", uses: ["price-tpl", "sr-0088"] },
    { head: "Final pass", body: "Numbered clauses, cross-references and the cover block." },
  ],
  nowLines: [
    "reading the concrete testing standard…", "opening SR-24-0088 from pour 2…", "checking the level 3 pour sequence…",
    "setting acceptance for the grade…", "writing field testing…", "writing the lab testing section…",
    "adding night work steps…", "writing the schedule…", "writing the reporting section…", "building the pricing schedule…", "final pass on numbering…",
  ],
  checks: [
    { at: 0, text: "Pour and grade match your answers", detail: "Cover block and §1 read back your six answers." },
    { at: 2, text: "Sampling point matches the pour drawing", detail: "At the pump, north edge of the slab." },
    { at: 4, text: "Field tests follow EN 12350", detail: "Slump, temperature and air content methods." },
    { at: 6, text: "Cube curing follows EN 12390", detail: "Curing tank on site, then lab." },
    { at: 9, text: "No price figures invented", detail: "Rates are left blank for the lab to fill in." },
    { at: 10, text: "Clause numbers and cross-references resolve", detail: "Every §ref points at a real clause." },
  ],
  followUp: {
    at: 5,
    title: "should the lab keep spare cubes for retesting?",
    opts: ["Yes, two spares per set", "No spares", "Leave it to them to propose"],
    ack: "Thanks. I added spare cubes to the sampling clause and carried on.",
    waitLine: "waiting on your answer about spare cubes…",
  },
  demoAnswers: ["Pour 4, level 3 slab", "Cubes, slump and air content", "C32/40", "Every 50 m³", "In two weeks", "7 and 28 day"],
  figure: "plotter",
  margin: { 5: "one set minimum per pour", 10: "night call-out priced separately" },
};

/* -------------------------------------------------------------------- hydro */

const HYDRO: Scenario = {
  id: "hydro",
  meta: { id: "SR-24-0151", type: "SR", title: "Hydro test, cooling loop", project: "Cooling water system" },
  display: "hydro test SR, cooling loop",
  intro: "Let's write the hydro test SR. Six questions, then I'll draft it. Attach the line list or the test pack if you have them and I'll fill in what I can.",
  questions: [
    { key: "system", title: "which system is this for?", why: "Sets the line list, test boundaries and the system owner.", opts: ["Cooling water loop A", "Cooling water loop B", "Fire water ring main"], ack: "Got it. I have the P&ID and the line list for that one." },
    { key: "scope", title: "what does the contractor need to do?", why: "Decides the work sections. Flushing adds water treatment and disposal.", opts: ["Test only", "Test and flush", "Fill, test, flush and dry"], ack: "Okay, I will add flushing and water disposal." },
    { key: "pressure", title: "what's the design pressure?", why: "Test pressure comes from this, so it sets the pump and gauge range.", opts: ["10 bar", "16 bar", "25 bar"], ack: "Noted. Test pressure will be 1.5 times design." },
    { key: "packages", title: "how should it be split up?", why: "Each package needs its own blinds, vents and sign-off.", opts: ["One test package", "3 test packages", "By line number"], ack: "That fits the tie-in sequence." },
    { key: "timing", title: "when do you need it done?", why: "Goes into the schedule against mechanical completion.", opts: ["Before mechanical completion", "This month", "Next quarter"], ack: "Okay." },
    { key: "records", title: "what should they hand over?", why: "Certificates are the minimum. A full test pack is what commissioning wants.", opts: ["Test certificates", "Certificates and charts", "Full test pack"], ack: "That is the last one." },
  ],
  outline: (a) => {
    const A = (i: number, d: string) => a[i] || d;
    return rows([
      ["Purpose and background", 1, `Pressure test ${A(0, "[system]").toLowerCase()} to prove it is tight before commissioning.`],
      ["Scope of work", 3, `${A(1, "[scope]")}, split into ${A(3, "[packages]").toLowerCase()}, including temporary blinds, vents and drains.`],
      ["System description", 2, "Carbon steel cooling water lines, 2 to 12 inch, with two pump tie-ins and one heat exchanger."],
      ["Test boundaries and isolation", 3, "Boundaries marked on the P&ID, blinds logged, instruments and relief valves removed or isolated."],
      ["Test procedure", 4, `Design ${A(2, "[pressure]")}, test at 1.5 times design, hold for 30 minutes, inspect every joint.`],
      ["Flushing and water disposal", 2, "Flush to clear water, sample before discharge, dispose through the site drain permit."],
      ["HSE requirements", 3, "Stored energy controls, exclusion zone during pressurisation, calibrated gauges only."],
      ["Schedule and milestones", 1, `Complete ${A(4, "[timing]").toLowerCase()}. One package a week after line walks are signed.`],
      ["Records and test packs", 2, `${A(5, "[records]")}, blind register and punch list, in the project test pack template.`],
      ["Commercial and pricing schedule", 3, "Lump sum per package, rate for retests, provisional sum for extra blinds."],
      ["Appendices", 4, "P&ID with test boundaries, line list, blind register, pricing schedule template."],
    ]);
  },
  sources: [
    { id: "std-press", kind: "STANDARD", title: "Company pressure testing standard", why: "Clause structure, hold times and acceptance.", at: 0, sec: "§1, §5" },
    { id: "sr-0076", kind: "PAST SR", title: "SR-24-0076 · Hydro test, fire water", why: "A similar test. Reused the layout and package split.", at: 1, sec: "§2, §10" },
    { id: "pid-a", kind: "DRAWING", title: "Cooling water P&ID, loop A, rev D", why: "Line sizes, tie-ins and test boundaries.", at: 2, sec: "§3, §4" },
    { id: "b31-3", kind: "STANDARD", title: "ASME B31.3 · Leak testing", why: "Test pressure factor and hold time.", at: 4, sec: "§5" },
    { id: "stored-energy", kind: "PROCEDURE", title: "Stored energy and pressure test safety procedure", why: "Exclusion zones and gauge rules.", at: 6, sec: "§7" },
    { id: "testpack-tpl", kind: "TEMPLATE", title: "Test pack template", why: "Certificates, charts and the blind register.", at: 8, sec: "§9" },
    { id: "price-tpl", kind: "TEMPLATE", title: "Pricing schedule template", why: "Lump sums, retest rates, provisional sums.", at: 9, sec: "§10" },
  ],
  thinking: [
    { head: "Read your answers", body: "Loop A, test and flush, 16 bar design, three packages.", uses: ["std-press"] },
    { head: "Found a similar SR", body: "SR-24-0076 tested the fire water main. Using its package split.", uses: ["sr-0076"] },
    { head: "Checked the P&ID", body: "Two pump tie-ins and an exchanger. Marked the boundaries around them.", uses: ["pid-a"] },
    { head: "Set isolations", body: "Relief valves and instruments out or isolated before filling.", uses: ["pid-a"] },
    { head: "Wrote the test procedure", body: "1.5 times design, 30 minute hold, every joint inspected.", uses: ["b31-3", "std-press"] },
    { head: "Asked about test water", body: "Water source changes flushing and disposal, so I asked instead of guessing." },
    { head: "Added HSE", body: "Exclusion zone during pressurisation and calibrated gauges.", uses: ["stored-energy"] },
    { head: "Set the schedule", body: "One package a week once line walks are signed." },
    { head: "Listed records", body: "Certificates, charts and the blind register in the test pack.", uses: ["testpack-tpl"] },
    { head: "Priced it", body: "Lump sum per package, retest rate, provisional sums.", uses: ["price-tpl", "sr-0076"] },
    { head: "Final pass", body: "Numbered clauses, cross-references and the cover block." },
  ],
  nowLines: [
    "reading the pressure testing standard…", "opening SR-24-0076 for fire water…", "checking the loop A P&ID…",
    "marking test boundaries…", "writing the test procedure…", "writing flushing and disposal…",
    "adding stored energy controls…", "writing the schedule…", "listing test pack records…", "building the pricing schedule…", "final pass on numbering…",
  ],
  checks: [
    { at: 0, text: "System and scope match your answers", detail: "Cover block and §1 read back your six answers." },
    { at: 2, text: "Boundaries match the P&ID", detail: "Both pump tie-ins and the exchanger are inside a package." },
    { at: 4, text: "Test pressure follows ASME B31.3", detail: "1.5 times design with a 30 minute hold." },
    { at: 6, text: "Exclusion zone before pressurising", detail: "Per the stored energy procedure." },
    { at: 9, text: "No price figures invented", detail: "Rates are left blank for the contractor to fill in." },
    { at: 10, text: "Clause numbers and cross-references resolve", detail: "Every §ref points at a real clause." },
  ],
  followUp: {
    at: 5,
    title: "can they use site water for the test?",
    opts: ["Yes, from the fire main", "No, bring treated water", "Leave it to them to propose"],
    ack: "Thanks. I noted the water source in the scope and carried on.",
    waitLine: "waiting on your answer about test water…",
  },
  demoAnswers: ["Cooling water loop A", "Test and flush", "16 bar", "3 test packages", "Before mechanical completion", "Full test pack"],
  figure: "crane",
  margin: { 5: "hold time per the standard", 9: "blind register signed per package" },
};

function rows(r: [string, number, string][]): Section[] {
  return r.map(([title, pages, body], i) => ({ n: i + 1, title, pages, body }));
}

export const SCENARIOS: Record<string, Scenario> = { geotech: GEOTECH, concrete: CONCRETE, hydro: HYDRO };
export const DEFAULT_SCENARIO = GEOTECH;
