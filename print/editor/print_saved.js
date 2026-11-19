// Render a saved editor page to the print PDF (3 mm bleed, 318 x 154 mm sheets).
// node print/editor/print_saved.js <saved.html> [out.pdf]
// The saved file must sit in print/editor/ (or have a/ beside it) so its a/*.webp images resolve.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const src = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
  const out = path.resolve(process.argv[3] || path.join(__dirname, '..', 'out', 'brochure-EDITED-A6-print-bleed.pdf'));
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + src + '#print');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await b.close();
  console.log('wrote', out);
})();
