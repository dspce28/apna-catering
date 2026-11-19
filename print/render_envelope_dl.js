// node print/render_envelope_dl.js -> print/out/envelope-DL-*.pdf / .png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 2 });
  const load = async () => {
    await p.goto('file://' + path.join(__dirname, 'envelope-dl.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
  };
  const only = (id) => p.evaluate((id) => document.querySelectorAll('section').forEach((s) => (s.style.display = s.id === id ? '' : 'none')), id);

  await load();
  await (await p.$('#preview')).screenshot({ path: path.join(out, 'envelope-DL-preview.png') });
  await p.evaluate(() => (document.querySelector('.guides').style.display = ''));
  await (await p.$('#net')).screenshot({ path: path.join(out, 'envelope-DL-net-proof.png') });
  await p.evaluate(() => (document.querySelector('.guides').style.display = 'none'));
  await only('net');
  await p.pdf({ path: path.join(out, 'envelope-DL-print-net-bleed.pdf'), preferCSSPageSize: true, printBackground: true });

  await load();
  await p.evaluate(() => document.body.classList.add('foil'));
  await only('net');
  await p.pdf({ path: path.join(out, 'envelope-DL-foil-mask.pdf'), preferCSSPageSize: true, printBackground: true });
  await (await p.$('#net')).screenshot({ path: path.join(out, 'envelope-DL-foil-mask-proof.png') });
  await b.close();
  console.log('done');
})();
