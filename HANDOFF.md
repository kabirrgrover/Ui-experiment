# Handoff: AI Docbuilder UI

Read this first if you're picking up the front end. Everything you need is in this repo.

## TL;DR

- **The real code is `app/`.** React 19 + TypeScript + Vite. No UI libraries, no router library, no CSS framework.
- **Run:** `cd app && npm install && npm run dev` (http://localhost:5173)
- **Ship:** `npm run build && npm start`. `server.mjs` serves `dist/` on `DATABRICKS_APP_PORT` (or `PORT`, default 8000). `app.yaml` is the Databricks Apps entry.
- **Look before you touch:** `screenshots/` has every screen at desktop (1440) and phone (390).
- **Spec vs code:** `screens/*.dc.html` are the original design artboards (spec only, they don't run). If code and spec disagree, the code is newer, but check `screenshots/`.

## Routes

| Route | Screen | Folder |
|---|---|---|
| `/` | Spec Street: hero, input, stickers, endless street of doc-type doors, "next up" coming-soon lots | `src/screens/street/` |
| `/chat` | Guided SR chat → live drafting → flip-book reveal | `src/screens/chat/` |
| `/canvas` | Markup canvas for the drafted doc | `src/screens/canvas/` |
| `/folders` | Frosted pastel folders, opened folder view | `src/screens/folders/` |

### Deep links (handy for demos, tests and screenshots)

- **Chat:**
  - `?past=1` opens past chats on the crane
  - `?state=ask|drafting|wait|done` jumps to a phase
  - `&book=1` opens the flip-book
  - `&panel=1` opens thinking & sources
  - `&figure=crane|plotter` picks the drafting figure
  - `?type=sr|mr|pep&kind=<slug>` comes from a street door
  - `?q=<text>` comes from the hero input
- **Folders:** `?open=sr|mr|pep|north|subb|shared` opens a folder

## Layout of `app/src`

```
App.tsx                 lazy-loads one screen per route
lib/router.ts           ~40-line router: usePath, navigate (View Transitions), linkTo, useQuery
lib/assets.ts           sticker name -> /assets path map
styles/tokens.css       GENERATED from design-system/tokens.json (colours, type, spacing, motion)
styles/components.css   design-system component classes (db-btn, db-chip, db-sticky, db-stamp…)
styles/global.css       base + graph paper + reduced motion
data/geotechSR.ts       ALL demo content: questions, outline, sources, thinking steps. Replace with API data.
components/AppHeader    shared top bar (sticker pops in on nav hover)
components/thinking/    ThinkingPanel + ThinkingHandle (new "thinking & sources" drawer)
components/flipbook/    DocFlipbook (doc-ready 3D page-flip reveal)
components/fx/          small polish, no deps: ScrambleText (drafting status line), CountUp (folder counts),
                        InkSparks (ink burst on primary buttons and answer picks, opt in with data-spark),
                        AsciiSite (drifting ASCII building site above the Spec Street footer)
screens/<name>/         one folder per screen, own CSS file with a prefix (st- ch- cv- fo-)
```

## How the pieces behave

- **Chat state** is one reducer in `screens/chat/state.ts`.
  - Phases go `ask → write → wait → write → done`.
  - Drafting ticks every 900 ms per section, and pauses at section 6 for the standby follow-up question.
  - When it finishes, the flip-book opens once automatically. "view draft" reopens it.
- **Drafting figures** are stacked SVG layers in `public/assets/crane-*.svg` and `plotter-*.svg`. `DraftFigure.tsx` moves them with CSS:
  - The hoist moves by `translateY(-2.385 * n %)`.
  - The rope height is `((136.42 - 12.401 * n) / 5.2)%`.
  - n is the number of sections done.
- **Thinking & sources** (`components/thinking/`):
  - Tabs: Thinking, Sources and Checks.
  - The current step streams in word by word.
  - Steps link to the sources they used; hovering one highlights the other.
  - Source cards go queued → reading → used, with a stamp landing on used.
  - A ring shows how many sources have been used.
  - Under 640 px it becomes a bottom sheet.
  - Props: `{ open, onClose, phase, done, answers, onJumpToSection }`. Keep it mounted and toggle `open`.
- **Flip-book** (`components/flipbook/`):
  - A `<dialog>` with a 3D cover flip, a riffle through the section pages, then it settles on the contents spread.
  - You can flip manually with click, drag, swipe or the arrow keys.
  - Under ~620 px it shows a single page.
- **Canvas** (`screens/canvas/`):
  - The board state and undo/redo (100 steps) live in `useBoard.ts`.
  - Pointer drags write transforms through refs, so React doesn't re-render on every frame.
  - Tools: V select, H hand, P pen, Y highlighter (then ask AI), N note, S sticker, E eraser.
  - Also: Space or middle-click pans, Ctrl/Cmd+wheel zooms at the cursor, Ctrl/Cmd+C/X/V copy, cut and paste notes and stickers, Delete removes, Ctrl/Cmd+Z undoes.
- **Folders:** data lives in `foldersData.ts`. The frosted look is `backdrop-filter` plus a clip-path tab.

## Scope

This UI is for the POC. Keep features small. Notes from review:
- Sources the AI reads are stripped reference docs users never see, so don't build user-facing "came from doc X" links.
- No keyboard-shortcut features for now.
- Assigned comments: only worth it for PEP later.
- Polish is welcome if subtle: React Bits style effects (hand-written, no new deps) and light ASCII motion.

## Design rules (don't break these)

Full brand book: `design-system/README.md`. The short version:

- **White page.** Colour only in stickers, sticky notes, folders and the one primary action (safety orange `#f0662a`).
- **Three fonts only:**
  - Coming Soon for display lines and questions.
  - Shantell Sans for handwriting: notes, labels, AI asides in blue.
  - Instrument Sans for everything else. Buttons are 600 at 15 px.
- **Stickers have a job.** No sticker spam on working surfaces.
- **Copy:**
  - Short, plain, like a site engineer.
  - No exclamation marks, no emoji, no em dashes.
  - The AI never invents numbers; it asks.
- **Accessibility:**
  - Respect `prefers-reduced-motion` everywhere.
  - Keyboard focus is a 2 px blue outline.
  - Phone width 390 must not scroll sideways.

## Other folders in the repo

- `design-system/` holds the tokens, components (`preview.html` + `README.md` each), fonts and every sticker, doodle and stamp.
- `figures/` has:
  - `crane/` and `plotter/`: the drafting-wait figures.
  - `parts/`: "Anatomy of AI DocBuilder", one bench whose 7 modules are the product's parts. Light and dark layers; `parts.json` has the module ids and bounding boxes so you can highlight a module on hover. See its README.
  - Rebuild any of them with `node figures/<name>/build.mjs` (Node 20+).
- `anatomy/` is the vendored isometric drawing kit the figures use.
- `screens/` holds the original Claude Design artboards (spec reference) plus `assets/`.
- `generators/` has the scripts that drew the stickers, buildings and street.
- `screenshots/` is regenerated with `cd app && npm run build && npm run shots` (needs Chromium; set `CHROME=/path`).

## Roadmap shown on the main screen

`src/screens/street/ComingSoon.tsx` lists what's next as "coming soon" lots (name and code only, no descriptions yet, no logic):
SRQ (SR for quote), bid period support, TBE (technical bid evaluation), SRP (SR conformed for award),
appendices, and agile click-by-click data entry. When one ships, remove it from `LOTS` and add it as a real door or flow.

## Not done yet / honest gaps

- **No backend.**
  - Content is static demo data in `src/data/geotechSR.ts`.
  - "download" in chat saves a Markdown file, not a real `.docx`. The flip-book's download button calls the same export.
  - Share and download on the canvas are placeholders.
- **Canvas:**
  - Typing inside a note isn't in the undo history.
  - The highlighter draws a yellow stroke; it doesn't select the text underneath.
  - Pinch zoom is wired up but untested on a real device.
  - On phones it opens at 46% and the page spills off the right; zoom-to-fit on phone would be nicer.
- **Headers:** Chat, Folders and Street share one header. Canvas has its own compact header, as in the spec.
- **Accounts:** the avatar is static ("K").
