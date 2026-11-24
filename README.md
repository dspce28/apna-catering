# Apna Catering — website

Static site (HTML/CSS/vanilla JS). The approved design is **Version 2, "Candlelit Durbar"** (wine and gold).
Live preview: https://apna-catering-durbar.vercel.app (Vercel project `apna-catering-durbar`, root directory `durbar`).

## Build
`python3 build.py` regenerates every page into `durbar/` and copies in the code and only the images the pages use.
Edit `build.py` (content and page structure), `site.css` + `durbar.css` (styles) or the scripts, then rebuild and commit `durbar/`.

- `site.css`, `site.js` — base layout, nav, footer, shared behaviour
- `durbar.css`, `durbar.js` — the Version 2 look and its tools (planner, countdown, 3D menu book, scroll effects)
- `thali-new.css`, `thali-new.js` — "Prepare your thali": two brass thalis served step by step (`/thali-new`; `/thali` forwards there)
- `img/` — source images; `img/hd/` and `img/cut/` are the dish cut-outs used on the thali page

## Content rules from the client
- Established 1995 ("30 years").
- No prices anywhere on the site; menus and the thali page lead to a personal quote.
- Diet labels: Veg, Jain, Non-veg.

## Still needed from the client
Original logo file, real dish and event photos (several thali dishes use stand-in photos), and the domain/DNS for apnacatering.co.uk.

Version 1 ("Ivory Palace") was retired; it remains in git history.
AI image prompts: `docs/ai-image-prompts.md`.
