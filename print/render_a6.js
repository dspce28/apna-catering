// node print/render_a6.js  -> print/out/brochure-A6-* and brochure-FIT-* (PDF with 3 mm bleed + proof PNGs)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const dir = __dirname;
const out = path.join(dir, 'out');
fs.mkdirSync(out, { recursive: true });

const VERS = { a6: { PW: 105, PH: 148 }, fit: { PW: 98, PH: 140 } };
const B = 3;

(async () => {
  const b = await chromium.launch();
  for (const f of fs.readdirSync(path.join(dir, 'assets')).filter((n) => /^bfloral-\w+\.svg$/.test(n))) {
    const svg = fs.readFileSync(path.join(dir, 'assets', f), 'utf8');
    const [wmm, hmm] = [...svg.matchAll(/(width|height)="([\d.]+)mm"/g)].slice(0, 2).map((m) => +m[2]);
    const dpi = +svg.match(/data-dpi="(\d+)"/)[1];
    const fp = await b.newPage({ viewport: { width: Math.ceil((wmm * 96) / 25.4), height: Math.ceil((hmm * 96) / 25.4) }, deviceScaleFactor: dpi / 96 });
    await fp.goto('file://' + path.join(dir, 'assets', f));
    await fp.screenshot({ path: path.join(dir, 'assets', f.replace('.svg', '.jpg')), type: 'jpeg', quality: 92 });
    await fp.close();
    console.log('rasterised', f);
  }
  const p = await b.newPage({ deviceScaleFactor: 2 });
  for (const [v, { PW, PH }] of Object.entries(VERS)) {
    const FW = PW - 3;
    await p.goto('file://' + path.join(dir, `brochure-${v}.html`));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(600);
    const tag = v.toUpperCase();
    await p.pdf({ path: path.join(out, `brochure-${tag}-print-bleed.pdf`), preferCSSPageSize: true, printBackground: true });
    const guides = { outside: [B + FW, B + FW + PW], inside: [B + PW, B + 2 * PW] };
    for (const [id, folds] of Object.entries(guides)) {
      await p.evaluate(({ id, folds, B, W, H }) => {
        const s = document.getElementById(id);
        const g = document.createElement('div');
        g.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:99';
        g.innerHTML = `<div style="position:absolute;left:${B}mm;top:${B}mm;width:${W}mm;height:${H}mm;outline:1px solid #00FF66"></div>` +
          folds.map((x) => `<div style="position:absolute;left:${x}mm;top:0;height:100%;border-left:1px dashed #00E5FF"></div>`).join('');
        s.appendChild(g);
      }, { id, folds, B, W: 2 * PW + FW, H: PH });
      await (await p.$('#' + id)).screenshot({ path: path.join(out, `brochure-${tag}-${id}-proof.png`) });
    }
  }
  await b.close();
  console.log('done');
})();
