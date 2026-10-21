# Button

A word with a pen line around it, after HeyTea's little "comeback" box, plus Woset's plain underlined links.

- `.db-btn--primary`: the one action that moves the flow forward (Draft my SR, Download). One per view, `safety` fill, `on-safety` text.
- `.db-btn`: secondary actions, white with an ink outline.
- `.db-btn--hand`: Coming Soon lettering in a thin box. Low-stakes moves only (back, start over, comeback).
- `.db-link`: underlined text for skip, cancel and navigation, Woset style.
- `.db-btn--tool`: 44px canvas toolbar button. `aria-pressed="true"` on the active tool fills it with `highlight`. Always give an `aria-label`.

**Consumer provides** the label (sentence case, verb first) and, for tools, a 24px inline SVG drawn with `stroke: currentColor`. Never two primary buttons side by side.
