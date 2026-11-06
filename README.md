# Apna Catering — website concept (React + three.js)

Vite + React 18, three.js via @react-three/fiber/drei, GSAP ScrollTrigger and Lenis smooth scroll.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Structure
- `src/components/Intro.jsx` — `TrailHero` (cursor/finger leaves a trail of 4K photos around the headline, never over it; autoplays on load), `ZoomCollage` (seven photos zoom at different rates until the centre fills the screen, text arrives on a solid card), heritage section
- `src/three/Gallery3D.jsx` — drag-to-rotate curved image ring (three.js)
- `src/components/Middle.jsx` — occasions grid, tradition tabs, pinned horizontal menus, gallery, menu builder, services list, featured event
- `src/components/Closing.jsx` — testimonials, process, four-step enquiry wizard (WhatsApp/email hand-off)
- `src/img.jsx` + `public/img/` — every photo at 960/1920 px (full-bleed ones also 3840 px) served via `srcset`
- `src/data.js` — copy, menus, occasions, contact details

## Before launch
- Photography in `public/img/` is Unsplash-licensed stock at up to 3840 px. Replace with the client's own event photography before launch.
- The enquiry form has no backend; connect a form service so leads are captured even if the visitor doesn't press send.
- Confirm all copy claims with the client.
