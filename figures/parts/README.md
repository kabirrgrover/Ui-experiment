# Fig 3 · Anatomy of AI DocBuilder

One drafting workbench whose modules are the product's parts. Built with the vendored anatomy kit (`../../anatomy/kit`), same camera (azimuth 38°) and stroke weights as `crane/` and `plotter/`.

| id | Part on the bench | Product part |
|---|---|---|
| `questions` | Card feeder with a stacked hopper and feed roller | Guided questions: each answer card feeds the job |
| `sources` | Six-drawer cabinet, one drawer pulled with cards in it | Sources: standards, past SRs, drawings, vendor docs, procedures, templates |
| `drafting` | Flatbed gantry plotter, the lit pen | Drafting engine: writes the doc section by section |
| `checks` | Dial gauge on a column | Checks & reasoning: needle reads how sure the draft is |
| `review` | Stamp arm over a page on a stamping plate | Review stamp: for review, approved, on hold |
| `folders` | Out-tray of finished pages + a flat folder with pages filed in it | Folders |
| `canvas` | Markup table: page with highlight and circle, sticky notes, pen, highlighter | Canvas |

Cables run from the feeder and the cabinet into the plotter, and from the plotter to the gauge.

## Files

- `parts.svg` / `parts-dark.svg`: the whole figure, standalone (styles embedded).
- `parts-base(-dark).svg`: base plate and cables.
- `parts-<id>(-dark).svg`: one layer per module. Same viewBox (640 × 420) as the composed figure, so they stack exactly.
- `parts.json`: per module `id`, `label`, `description`, `bbox` (viewBox units) and layer file names, plus the back-to-front `order`.
- `parts-light.html` / `parts-dark.html`: preview plates with hover highlight. `?m=<id>` pins one module.
- `preview-light.png` / `preview-dark.png`: screenshots.

## Use in the front end

Inline `parts.svg` (or stack `parts-base.svg` then the module layers in `order`). Every module is a `<g data-module="<id>">`. To highlight on hover, drop the other groups to ~0.28 opacity and show the label and description from `parts.json`. With stacked `<img>` layers, use each module's `bbox` as the hit area.

## Rebuild

```
node build.mjs     # writes light and dark outputs
```

Line-end check (0 floating ends in both themes):

```
CHROME_PATH=/path/to/chrome node ../../anatomy/scripts/lines.mjs parts-light.html
```
