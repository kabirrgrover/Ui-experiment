# Stamp

A rubber stamp for a document's status, inked onto the document page and its folder card.

Set `data-tone`: none (Draft, `ink-muted`), `review` (`safety`), `approved` (`green`), `hold` (`red`), `revised` (`blue`), `ifc` (`ink`). The word is always written out, so status never rests on colour. Add `<small>` for a second line.

Add `.is-landing` when the status changes so it slaps on with `ease-slap`. One stamp per document; a new status replaces the old one.

The SVG stamps in `assets/Stamps/` are the same stamps for exports.
