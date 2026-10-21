# AI Docbuilder · UI experiment

Design exploration for AI Docbuilder: a guided chat that drafts construction and engineering documents (SR, MR, PEP), plus a canvas to mark them up and folders to keep them in. White page, colour only in stickers, sticky notes and folders. References: HeyTea, Woset, Sand Studio / DRAE sticker kits, MyNote, frosted pastel folders.

This is a design skeleton, not a production app. The screens are meant to be ported to React for Databricks Apps.

## What's in here

```
design-system/     tokens, brand README, components, fonts, all sticker/doodle/stamp assets
  tokens.json        colours, type (Coming Soon / Shantell Sans / Instrument Sans), radii, motion
  components/        Button, Chip, DocTag, StickyNote, Folder, Chat, Stamp, Marks, WorkspaceTabs, Cover
                     each has preview.html + README.md; bundle.css holds all component styles
  assets/            Stickers (44 SVG + 4 PNG), SR Types (11 doodles), Doodles, Stamps
  fonts/             woff2 files (all OFL)

screens/           the four screens as Claude Design canvas artboards
  Main.dc.html       Spec Street: the endless storefront selector for doc types
  Chat.dc.html       guided questions, crane past-chats, drafting stage, thinking & sources drawer
  Canvas.dc.html     Figma/Excalidraw style markup canvas with pages, pen, highlighter, notes, stickers
  Folders.dc.html    frosted pastel folders with stickers and doc cards
  canvas.json        board layout
  assets/            every image the screens reference
  blob-map.json      original hosted asset id -> local file (screens already rewritten to local paths)

figures/           isometric drafting-wait figures (built with the anatomy kit)
  crane/             tower crane that stacks storeys as the doc drafts; build.mjs + layer SVGs
  plotter/           pen plotter that draws pages; build.mjs + layer SVGs

generators/        Python / Node scripts that drew the stickers, doodles, buildings and street
references/        sticker sheets and the GPT-made PNG stickers (cone, tape, crane, glove)
```

## Notes

- The `.dc.html` files use the Claude Design canvas format (`<x-dc>`, `{{holes}}`, `<sc-for>`, `<sc-if>`, a `DCLogic` class). They won't run as plain HTML; treat them as the spec for markup, styles and behaviour when porting.
- Figures are split into stacked SVG layers and animated with CSS transforms (hoist moves `translateY(-2.385 * n %)`, rope height `((136.42 - 12.401 * n) / 5.2)%`). Layer geometry lives in `crane.json` / `plotter.json`.
- Figure builds import the anatomy kit (`kit/iso-kit.mjs`, `kit/lathe.mjs`), which isn't vendored here. The built SVGs are checked in, so you only need the kit to rebuild.
- Fonts: Coming Soon for display and questions, Shantell Sans for handwriting, Instrument Sans for everything else (buttons at 600 / 15px).
