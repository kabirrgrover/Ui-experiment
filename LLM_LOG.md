# Log for the front-end LLM (AI DocBuilder POC)

Read this, then `HANDOFF.md`. Newest entries at the top. Each entry says what the owner (Kabir) asked for and what to do.

---

## 2026-10-21 · POC demo setup (do this)

**Context.** This is a POC. The goal is to show what we've built, not to build everything. Hardcoded front end is fine where the backend isn't ready.

**Source of truth for the UI.** Use `app/` in this repo (React 19 + TypeScript + Vite) and `screenshots/`. Match its fonts and look:
- Coming Soon for display lines and questions
- Shantell Sans for handwriting
- Instrument Sans for everything else; buttons are 600 at 15px
- white page

Do NOT reuse the old fonts or the older UI from earlier sessions. If something you have looks different from `screenshots/`, `screenshots/` wins.

### Bechtel logo

- Put the Bechtel logo in the header on every screen. Left of the "AI Docbuilder" wordmark is the default. Use the right side of the header if it reads better there.
- Use the official logo file from Bechtel's brand assets. Don't redraw or recreate it.
- Keep it small, about the height of the wordmark, in its official colours, with clear space around it. The rest of the header stays as it is.
- In `app/`, the header has a slot for it: drop the file at `app/public/brand/bechtel-logo.svg` (or .png) and it shows up.

### Chat window tabs

- `+` in the tab strip and the header "New chat" both open a new tab with a fresh chat. Every tab has a working close (×).
- Each tab is its own session, and tabs keep running in the background when you switch away.
- **Start state, in this order:**
  1. **SR tab 1, demo:** Geotech, North pad
  2. **SR tab 2, demo:** a second SR (in `app/`: Concrete testing, pour 4)
  3. **SR tab 3, demo:** a third SR (in `app/`: Hydro test, cooling loop)
  4. **MR tab:** title only, e.g. "MR · Rebar, level 2". Not runnable yet.
  5. **MR tab (optional):** title only, e.g. "MR · Cable trays, substation B".
  6. **Live run tab:** a real run against the backend. The user answers the questions and the real pipeline drafts. If the backend isn't wired yet, fall back to the interactive demo flow.
- **The 3 SR demo tabs autoplay on load, staggered so they're at different stages.** Each one shows the whole flow:
  - the questions being answered
  - drafting with the figure building (crane or plotter layers from `figures/`)
  - the thinking & sources panel filling live: reasoning steps, source cards, checks
  - the mid-draft follow-up question
  - the done state and the flip-book reveal
- **No speed controls.** No 1x / 2x / 3x buttons anywhere.

### Thinking & sources

- Sources are stripped internal reference docs users never open. Show name, type, what it was used for, and which sections it fed.
- No quotes from the docs and no "open source" links.

### Canvas page

- Load a REAL document we generated: an actual SR output from the pipeline, not lorem or placeholder text. If it has to be hardcoded for the demo, paste in the real generated SR content.
- Add 1 or 2 made-up sticky notes on it, e.g. "check the depth with the crane vendor before this goes out" and "who signs off the HSE section?".
- Keep the toolbar (select, hand, pen, highlighter → ask AI, note, sticker, eraser), zoom, pages panel and ask bar.

### Folders page

- It must exist, even if hardcoded. Use `app/src/screens/folders/`: frosted pastel folders, 1 or 2 stickers each, an opened folder view with doc cards and status stamps.

### Main page (Spec Street)

- Keep the "next up on Spec Street" coming-soon cards as names only (no one-liners):
  - SR for quote (SRQ)
  - Bid period support
  - Technical bid evaluation (TBE)
  - SR conformed for award (SRP)
  - Appendices
  - Agile data entry
- They're display only.

### Out of scope for now

- Keyboard-shortcut features
- User-facing "where this came from" links to reference docs
- Assigned comments: maybe later for PEP only
- Anything big. Small polish is fine: subtle React Bits-style effects and light ASCII motion, nothing loud.

---

## Earlier

- **Figures:** `figures/crane`, `figures/plotter` and `figures/parts` ("Anatomy of AI DocBuilder"), all built with the vendored `anatomy/` kit. `figures/parts/parts.json` has the module ids and bounding boxes for hover highlighting.
- **Design system:** `design-system/` (tokens, components, stickers, fonts).
- **Repo layout:** see `README.md` and `HANDOFF.md`.
