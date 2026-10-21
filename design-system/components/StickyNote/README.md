# StickyNote

A pinned note for things the user wants to keep in mind while drafting, after the MyNote reference: a darker glue band on top, a black pushpin, light words mixed with bold ones, and a small bold line at the bottom.

**Consumer provides** the body (wrap quiet words in `<em>` and the important ones in `<strong>`, one to six words each), a footer line (`field-label` style), `data-color` (`yellow` default, `peach`, `green`) and a tilt via `--tilt` between -3deg and 3deg.

Wrap notes in `.db-sticky-stack` to show a pinned pile; only the top note is interactive. Notes are focusable when they can be edited or dragged.
