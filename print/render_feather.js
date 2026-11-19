// Rasterise print/assets/feather.svg -> feather.png (transparent, 900 x 3000 px)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 2000 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'assets', 'feather.svg'));
  await p.screenshot({ path: path.join(__dirname, 'assets', 'feather.png'), omitBackground: true });
  await b.close();
})();
