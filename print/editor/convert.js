// Turn print/brochure-invite-a6.html into an editable element list (print/editor/state.json).
// node print/editor/convert.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '..');
const pathmap = JSON.parse(fs.readFileSync(path.join(__dirname, 'pathmap.json'), 'utf8'));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(dir, 'brochure-invite-a6.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const out = await p.evaluate(() => {
    const MM = 96 / 25.4;
    const B = 3, PW = 105, FW = 102;
    const PANELS = {
      outside: [['p5', 'Page 5', 0, B + FW], ['p6', 'Page 6', B + FW, B + FW + PW], ['p1', 'Page 1 · Cover', B + FW + PW, 318]],
      inside: [['p2', 'Page 2', 0, B + PW], ['p34', 'Pages 3–4', B + PW, 318]],
    };
    const defs = [];
    const result = { sheets: [] };
    let uid = 0;
    for (const sid of ['outside', 'inside']) {
      const sheet = document.getElementById(sid);
      const ORD = new Map(); [...sheet.querySelectorAll('*')].forEach((n, i) => ORD.set(n, i));
      const so = sheet.getBoundingClientRect();
      const panels = PANELS[sid].map(([id, name, x0, x1]) => ({ id, name, x: x0, w: x1 - x0, els: [] }));
      const mm = (r) => ({ x: (r.left - so.left) / MM, y: (r.top - so.top) / MM, w: r.width / MM, h: r.height / MM });
      const place = (box, el, span) => {
        const cx = box.x + box.w / 2;
        const hits = span ? panels.filter((pn) => box.x < pn.x + pn.w && box.x + box.w > pn.x) : [panels.find((pn) => cx >= pn.x && cx < pn.x + pn.w) || panels[panels.length - 1]];
        for (const pn of hits) pn.els.push({ ...el, ord: ORD.get(el._node), id: 'e' + uid++, x: +(box.x - pn.x).toFixed(2), y: +box.y.toFixed(2), w: +box.w.toFixed(2), h: +box.h.toFixed(2) });
      };
      // collect svg art pieces
      const pieces = [];
      sheet.querySelectorAll('svg.art').forEach((svg) => {
        const walk = (node) => {
          [...node.children].forEach((c) => {
            const tag = c.tagName.toLowerCase();
            if (tag === 'defs' || tag === 'clippath' || tag === 'filter' || tag === 'lineargradient' || tag === 'radialgradient') { defs.push(c.outerHTML); return; }
            if (tag === 'g' && c.getAttribute('clip-path') && !c.getAttribute('transform')) { walk(c); return; }
            pieces.push(c);
          });
        };
        walk(svg);
      });
      for (const c of pieces) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        c.parentNode.insertBefore(g, c); g.appendChild(c);
        let bb; try { bb = g.getBBox(); } catch (e) { continue; }
        if (!bb.width || !bb.height) continue;
        const r = g.getBoundingClientRect();
        const im1 = c.tagName.toLowerCase() === 'image' ? c : c.querySelector('image');
        place(mm(r), { _node: c, kind: 'svg', vb: [bb.x, bb.y, bb.width, bb.height].map((v) => +v.toFixed(3)), svg: c.outerHTML, img: im1 ? im1.getAttribute('href') : null }, false);
      }
      // text blocks and html images
      sheet.querySelectorAll('.content > div, .content > img, .content > ul').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (el.tagName === 'IMG') { place(mm(r), { _node: el, kind: 'img', src: el.getAttribute('src') }, false); return; }
        const st = el.getAttribute('style') || '';
        const keep = st.split(';').map((s) => s.trim()).filter((s) => s && !/^(left|right|top|width)\s*:/.test(s)).join(';');
        place(mm(r), { _node: el, kind: 'text', tag: el.tagName.toLowerCase(), cls: el.className, style: keep, html: el.innerHTML.trim() }, false);
      });
      // sheet-level images (cover, mirror, fold bouquet, spread background)
      sheet.querySelectorAll(':scope > img.full, :scope > img.span, :scope > div:not(.content) > img').forEach((el) => {
        place(mm(el.getBoundingClientRect()), { _node: el, kind: 'img', src: el.getAttribute('src'), fit: el.classList.contains('full') ? 'cover' : null, pos: el.style.objectPosition || null }, el.classList.contains('span'));
      });
      panels.forEach((pn) => { pn.els.sort((a, b) => a.ord - b.ord); pn.els.forEach((e) => { delete e._node; delete e.ord; }); });
      result.sheets.push({ id: sid, name: sid === 'outside' ? 'Outside' : 'Inside', bg: sheet.querySelector('.bgimg').getAttribute('src'), panels });
    }
    result.defs = [...new Set(defs)].join('');
    result.globalDefs = document.querySelector('body > svg').innerHTML;
    return result;
  });
  let js = JSON.stringify(out);
  for (const [src, n] of Object.entries(pathmap)) js = js.split(src.replace('../', '../')).join(`a/${n}.webp`);
  fs.writeFileSync(path.join(__dirname, 'state.json'), js);
  const st = JSON.parse(js);
  for (const s of st.sheets) for (const pn of s.panels) console.log(s.id, pn.id, pn.els.length, 'elements', pn.els.map((e) => e.kind).join(','));
  console.log('unmapped:', [...new Set((js.match(/(assets|photos|\.\.\/img)\/[^"\\)]+/g) || []))]);
  await b.close();
})();
