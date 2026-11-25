// Canva-import PDFs: one 2-page PDF (front, back) per card option at trim size, live text, no shadows.
// node canva_export.js -> ../out/canva/<option>.pdf
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'out', 'canva');
fs.mkdirSync(OUT, { recursive: true });
const SETS = {
  'variants.html': [['A-Classic', 85, 55], ['B-Portrait', 55, 85], ['C-Gold-Feather', 85, 55], ['D-Jharokha', 85, 55], ['E-Rose-Corners', 85, 55]],
  'templates.html': [['F-Split', 85, 55], ['G-Filigree-Corners', 85, 55], ['H-Gold-Band', 85, 55], ['I-Window', 85, 55], ['J-Feather-Edge', 85, 55], ['K-Cartouche', 85, 55]],
  'brand.html': [['1-The-Seal', 85, 55], ['2-The-Quill', 85, 55], ['3-The-Statement', 85, 55]],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [file, opts] of Object.entries(SETS)) {
    await p.goto('file://' + path.join(__dirname, file));
    await p.evaluate(() => document.fonts.ready);
    const rows = await p.$$eval(file === 'brand.html' ? 'section' : '.row', (rs) =>
      rs.map((r) => [...r.querySelectorAll('.cards svg')].map((s) => {
        const c = s.cloneNode(true);
        c.removeAttribute('style');
        c.querySelectorAll('rect[filter="url(#paper)"]').forEach((x) => x.setAttribute('display', 'none'));
        return c.outerHTML.replace(/url\(#(foil|gf|goldFoil)\)/g, '#B08D57');
      })));
    const head = await p.$eval('head', (h) => [...h.querySelectorAll('link')].map((l) => l.outerHTML).join(''));
    for (let i = 0; i < opts.length; i++) {
      const [name, w, h] = opts[i];
      const pages = rows[i].map((s) => `<div class="pg">${s.replace(/width="[\d.]+mm" height="[\d.]+mm"/, `width="${w}mm" height="${h}mm"`)}</div>`).join('');
      const html = `<!doctype html><html><head><meta charset="utf-8">${head}<style>*{margin:0;padding:0}@page{size:${w}mm ${h}mm;margin:0}
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{width:${w}mm;height:${h}mm;overflow:hidden;break-after:page}
        .pg:last-child{break-after:auto}svg{display:block}</style></head><body>${pages}</body></html>`;
      const f = path.join(__dirname, `_canva-${name}.html`);
      fs.writeFileSync(f, html);
      await p.goto('file://' + f);
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(500);
      await p.pdf({ path: path.join(OUT, `${name}.pdf`), preferCSSPageSize: true, printBackground: true });
      console.log(name);
    }
  }
  await b.close();
})();
