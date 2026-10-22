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
| `/chat` | Tabbed chat workspace: 3 self-playing SR demos, 2 MR title tabs, a live run; guided questions → drafting → flip-book | `src/screens/chat/` |
| `/canvas` | Markup canvas for the drafted doc | `src/screens/canvas/` |
| `/folders` | Frosted pastel folders, opened folder view | `src/screens/folders/` |

### Deep links (handy for demos, tests and screenshots)

- **Chat:**
  - Plain `/chat` loads all tabs and starts the demos playing.
  - `?autoplay=0` loads the tabs without playing; demo tabs show three answers already in.
  - `?tab=<index>` picks the active tab (0 Geotech, 1 Concrete, 2 Hydro, 3 and 4 the MRs, 5 Live run).
  - `?new=1` opens a new live tab. `?type=…` from a street door and `?q=…` from the hero input do the same.
  - These pin the first SR tab and switch autoplay off, so screenshots stay the same every run:
    - `?past=1` opens past chats on the crane
    - `?state=ask|drafting|wait|done` jumps to a phase
    - `&book=1` opens the flip-book
    - `&panel=1` opens thinking & sources
    - `&figure=crane|plotter` picks the drafting figure
- **Folders:** `?open=sr|mr|pep|north|subb|shared` opens a folder

## Layout of `app/src`

```
App.tsx                 lazy-loads one screen per route
lib/router.ts           ~40-line router: usePath, navigate (View Transitions), linkTo, useQuery
lib/assets.ts           sticker name -> /assets path map
styles/tokens.css       GENERATED from design-system/tokens.json (colours, type, spacing, motion)
styles/components.css   design-system component classes (db-btn, db-chip, db-sticky, db-stamp…)
styles/global.css       base + graph paper + reduced motion
data/geotechSR.ts       the geotech demo content plus shared types (Question, Section, Source, ThoughtStep)
data/scenarios.ts       every SR the chat can run: geotech, concrete, hydro. One Scenario = questions, outline,
                        sources, thinking steps, now-lines, checks, follow-up, demo answers, figure. Replace with API data.
components/AppHeader    shared top bar (sticker pops in on nav hover)
components/BrandLogo    company logo slot: drop the official file at public/brand/bechtel-logo.svg (or .png); renders nothing until then. Never redraw it.
components/thinking/    ThinkingPanel + ThinkingHandle (new "thinking & sources" drawer)
components/flipbook/    DocFlipbook (doc-ready 3D page-flip reveal)
components/fx/          small polish, no deps: ScrambleText (drafting status line), CountUp (folder counts),
                        InkSparks (ink burst on primary buttons and answer picks, opt in with data-spark),
                        AsciiSite (drifting ASCII building site above the Spec Street footer)
screens/<name>/         one folder per screen, own CSS file with a prefix (st- ch- cv- fo-)
```

## How the pieces behave

- **Chat tabs** (`screens/chat/ChatScreen.tsx`). The screen only owns the tab list and which tab is active.
  - Every tab is its own session (`ChatSession.tsx`) with its own reducer (`state.ts`).
  - All sessions stay mounted. Inactive ones are just `hidden`, so demos keep playing in background tabs.
  - Only the active tab renders the fixed thinking handle and panel, and the flip-book.
  - Starting tabs (`INITIAL_TABS` in `state.ts`):
    - **3 SR demos that play themselves:** Geotech, North pad (crane), Concrete testing, pour 4 (plotter), Hydro test, cooling loop (crane). A pulsing orange dot means a demo is playing.
    - **2 MR tabs, titles only:** Rebar, level 2 and Cable trays, substation B. They show a "MR drafting is coming soon" placeholder.
    - **1 Live run tab** (blue dot): the geotech questions, answered by you.
  - "+" in the tab strip, or the header's New chat while you're on /chat, opens a new live tab. From other screens, New chat goes to `/chat?new=1`.
  - Any tab can be closed. Closing the active one activates its neighbour; closing them all shows an empty state.
  - Past chats from the crane open as title-only tabs.
- **Autoplay** (inside `ChatSession.tsx`):
  - Each demo waits for its tab's `delay` (0, 2.5 and 5 s) so the three are at different stages.
  - For each question it thinks for 0.9 s, shows its pick pressed for 0.5 s, then answers (about 1.4 s per question), with the user bubble and the AI's reply.
  - Then it waits 1.2 s and drafts at 900 ms per section, with the figure building and the thinking panel filling live.
  - At the follow-up question it waits 1.5 s, shows its pick, answers, and carries on to done. A full run is about 25 s.
  - **Taking over:** a real click on an answer, the composer, the stepper, or a user bubble stops the demo for that tab and hands it to you.
  - **Flip-book:** it opens only if the tab is in front when the draft finishes, or the first time you switch to a finished tab.
  - "replay demo" on a finished demo restarts it; on a live tab the same link says "start over".
  - There are no speed controls, by design.
- **Session phases** go `ask → write → wait → write → done`. The pause comes at `followUp.at` (section 6 in all three demos).
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
  - Props: `{ open, onClose, phase, done, answers, onJumpToSection, scenario }`. Keep it mounted and toggle `open`. `scenario` decides which reasoning, sources and checks it shows.
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
