// Renders print PDFs (with 3 mm bleed, no marks) and proof PNGs (with trim/fold guides).
// node print/render.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const here = __dirname;
const out = path.join(here, 'out');
fs.mkdirSync(out, { recursive: true });

const MM = 96 / 25.4; // css px per mm

async function only(page, id) {
  await page.evaluate((id) => {
    document.querySelectorAll('section.sheet').forEach((s) => (s.style.display = s.id === id ? '' : 'none'));
  }, id);
}

async function guides(page, id, folds, trim) {
  await page.evaluate(({ id, folds, trim, MM }) => {
    const s = document.getElementById(id);
    const g = document.createElement('div');
    g.className = 'guides';
    g.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:99';
    const box = (l, t, w, h, css) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:${l}mm;top:${t}mm;width:${w}mm;height:${h}mm;${css}`;
      g.appendChild(d);
    };
    box(trim.x, trim.y, trim.w, trim.h, 'outline:1px solid #E0245E');
    folds.forEach((x) => box(x, 0, 0, 999, 'border-left:1px dashed #00A3C4'));
    s.appendChild(g);
  }, { id, folds, trim, MM });
}

const { execSync } = require('child_process');
execSync('python3 ' + path.join(__dirname, 'feather.py') + ' && node ' + path.join(__dirname, 'render_feather.js'), { stdio: 'inherit' });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  // ---------------- brochure
  await page.goto('file://' + path.join(here, 'brochure.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.pdf({ path: path.join(out, 'brochure-print-318x154mm-bleed.pdf'), preferCSSPageSize: true, printBackground: true });

  const trim = { x: 3, y: 3, w: 312, h: 148 };
  await guides(page, 'outside', [3 + 102, 3 + 102 + 105], trim);
  await guides(page, 'inside', [3 + 105, 3 + 105 + 105], trim);
  for (const id of ['outside', 'inside']) {
    await (await page.$('#' + id)).screenshot({ path: path.join(out, `brochure-${id}-proof.png`) });
  }

  // ---------------- envelope
  await page.goto('file://' + path.join(here, 'envelope.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  for (const id of ['net-proof', 'preview']) {
    await (await page.$('#' + id)).screenshot({ path: path.join(out, `envelope-${id}.png`) });
  }
  await only(page, 'net');
  await page.pdf({ path: path.join(out, 'envelope-C6-print-net-bleed.pdf'), preferCSSPageSize: true, printBackground: true });

  await browser.close();
  console.log('rendered to', out);
})();
