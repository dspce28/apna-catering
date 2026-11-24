// Export each card face (no shadow, no paper overlay) as a high-res PNG into card/faces/.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('faces', { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 8 });
  const names = { 'variants.html': ['A', 'B', 'C', 'D', 'E'], 'brand.html': ['Seal', 'Quill', 'Statement'] };
  for (const [f, ids] of Object.entries(names)) {
    await p.goto('file://' + process.cwd() + '/' + f);
    await p.evaluate(() => {
      document.querySelectorAll('svg').forEach((s) => (s.style.filter = 'none'));
      document.querySelectorAll('svg rect[filter="url(#paper)"]').forEach((r) => r.setAttribute('display', 'none'));
    });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(800);
    const rows = await p.$$(f === 'brand.html' ? 'section' : '.row');
    for (let i = 0; i < ids.length; i++) {
      const svgs = await rows[i].$$('.cards svg');
      await svgs[0].screenshot({ path: `faces/${ids[i]}-front.png`, omitBackground: true });
      await svgs[1].screenshot({ path: `faces/${ids[i]}-back.png`, omitBackground: true });
    }
  }
  await b.close();
  console.log('ok');
})();
