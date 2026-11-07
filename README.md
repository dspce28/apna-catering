# Apna Catering — website concept

Static site (HTML/CSS/vanilla JS, no build step). Open `index.html` or deploy the folder to Vercel as-is.

- `index.html` — page structure and copy
- `styles.css` — design tokens (ink / ivory / gold), layout, animations
- `main.js` — scroll reveals, parallax, tradition tabs, menu builder, testimonials, lightbox, enquiry wizard
- `img/` — placeholder photography from Unsplash (Unsplash License). Replace with a commissioned shoot before launch.

The enquiry form sends via WhatsApp or email (no backend). Connect a form service before launch to capture leads reliably.

Images are served at 1200 px with 2400 px versions via `srcset` for high-density screens.
The React/three.js iterations remain in git history (commits 24f37a3 to 2a681df) if any part is wanted later.

## Brand
- Palette: Royal Aubergine & Gold — aubergine `#2A0F2E`, plum `#3B1840`, antique gold `#D6B06A`, champagne `#F1DFBA`, ivory `#F8F1E8`, mauve `#BFA6C2`; light-section accent plum `#5A2160`. All text colours pass WCAG AA.
- Logo: `img/logo-256.png`, cut from the client's flyer. The flyer only contains a 153 px version, so it is used small (nav 56 px, footer 112 px). Replace with the original logo file (SVG/AI/EPS or PNG ≥ 1000 px) when available.
- Photos: every image is served at 1200 / 2400 / 3840 px via `srcset`; the gallery lightbox opens the 3840 px version.
