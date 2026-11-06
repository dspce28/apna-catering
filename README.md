# Apna Catering — website concept (React + three.js)

Vite + React 18, three.js via @react-three/fiber/drei, GSAP ScrollTrigger and Lenis smooth scroll.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Structure
- `src/components/Intro.jsx` — `GrowHero`: an ivory page with a photo window that grows to full screen as you scroll (plain scroll position + clip-path, so it works on touch and with or without smooth scroll); heritage section with scroll-filled text, odometer stats and pillars
- `src/three/HeroSlides.jsx` — WebGL slideshow inside the hero window: liquid noise-edged transitions between real photographs, subtle cursor lens; falls back to `<img>` crossfade without WebGL
- `src/three/Gallery3D.jsx` — drag-to-rotate curved image ring
- `src/components/Middle.jsx` — occasions grid, tradition tabs, pinned horizontal menus, gallery, menu builder, services list, featured event
- `src/components/Closing.jsx` — testimonials, process, four-step enquiry wizard (WhatsApp/email hand-off)
- `src/img.jsx` + `public/img/` — every photo at 960/1920 px (hero and full-bleed ones also at 3840 px) served via `srcset`
- `src/data.js` — copy, menus, occasions, contact details

## Before launch
- Photography in `public/img/` is Unsplash-licensed stock at up to 3840 px. Replace with the client's own event photography before launch.
- The enquiry form has no backend; connect a form service so leads are captured even if the visitor doesn't press send.
- Confirm all copy claims with the client.

## Tadka video (scroll-scrubbed)
The "Cooked fresh." section scrubs a video with scroll when `public/video/tadka.mp4` exists; otherwise it shows the photo slideshow.
Use 6–10 s of slow-motion footage (tadka hitting the pan, steam, sizzle). Encode with a keyframe on every frame so scrubbing is smooth:

```bash
ffmpeg -i tadka-source.mov -an -vf "scale=1920:-2" -c:v libx264 -preset slow -crf 22 -g 1 -pix_fmt yuv420p -movflags +faststart public/video/tadka.mp4
```
