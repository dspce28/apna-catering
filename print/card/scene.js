// Photoreal-style mockups: each option's front + back on a dark stone surface, in perspective,
// with card thickness, gilded edge, contact shadows, paper grain and directional light.
// node scene.js  -> ../out/mockup-<ID>.png and ../out/mockups-all.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OPTIONS = [
  ['A', 'A · Classic'], ['B', 'B · Portrait'], ['C', 'C · The gold feather'], ['D', 'D · The jharokha'],
  ['E', 'E · Rose corners'], ['F', 'F · The Split'], ['G', 'G · Filigree Corners'], ['H', 'H · The Gold Band'],
  ['I', 'I · The Window'], ['J', 'J · The Feather Edge'], ['K', 'K · The Cartouche'], ['Seal', '1 · The Seal'], ['Quill', '2 · The Quill'], ['Statement', '3 · The Statement'],
];
const EDGE = { A: 'gold', B: 'gold', C: 'burg', D: 'gold', E: 'gold', Seal: 'gold', Quill: 'burg', Statement: 'gold', F: 'gold', G: 'gold', H: 'gold', I: 'gold', J: 'gold', K: 'gold' };

const noise = (freq, alpha, seed) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/>` +
  `<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${alpha} 0"/></filter><rect width="600" height="600" filter="url(#n)"/></svg>`);
const vein = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><filter id="v"><feTurbulence type="turbulence" baseFrequency="0.0035 0.012" numOctaves="4" seed="7"/>` +
  `<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.1"/></filter><rect width="1600" height="1000" filter="url(#v)"/></svg>`);

function page(id) {
  const portrait = id === 'B';
  const W = portrait ? 372 : 590, H = portrait ? 575 : 382;
  const edge = EDGE[id] === 'gold'
    ? 'linear-gradient(90deg,#8d6a35,#e6cc92 30%,#a8814a 55%,#f0dba6 75%,#8d6a35)'
    : 'linear-gradient(90deg,#3a0711,#6b1426 40%,#47091a)';
  const card = (face, x, y, rz, z, lift) => `
    <div class="card" style="width:${W}px;height:${H}px;left:${x}px;top:${y}px;transform:translateZ(${z}px) rotateZ(${rz}deg)">
      <div class="shadow" style="transform:translate(${10 + lift}px,${18 + lift}px)"></div>
      ${[...Array(7)].map((_, i) => `<div class="edge" style="background:${edge};transform:translateZ(${i * 0.7}px)"></div>`).join('')}
      <div class="face" style="transform:translateZ(5px);background-image:url(faces/${face})">
        <div class="grain"></div><div class="light"></div></div>
    </div>`;
  const frontX = portrait ? 870 : 820, backX = portrait ? 380 : 170;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1600px;height:1000px;overflow:hidden;background:#1d1918}
  .bg{position:absolute;inset:0;background:
     radial-gradient(ellipse 70% 60% at 32% 28%,rgba(255,236,210,.20),transparent 70%),
     radial-gradient(ellipse at 50% 50%,transparent 45%,rgba(0,0,0,.55)),
     url("${noise(0.9, 0.10, 3)}"),#262120;background-blend-mode:normal,normal,overlay,normal}
  .veins{position:absolute;inset:0;background:url("${vein}");opacity:.07;mix-blend-mode:screen}
  .stage{position:absolute;inset:0;perspective:2300px;perspective-origin:50% 20%}
  .plane{position:absolute;left:0;top:60px;width:1600px;height:900px;transform-style:preserve-3d;transform:rotateX(46deg) translateY(170px)}
  .card{position:absolute;transform-style:preserve-3d}
  .shadow{position:absolute;inset:-2px;border-radius:4px;background:rgba(0,0,0,.7);filter:blur(14px)}
  .edge{position:absolute;inset:0;border-radius:2px}
  .face{position:absolute;inset:0;border-radius:2px;background-size:100% 100%;overflow:hidden;box-shadow:0 0 0 .6px rgba(0,0,0,.25)}
  .grain{position:absolute;inset:0;background:url("${noise(1.6, 0.16, 11)}");mix-blend-mode:overlay;opacity:.55}
  .light{position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,244,225,.30) 0%,rgba(255,244,225,.08) 35%,rgba(0,0,0,0) 55%,rgba(0,0,0,.22) 100%);mix-blend-mode:soft-light}
  .lab{position:absolute;left:56px;bottom:44px;font:500 22px 'Cormorant Garamond',Georgia,serif;letter-spacing:.14em;color:rgba(240,225,200,.82);text-transform:uppercase}
  </style><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=block" rel="stylesheet"></head>
  <body><div class="bg"></div><div class="veins"></div><div class="stage"><div class="plane">
    ${card(id + '-back.png', backX, portrait ? 130 : 230, portrait ? -10 : -9, 0, 0)}
    ${card(id + '-front.png', frontX, portrait ? 170 : 290, portrait ? 8 : 6, 0, 0)}
  </div></div><div class="lab">${OPTIONS.find((o) => o[0] === id)[1]}</div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
  for (const [id] of OPTIONS) {
    const f = path.join(__dirname, `_scene-${id}.html`);
    fs.writeFileSync(f, page(id));
    await p.goto('file://' + f);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(__dirname, '..', 'out', `mockup-${id}.png`) });
    console.log('mockup', id);
  }
  await b.close();
})();
