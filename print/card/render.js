// node print/card/render.js -> print/out/card-cloche-*.pdf / .png
const { chromium } = require('playwright');
const path = require('path');
const dir = __dirname, out = path.join(dir, '..', 'out');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 3 });
  const go = async (f) => { await p.goto('file://' + path.join(dir, f)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500); };
  await go('print.html'); await p.pdf({ path: path.join(out, 'card-cloche-print-bleed.pdf'), preferCSSPageSize: true, printBackground: true });
  await go('foil.html'); await p.pdf({ path: path.join(out, 'card-cloche-foil-mask.pdf'), preferCSSPageSize: true, printBackground: true });
  await go('proof.html'); const ps = await p.$$('.p');
  await ps[0].screenshot({ path: path.join(out, 'card-cloche-proof-outside.png') });
  await ps[1].screenshot({ path: path.join(out, 'card-cloche-proof-inside.png') });
  await go('mockup.html'); await p.screenshot({ path: path.join(out, 'card-cloche-mockup.png'), fullPage: true });
  await b.close(); console.log('done');
})();
