# Guest brochure + envelope (print)

    python3 print/build.py && node print/render.js

Outputs in `print/out/`:
- `brochure-print-318x154mm-bleed.pdf` — page 1 outside (p5 | p6 | p1), page 2 inside (p2 | p3 | p4). Trim 312 × 148 mm, 3 mm bleed. Roll fold, folded size A6 (105 × 148). Tuck-in panel 102 mm.
- `envelope-C6-print-net-bleed.pdf` — die-cut net for a C6 wallet envelope (162 × 114 mm), flap art printed upside down so it reads upright once folded.
- `*-proof.png` / `envelope-net-proof.png` — pink = trim/cut, blue dashed = folds. Not for print.

Peacock feather: `print/feather.py` builds it barb by barb (eye rings come from the barbs themselves, plus vane splits, barbules and gold glitter); `render.js` rasterises it to `assets/feather.png` at ~760 dpi before rendering.

Swap in the real photos: save them as `print/photos/photo-1.jpg` (waiter, tall), `photo-2.jpg` (chef garnishing), `photo-3.jpg` (tandoor, tall), `photo-4.jpg` (handover at the pass), then rebuild. Until then, stock placeholders show with a pink REPLACE tag.

Before print: hotel logos (p6) are placeholders; logo is 256 px (needs vector/≥1500 px); PDFs are RGB — have the printer convert to CMYK, and mark gold areas if foiling.

## DL envelope (client mockup, maroon + gold peacock)

    python3 print/envelope_dl.py && node print/render_envelope_dl.js

- `out/envelope-DL-print-net-bleed.pdf` — full-colour die-cut net, 256 × 285 mm (fits SRA3), finished 220 × 110 mm, 3 mm bleed. All vector.
- `out/envelope-DL-foil-mask.pdf` — same net, gold areas in 100% black only: hand to the printer for gold foil blocking.
- `envelope-dl-cutter.svg` — cut line (magenta) + creases (cyan) for the die/plotter.
- `out/envelope-DL-preview.png` — finished back and front.
Assembly: fold side flaps in, fold the back panel up and glue it to the side flaps, then the V flap closes over it.
The A6 brochure goes in landscape (148 × 105) with 5 mm height clearance: make a physical dummy before the run.

## A6 brochure matched to the final envelope (Envelope_design.pdf)

    python3 print/brochure_a6.py && node print/render_a6.js

One design, two sizes:
- `out/brochure-A6-print-bleed.pdf` — folded 105 × 148 (flat 312 × 148 + 3 mm bleed). Needs a C6 (162 × 114) envelope.
- `out/brochure-FIT-print-bleed.pdf` — folded 98 × 140 (flat 291 × 140 + 3 mm bleed). Fits the client's Canva envelope (≈147.6 × 104 mm inside, measured from the PDF).
Page 1 outside (p5 tuck-in | p6 back | p1 cover), page 2 inside (p2 story | p3 + p4 photo spread).
Style: #6C000C damask (mirrored tile, rasterised 400 dpi), Luxurious Script / Cinzel Decorative / Cormorant Garamond, glossy gold peacock feather with almond eye.

## "Jharokha" brochure (unique design, uses the client's envelope assets)

    python3 print/brochure_unique.py && node print/render_a6.js unique

Ivory silk outside (contrasts with the red envelope), red tapestry reveal inside, Mughal-arch windows for the
cover, story card and photos. Outputs `out/brochure-UNIQUE-A6-print-bleed.pdf` and `out/brochure-UNIQUE-FIT-print-bleed.pdf`.
Assets: `assets/tapestry-tile.jpg` / `tapestry-bg.jpg` (from the client's tapestry; right half rebuilt from the mirrored
left half, removing the corner mark; ~217 dpi effective), `assets/feather-gold.png` (client feather, keep ≤ 45 mm wide).

## Brochure Studio (browser editor)

`print/editor/` turns the invitation-theme brochure into an editable page (published as a claude.ai artifact).
- `node print/editor/convert.js` → `state.json` (every rose, frame, photo, divider and text block as its own element, in mm)
- `python3 print/editor/build.py` → `index.html` (template + state)
- Saved edits republish the page with the state embedded. To print: save the published page next to `a/` and run
  `node print/editor/print_saved.js <saved.html>` → `out/brochure-EDITED-A6-print-bleed.pdf`.
