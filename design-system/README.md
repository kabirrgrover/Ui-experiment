AI Docbuilder drafts engineering and construction documents (service requisitions, material requisitions, project execution plans) through a guided chat, then lets people mark them up on a canvas. This system makes it feel like the references: a white page, thin black handwriting (HeyTea), a big quiet grotesk with monoline doodles (Woset), happy bold stickers (Sand Studio, DRAE OHARU), pinned sticky notes (MyNote) and pastel folders stuffed with work.

## Principles

- **White page, loud moments.** Most of a screen is white and black with plenty of air, like HeyTea and Woset. Colour and stickers show up where something happens: a status changes, a document is ready, a tool is active.
- **Every sticker has a job.** SR type stickers are the storefront signs and folder covers. Stamps are document status. Doc tags say SR, MR or PEP. Slogan stickers fill empty and loading states. Nothing is pure decoration on a working surface.
- **Hand-drawn, never sloppy.** Lines wobble a little; type and spacing stay precise. The document itself is always set in clean `sans` so it reads as a real deliverable.
- **Useful first.** The tools (chat, canvas, notes) must be faster than a Word template, or the charm is wasted.

## Voice

The AI talks like a helpful site engineer: short, plain, specific. It says what it will do next and how many questions are left. Lowercase is fine in display lines ("what's the expected soil class?"); body copy and buttons are sentence case. No exclamation marks, no emoji, no "Great question". It never invents numbers or spec references; it asks.

Good: "Two more questions, then I'll draft it." · "I changed the depth to 20 m to match the crane vendor's note."
Avoid: "Awesome! Let's get started on your amazing SR!"

## Colour

- The whole platform is plain white `paper`. No tinted or dark grounds. `paper-sunk` (barely grey) is only for wells: the composer, inactive tabs, the canvas backdrop.
- Text and drawings are `ink` (near black). Secondary text `ink-muted`. `pencil` for thin lines that mean something; `rule` for decoration.
- Colour lives in stickers, folders and sticky notes, never in large UI surfaces. UI accents: `safety` (primary action, SR), `blue` (links, focus, MR, AI notes), `green` (approved, PEP), `red` (hold, delete), `yellow` (caution). Each fill has an `on-` token. `safety` is never text on white.
- `highlight` is the highlighter pen and the selection colour.
- Sticky notes: `sticky-yellow` with its darker `sticky-yellow-top` glue band, `sticky-peach`, `sticky-green`. Folders: `folder-pink`, `folder-sage`, `folder-peach`, `folder-butter`, `folder-lilac`, `folder-sky`. Text on all of them is `on-sticky`.

## Type

Three fonts, no more.

- `display` (Coming Soon): the thin, childlike lettering from the HeyTea poster. Page titles and the AI's questions. Lowercase is fine. One big line per screen.
- `hand` (Shantell Sans): everything else handwritten. Sticky notes (`note`, `note-strong`), folder names and labels (`label`, bold), the AI's margin notes (`aside`, usually `blue`).
- `sans` (Instrument Sans): everything you read for real. Chat messages, buttons, the document body, big Woset-style `headline`s, document numbers (`doc-id`, tabular figures) and uppercase `field-label`s.

Never set a paragraph in a hand face. Sticker lettering is baked into the sticker art and does not count as a UI font.

## Illustration

People and objects are drawn in thin black monoline with at most one colour spot, like the Woset characters and the binoculars line drawing. Product photos, if ever used, sit on white with a single hand-drawn line around them, like the HeyTea cup.

## Shape, line and space

- Outlines are `stroke-ink` (2px) in `ink`, with uneven radii so boxes look hand-drawn (`.db-btn`). Doodles and the sketchpen default to `stroke-marker`.
- Corners: `radius-s` for stamps and tags, `radius-m` for inputs and cards, `radius-folder` for folders, `radius-l` for the composer and bubbles.
- Spacing runs on `space-1` to `space-16`. Give display type `space-12` above and below.
- Two shadows only: `shadow-lift` for things stuck onto the page (stickies, stickers), `shadow-sheet` for document pages and popovers. Buttons use a hard 2px ink offset on hover instead.
- Focus: 2px solid `focus` ring, 2px offset, on everything interactive.

## Motion

Motion is physical and short.
- Doodles and underlines draw themselves in over `dur-draw` (`.db-draw`).
- Stickers and stamps land with `ease-slap`, a slight overshoot like slapping them on paper (`.is-landing`).
- Panels and tabs move over `dur-base` with `ease-out`.
- The doc-ready moment uses the `flip-book` web asset, one turn per `dur-flip`, then offers Download or Open in canvas.
- Respect `prefers-reduced-motion`: everything lands in its final state.

## Stickers and assets

The sticker kit follows the Sand Studio and DRAE OHARU references: flat bold colour, white die-cut edge, soft shadow, mixed type (serif italic, script, heavy grotesk, pixel), and a site twist.

- `assets/Stickers/`: 46 stickers. Four illustrated ones came from ChatGPT and are PNG (`cone`, `tool-tape-measure`, `tool-crane`, `peace-glove`): thicker outlines and shading, so use them as hero pieces (empty states, the doc-ready moment), not in tight UI. The rest are vector. Slogans (`measure-twice`, `draft-review-issue`, `dont-just-spec`, `good-docs-ship-first`, `safety-over-speed`, `turn-notes-into-srs`, `make-it-clear`...), "Hello, I'm" name tags per document type (`hello-sr`, `hello-mr`, `hello-pep`), tools (`tool-hammer`, `tool-wrench`, `tool-tape-measure`, `tool-crane`, `tool-level`, `tool-scale-ruler`, `tool-screwdriver`, `tool-pencil`, `tool-bolt`) and happy randoms (peace hands, `globe-eyes`, `hard-hat-eyes`, `eyes`, `smiley`, bursts, sparkles, `checker`, `hazard-tape`).
- `assets/SR Types/`: thin monoline doodles, one per service requisition type, in the Woset line style: black line, one spot of colour. Use on storefronts, folder covers and empty states.
- `assets/Stamps/`: rubber stamps for exports. In the app use the `Stamp` component.
- `assets/Doodles/`: arrows, scribbles, check, cross, tape, pin, paperclip, highlighter swash for annotation. Animate with `.db-draw`.

Where they go: stickers are for moments, not every page. Use them on empty states, the doc-ready reveal, folder covers and the sticker drawer on the canvas. Pages whose visual is already doing the work (the storefront street, the chat, the document) carry none or one. Never over text the user needs to read. Tilt them between -12deg and 12deg; slap them in with `ease-slap`.

## Web assets to reuse

From github.com/kabirrgrover/web-assets: `storefront-street` (document type picker, restyled with `--ss-*` vars to these tokens), `hanging-badges` (past chats), `flip-book` (doc-ready reveal), `redline` (AI edits on the canvas).
