# Apna Catering — website concept (React + three.js)

Vite + React 18, three.js via @react-three/fiber/drei, GSAP ScrollTrigger and Lenis smooth scroll.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Structure
- `src/three/HeroScene.jsx` — WebGL hero: lathe-turned brass handi, instanced orbiting spices, rising gold embers, mouse parallax, scroll-driven tilt/scatter
- `src/three/Gallery3D.jsx` — drag-to-rotate curved image ring with a custom shader (warm desaturate → full colour on hover, scroll-velocity bend)
- `src/components/Intro.jsx` — hero, "step inside" pinned jharokha-arch zoom, heritage with scroll-filled text and odometer counters
- `src/components/Middle.jsx` — tradition tabs, pinned horizontal signature menus, 3D gallery, menu builder, experiences with cursor-following image
- `src/components/Closing.jsx` — testimonials, process, four-step enquiry wizard (hands off to WhatsApp/email)
- `src/components/Chrome.jsx` — preloader, custom cursor, magnetic buttons, nav/drawer, mobile action bar, footer
- `src/data.js` — all copy, menus, contact details

## Before launch
- Photography in `public/img/` is placeholder (Unsplash licence + images from the current site). Replace with a commissioned shoot.
- The enquiry form has no backend; connect a form service so leads are captured even if the visitor doesn't press send.
- Confirm all copy claims with the client.
