# Marks

Inline marks for the canvas: what the user highlights and what the AI changes.

- `.db-hl`: highlighter stroke in `highlight`, slightly ragged at the ends. Used for the user's selection and for anything they mark with the highlighter tool. A highlighted span is what "ask AI about this" acts on.
- `.db-ins`: AI-inserted text, wavy `green` underline. Accept or reject from the margin.
- `.db-del`: AI-removed text, struck through in `red`, text drops to `ink-muted`.
- `.db-margin-note`: the AI's handwritten reason in `aside`, `blue`, beside the edit.

Pending AI edits always show both the deletion and the insertion so the user can see exactly what changed. The `redline` web asset animates these passes.
