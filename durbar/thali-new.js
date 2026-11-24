/* Prepare-your-thali page: two thalis served step by step; any number of dishes; they rearrange as you add. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sec = $('.tn'); if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = JSON.parse(sessionStorage.getItem('apna-' + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem('apna-' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const STEPS = [
    { key: 'starters', title: 'Live counters & starters', plate: 'a', next: 'Next: main course' },
    { key: 'main', title: 'Main course', plate: 'b', next: 'Next: desserts & sweets' },
    { key: 'sweets', title: 'Desserts & sweets', plate: 'a', next: 'See your feast' },
    { key: 'feast', title: 'Your feast', plate: 'both' },
  ];
  const stage = $('.tn-stage'), cards = $$('.tn-card'), msg = $('.tn-msg');
  const byId = Object.fromEntries(cards.map((c) => [c.dataset.id, c]));
  const plates = { a: $('[data-plate=a] .tn-food'), b: $('[data-plate=b] .tn-food') };
  const served = { a: [], b: [] };               // dishes in the order they were served
  const els = new Map();                         // id -> element on the thali (dishes, empty slots, the chutney)
  const dish = (id) => { const c = byId[id]; return c && { id, name: c.dataset.name, step: c.dataset.step, as: c.dataset.as, kind: c.dataset.kind, img: c.dataset.img }; };
  const plateOf = (d) => (d.step === 'main' ? 'b' : 'a');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const KY = 1544 / 1408;                        // the thali picture is wider than tall
  // empty, labelled places laid out for each step, like a thali set before the food comes
  const SLOTS = {
    a: { starters: [['chaat', 'Chaat', 'bowl'], ['tandoor', 'Tandoor', 'dish'], ['snack', 'Snack', 'plated']], sweets: [['halwa', 'Halwa', 'bowl'], ['mithai', 'Mithai', 'plated']] },
    b: { main: [['dal', 'Dal', 'bowl'], ['sabzi', 'Sabzi', 'bowl'], ['curry', 'Curry', 'bowl'], ['raita', 'Raita', 'bowl'], ['rice', 'Rice', 'plated'], ['bread', 'Roti', 'plated']] },
  };
  const ORDER = ['chutney', 'chaat', 'tandoor', 'halwa', 'dal', 'sabzi', 'curry', 'raita', 'snack', 'mithai', 'rice', 'bread'];
  const CHUTNEY = { id: '_chutney', name: 'Green chutney', as: 'bowl', kind: 'chutney', img: 'img/hd/green-chutney.webp', gift: true };
  let cur = 0;

  /* ---------- places on the thali: equal round places that never overlap, katoris first along the top ---------- */
  const pack = (n) => {
    const Rp = .4;
    if (n <= 1) return [{ x: 0, y: 0, s: .3 }];
    for (let s = .27; s > .05; s -= .003) {
      const rings = []; let r = Rp - s / 2;
      while (r >= s * .5) { const c = Math.floor(2 * Math.PI * r / (s * 1.07)); if (c < 1) break; rings.push({ r, c }); r -= s * 1.05; }
      const centre = rings.length && rings[rings.length - 1].r >= s * 1.05 ? 1 : 0;
      if (rings.reduce((t, x) => t + x.c, 0) + centre < n) continue;
      const out = []; let left = n;
      for (const g of rings) {
        const take = Math.min(g.c, left); if (take <= 0) break;
        for (let i = 0; i < take; i++) { const t = Math.PI * .86 + i * 2 * Math.PI / take; out.push({ x: g.r * Math.cos(t), y: g.r * Math.sin(t), s }); }
        left -= take;
      }
      if (left > 0) out.push({ x: 0, y: 0, s });
      return out;
    }
    return [];
  };
  const entries = (key) => {
    const step = STEPS[cur].key, list = served[key].map((d, i) => ({ ...d, i }));
    if (key === 'a') list.push({ ...CHUTNEY, i: -1 });
    ((SLOTS[key] || {})[step] || []).forEach(([kind, label, as]) => { if (!served[key].some((d) => d.kind === kind)) list.push({ id: `_${key}-${kind}`, kind, label, as, empty: true, i: 999 }); });
    const rank = (e) => (e.as === 'plated' ? 1 : 0) * 1000 + ORDER.indexOf(e.kind) * 10;
    return list.sort((p, q) => rank(p) - rank(q) || p.i - q.i);
  };
  const layout = (key) => {
    const list = entries(key), spots = pack(list.length), pos = {};
    list.forEach((e, i) => { const p = spots[i]; pos[e.id] = { e, x: .5 + p.x, y: .5 + p.y * KY, s: p.s }; });
    return pos;
  };
  const makeEl = (e) => {
    const el = document.createElement(e.empty ? 'span' : 'button');
    el.className = `tn-item ${e.as}${e.empty ? ' empty' : ''}${e.gift ? ' gift' : ''}`;
    if (e.empty) el.innerHTML = `<b>${e.label}</b>`;
    else {
      el.innerHTML = `<img src="${e.img}" alt="">` + (e.gift ? '<em class="tn-tag">on the house!</em>' : '');
      if (e.gift) { el.type = 'button'; el.title = 'Green chutney, on the house'; el.setAttribute('aria-label', 'Green chutney, served with every thali'); }
      else { el.type = 'button'; el.title = e.name; el.setAttribute('aria-label', `${e.name}. Tap to take it off.`); el.addEventListener('click', () => take(e.id)); }
    }
    return el;
  };
  const apply = (key) => {
    const pos = layout(key), keep = new Set(Object.keys(pos));
    // empty places that are no longer needed fade away
    [...els.entries()].forEach(([id, el]) => { if (el.dataset.plate === key && !keep.has(id) && id.startsWith('_')) { el.classList.add('leave'); setTimeout(() => el.remove(), 420); els.delete(id); } });
    Object.values(pos).forEach(({ e, x, y, s }) => {
      let el = els.get(e.id);
      if (!el && e.id.startsWith('_')) { el = makeEl(e); el.dataset.plate = key; els.set(e.id, el); plates[key].appendChild(el); el.classList.add('appear'); setTimeout(() => el.classList.remove('appear'), 700); }
      if (!el) return;
      el.style.left = x * 100 + '%'; el.style.top = y * 100 + '%'; el.style.width = s * 100 + '%';
    });
    return pos;
  };

  /* ---------- serving with the ladle ---------- */
  const LADLE = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="tnlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c8"/><stop offset=".45" stop-color="#d9ac5c"/><stop offset="1" stop-color="#7a5420"/></linearGradient></defs>'
    + '<path d="M30 70 L94 6" stroke="url(#tnlg)" stroke-width="5" stroke-linecap="round"/><circle cx="94" cy="6" r="3.6" fill="#e9c77d"/>'
    + '<ellipse cx="22" cy="78" rx="17" ry="15" fill="url(#tnlg)"/><ellipse cx="22" cy="76" rx="12.5" ry="10" fill="#6d4a1a" opacity=".55"/></svg>';
  const ladle = (key, x, y, s) => new Promise((done) => {
    if (reduce) { done(); return; }
    const l = document.createElement('i'); l.className = 'tn-ladle'; l.innerHTML = LADLE; plates[key].appendChild(l);
    const tx = (x + s * .12) * 100, ty = (y - s * .18 * KY) * 100;
    const a = l.animate([
      { left: '112%', top: '-14%', transform: 'translate(-22%,-78%) rotate(14deg)', opacity: 0 },
      { left: tx + '%', top: ty + '%', transform: 'translate(-22%,-78%) rotate(8deg)', opacity: 1, offset: .42 },
      { left: tx + '%', top: ty + '%', transform: 'translate(-22%,-78%) rotate(-34deg)', opacity: 1, offset: .62 },
      { left: tx + '%', top: ty + '%', transform: 'translate(-22%,-78%) rotate(-34deg)', opacity: 1, offset: .7 },
      { left: '112%', top: '-14%', transform: 'translate(-22%,-78%) rotate(10deg)', opacity: 0 },
    ], { duration: 1500, easing: 'cubic-bezier(.45,.05,.3,1)' });
    setTimeout(done, 1500 * .6); a.onfinish = () => l.remove();
  });
  const flourish = (el, d) => {
    if (reduce) return;
    if (d.as !== 'plated') {
      el.classList.add('drop'); const st = document.createElement('span'); st.className = 'tn-steam'; st.innerHTML = '<i></i><i></i><i></i>'; el.appendChild(st);
      setTimeout(() => st.remove(), 5200);
    } else {
      el.classList.add('land');
      for (let k = 0; k < 12; k++) { const s = document.createElement('span'); s.className = 'tn-sp'; s.style.setProperty('--a', (k * 30 + Math.random() * 20) + 'deg'); s.style.setProperty('--d', (40 + Math.random() * 50) + '%'); el.appendChild(s); setTimeout(() => s.remove(), 850); }
    }
    setTimeout(() => el.classList.remove('drop', 'land'), 1400);
  };
  const sync = () => {
    const on = new Set([...served.a, ...served.b].map((d) => d.id));
    cards.forEach((c) => c.classList.toggle('on', on.has(c.dataset.id)));
    store.set('thali-new', { a: served.a.map((d) => d.id), b: served.b.map((d) => d.id) });
  };
  const serve = (id, animate, quiet) => {
    const d = dish(id); if (!d || els.has(id)) return;
    const key = plateOf(d); served[key].push(d);
    const el = makeEl(d); el.dataset.plate = key; els.set(id, el);
    const pos = layout(key)[id];
    // it takes the place of its labelled empty slot, so the slot steps aside at once
    const gid = `_${key}-${d.kind}`, ghost = els.get(gid); if (ghost) { els.delete(gid); ghost.classList.add('leave'); setTimeout(() => ghost.remove(), 420); }
    el.style.left = pos.x * 100 + '%'; el.style.top = pos.y * 100 + '%'; el.style.width = pos.s * 100 + '%';
    plates[key].appendChild(el); apply(key);
    if (!animate || reduce) { flourish(el, d); sync(); return; }
    el.style.visibility = 'hidden';
    ladle(key, pos.x, pos.y, pos.s).then(() => { if (els.get(id) === el) { el.style.visibility = ''; flourish(el, d); } });
    if (!quiet) msg.textContent = `${d.name} served.`;
    sync();
  };
  const take = (id) => {
    const el = els.get(id), d = dish(id); if (!el || !d) return;
    const key = plateOf(d); served[key] = served[key].filter((x) => x.id !== id); els.delete(id);
    el.classList.add('leave'); setTimeout(() => el.remove(), 420); apply(key);
    msg.textContent = `${d.name} taken off.`; sync();
  };
  cards.forEach((c) => c.addEventListener('click', () => (els.has(c.dataset.id) ? take(c.dataset.id) : serve(c.dataset.id, true))));

  /* ---------- steps ---------- */
  const stepBtns = $$('.tn-step'), groups = $$('.tn-group'), title = $('.tn-title'), next = $('.tn-next'), back = $('.tn-back');
  const summary = $('.tn-summary'), actions = $('.tn-actions'), filter = $('.tn-filter');
  const go = (i) => {
    const was = cur;
    cur = clamp(i, 0, STEPS.length - 1); const s = STEPS[cur];
    stage.dataset.view = s.plate;
    stepBtns.forEach((b, k) => { b.toggleAttribute('aria-current', k === cur); if (k === cur) b.setAttribute('aria-current', 'step'); b.classList.toggle('done', k < cur); });
    groups.forEach((g, k) => { g.hidden = k !== cur; });
    title.textContent = s.title;
    const feast = s.key === 'feast';
    summary.hidden = !feast; actions.hidden = !feast; filter.hidden = feast;
    next.hidden = feast; next.innerHTML = `${s.next || ''} <i>→</i>`; back.hidden = cur === 0;
    if (feast) {
      const names = (k) => STEPS.filter((x) => x.key === k).length && [...served.a, ...served.b].filter((d) => d.step === k).map((d) => d.name).join(', ');
      $('.tn-list').innerHTML = STEPS.slice(0, 3).map((x) => `<li><h4>${x.title}</h4><p>${names(x.key) || 'Nothing chosen yet.'}</p></li>`).join('');
    }
    msg.textContent = '';
    apply('a'); apply('b');
    // a cloche covers the thalis and lifts away to reveal the feast
    if (feast && was !== cur && !reduce) {
      $$('.tn-cloche').forEach((c) => { c.classList.remove('lift'); c.classList.add('cover'); });
      setTimeout(() => $$('.tn-cloche').forEach((c) => { c.classList.remove('cover'); c.classList.add('lift'); }), 1500);
      setTimeout(() => { $$('.tn-cloche').forEach((c) => c.classList.remove('lift')); msg.textContent = 'Your thalis are ready.'; }, 2600);
    }
  };
  stepBtns.forEach((b, k) => b.addEventListener('click', () => go(k)));
  next.addEventListener('click', () => { go(cur + 1); sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  back.addEventListener('click', () => go(cur - 1));
  $$('.tn-filter button').forEach((b) => b.addEventListener('click', () => {
    $$('.tn-filter button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    cards.forEach((c) => c.classList.toggle('hide', b.dataset.f !== 'all' && !c.dataset.diet.split(' ').includes(b.dataset.f)));
  }));

  /* ---------- your feast: send, save, start again ---------- */
  const list = () => STEPS.slice(0, 3).map((x) => [x.title, [...served.a, ...served.b].filter((d) => d.step === x.key).map((d) => d.name)]);
  $('.tn-send').addEventListener('click', () => {
    const rows = list().filter(([, n]) => n.length); if (!rows.length) { msg.textContent = 'Choose a few dishes first.'; return; }
    const text = ['Hello Apna Catering, here are the thalis I prepared on your website:', '', ...rows.flatMap(([t, n]) => [`${t}:`, ...n.map((x) => '• ' + x), '']), 'Please let me know if my date is available and send me a quote.'].join('\n');
    window.open('https://wa.me/447818478036?text=' + encodeURIComponent(text), '_blank');
  });
  $('.tn-clear').addEventListener('click', () => { [...els.keys()].forEach(take); go(0); msg.textContent = 'Both thalis cleared.'; });
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  $('.tn-save').addEventListener('click', async () => {
    if (!served.a.length && !served.b.length) { msg.textContent = 'Choose a few dishes first.'; return; }
    msg.textContent = 'Preparing your picture…';
    try {
      const base = await loadImg($('.tn-plate-img').src), W = base.naturalWidth, H = base.naturalHeight, pad = 80;
      const cv = document.createElement('canvas'); cv.width = W * 2 + pad * 3; cv.height = H + pad * 2 + 140;
      const c = cv.getContext('2d'); c.fillStyle = getComputedStyle(document.body).backgroundColor; c.fillRect(0, 0, cv.width, cv.height);
      for (const [k, key] of ['a', 'b'].entries()) {
        const ox = pad + k * (W + pad), oy = pad; c.drawImage(base, ox, oy, W, H);
        const pos = layout(key);
        for (const { e: d, x, y, s: sz } of Object.values(pos)) {
          if (d.empty) continue;
          const im = await loadImg(d.img), cx = ox + x * W, cy = oy + y * H, s = sz * W * (d.gift ? .62 : .94);
          if (d.as !== 'plated') {
            const r = s / 2, g = c.createRadialGradient(cx - r * .25, cy - r * .35, 0, cx, cy, r);
            g.addColorStop(0, '#fbe7b0'); g.addColorStop(.45, '#d6a956'); g.addColorStop(1, '#6e4a18');
            c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 18; c.shadowOffsetY = 10; c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.restore();
            const ri = r * (d.as === 'dish' ? .9 : .82); c.save(); c.beginPath(); c.arc(cx, cy, ri, 0, Math.PI * 2); c.clip();
            const q = Math.max(2 * ri / im.width, 2 * ri / im.height); c.drawImage(im, cx - im.width * q / 2, cy - im.height * q / 2, im.width * q, im.height * q); c.restore();
          } else {
            const q = Math.min(s / im.width, s / im.height), iw = im.width * q, ih = im.height * q;
            c.save(); c.shadowColor = 'rgba(40,20,0,.5)'; c.shadowBlur = 16; c.shadowOffsetX = 6; c.shadowOffsetY = 12; c.drawImage(im, cx - iw / 2, cy - ih / 2, iw, ih); c.restore();
          }
        }
      }
      c.fillStyle = '#e9cf94'; c.textAlign = 'center';
      c.font = '400 60px "Playfair Display", Georgia, serif'; c.fillText('My Apna Catering wedding thalis', cv.width / 2, cv.height - 76);
      c.font = '600 24px Manrope, sans-serif'; c.fillText('APNACATERING.CO.UK · GLASGOW · SINCE 1995', cv.width / 2, cv.height - 34);
      cv.toBlob((blob) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-apna-thalis.png'; document.body.appendChild(a); a.click(); a.remove(); msg.textContent = 'Picture saved. Share it with the family!'; }, 'image/png');
    } catch (e) { msg.textContent = 'Sorry, the picture could not be made in this browser.'; }
  });

  /* ---------- start: restore, or show a welcome thali ---------- */
  apply('a'); apply('b'); go(0);
  const saved = store.get('thali-new', null);
  if (saved && (saved.a.length || saved.b.length)) [...saved.a, ...saved.b].forEach((id) => serve(id, false, true));
  else new IntersectionObserver((es, o) => es.forEach((e) => {
    if (!e.isIntersecting) return; o.disconnect();
    ['tandoori', 'samosa', 'paneer-tikka', 'pani-puri'].forEach((id, k) => setTimeout(() => { if (!els.has(id)) serve(id, true, true); }, 500 + k * 650));
  }), { threshold: .4 }).observe(stage);
})();
