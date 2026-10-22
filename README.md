# AI Docbuilder · UI experiment

Design exploration for AI Docbuilder: a guided chat that drafts construction and engineering documents (SR, MR, PEP), plus a canvas to mark them up and folders to keep them in. White page, colour only in stickers, sticky notes and folders. References: HeyTea, Woset, Sand Studio / DRAE sticker kits, MyNote, frosted pastel folders.

**Start with [HANDOFF.md](HANDOFF.md).** The working front end is `app/` (React 19 + TypeScript + Vite, Databricks Apps ready). Screenshots of every screen are in `screenshots/`.

## What's in here

```
app/               the React 19 + TS app: all four screens, thinking & sources panel, flip-book reveal
screenshots/       every screen at desktop and phone width, plus the parts figure

design-system/     tokens, brand README, components, fonts, all sticker/doodle/stamp assets
  tokens.json        colours, type (Coming Soon / Shantell Sans / Instrument Sans), radii, motion
  components/        Button, Chip, DocTag, StickyNote, Folder, Chat, Stamp, Marks, WorkspaceTabs, Cover
                     each has preview.html + README.md; bundle.css holds all component styles
  assets/            Stickers (44 SVG + 4 PNG), SR Types (11 doodles), Doodles, Stamps
  fonts/             woff2 files (all OFL)

screens/           the original Claude Design artboards (spec reference for app/)
  Main.dc.html       Spec Street: the endless storefront selector for doc types
  Chat.dc.html       guided questions, crane past-chats, drafting stage, thinking & sources drawer
  Canvas.dc.html     Figma/Excalidraw style markup canvas with pages, pen, highlighter, notes, stickers
  Folders.dc.html    frosted pastel folders with stickers and doc cards
  canvas.json        board layout
  assets/            every image the screens reference
  blob-map.json      original hosted asset id -> local file (screens already rewritten to local paths)

anatomy/           the anatomy skill, vendored (kit used by figures/)

figures/           isometric drafting-wait figures (built with the anatomy kit)
  crane/             tower crane that stacks storeys as the doc drafts; build.mjs + layer SVGs
  plotter/           pen plotter that draws pages; build.mjs + layer SVGs
  parts/             Anatomy of AI DocBuilder: the product's 7 parts as one bench; light + dark layers, parts.json

generators/        Python / Node scripts that drew the stickers, doodles, buildings and street
references/        sticker sheets and the GPT-made PNG stickers (cone, tape, crane, glove)
```

## Notes

- The `.dc.html` files use the Claude Design canvas format (`<x-dc>`, `{{holes}}`, `<sc-for>`, `<sc-if>`, a `DCLogic` class). They won't run as plain HTML; treat them as the spec for markup, styles and behaviour when porting.
- Figures are split into stacked SVG layers and animated with CSS transforms (hoist moves `translateY(-2.385 * n %)`, rope height `((136.42 - 12.401 * n) / 5.2)%`). Layer geometry lives in `crane.json` / `plotter.json`.
- `anatomy/` is the full anatomy skill (SKILL.md, kit, scripts, references, examples). The figure builds import it by relative path, so `cd figures/crane && node build.mjs` works from a fresh clone. Built and checked on Node 22.22. No npm deps needed for the build; `kit/react/` needs react, and the capture scripts need a Chromium.
- Fonts: Coming Soon for display and questions, Shantell Sans for handwriting, Instrument Sans for everything else (buttons at 600 / 15px).
