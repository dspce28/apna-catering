# Guest brochure + envelope (print)

    python3 print/build.py && node print/render.js

Outputs in `print/out/`:
- `brochure-print-318x154mm-bleed.pdf` — page 1 outside (p5 | p6 | p1), page 2 inside (p2 | p3 | p4). Trim 312 × 148 mm, 3 mm bleed. Roll fold, folded size A6 (105 × 148). Tuck-in panel 102 mm.
- `envelope-C6-print-net-bleed.pdf` — die-cut net for a C6 wallet envelope (162 × 114 mm), flap art printed upside down so it reads upright once folded.
- `*-proof.png` / `envelope-net-proof.png` — pink = trim/cut, blue dashed = folds. Not for print.

Peacock feather: `print/feather.py` builds it barb by barb (eye rings come from the barbs themselves, plus vane splits, barbules and gold glitter); `render.js` rasterises it to `assets/feather.png` at ~760 dpi before rendering.

Swap in the real photos: save them as `print/photos/photo-1.jpg` (waiter, tall), `photo-2.jpg` (chef garnishing), `photo-3.jpg` (tandoor, tall), `photo-4.jpg` (handover at the pass), then rebuild. Until then, stock placeholders show with a pink REPLACE tag.

Before print: hotel logos (p6) are placeholders; logo is 256 px (needs vector/≥1500 px); PDFs are RGB — have the printer convert to CMYK, and mark gold areas if foiling.
