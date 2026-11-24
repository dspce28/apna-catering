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
  const els = new Map();                         // id -> element on the thali
  const dish = (id) => { const c = byId[id]; return c && { id, name: c.dataset.name, step: c.dataset.step, as: c.dataset.as, img: c.dataset.img }; };
  const plateOf = (d) => (d.step === 'main' ? 'b' : 'a');
  // where a dish sits: the starters thali keeps sweets on the rim; the main thali keeps curries in katoris on the rim
  const zoneOf = (d) => (plateOf(d) === 'a' ? (d.step === 'sweets' ? 'ring' : 'centre') : (d.as === 'bowl' ? 'ring' : 'centre'));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- layout: a ring around the rim, a golden-angle spiral in the middle ---------- */
  const layout = (key) => {
    const list = served[key], ring = list.filter((d) => zoneOf(d) === 'ring'), mid = list.filter((d) => zoneOf(d) === 'centre');
    const pos = {}, R1 = .33;
    const s1 = ring.length ? clamp(2 * Math.PI * R1 / ring.length * .9, .09, .15) : 0;
    ring.forEach((d, i) => { const t = -Math.PI / 2 + i * 2 * Math.PI / ring.length; pos[d.id] = [.5 + R1 * Math.cos(t), .5 + R1 * Math.sin(t), s1]; });
    const Rd = ring.length ? R1 - s1 / 2 - .02 : .37, m = mid.length;
    if (m === 1) pos[mid[0].id] = [.5, .5, Math.min(.32, 2 * Rd * .85)];
    else if (m > 1) {
      const s = clamp(2 * Rd / (Math.sqrt(m) * 1.12 + .2), .07, .27);
      mid.forEach((d, i) => {
        const r = (Rd - s * .42) * Math.sqrt((i + .5) / m), t = i * 2.39996 - Math.PI / 2;
        pos[d.id] = [.5 + r * Math.cos(t), .5 + r * Math.sin(t), s];
      });
    }
    return pos;
  };
  const apply = (key) => {
    const pos = layout(key);
    served[key].forEach((d) => { const el = els.get(d.id), p = pos[d.id]; if (!el || !p) return; el.style.left = p[0] * 100 + '%'; el.style.top = p[1] * 100 + '%'; el.style.width = p[2] * 100 + '%'; });
  };

  /* ---------- serving ---------- */
  const sync = () => {
    const on = new Set([...served.a, ...served.b].map((d) => d.id));
    cards.forEach((c) => c.classList.toggle('on', on.has(c.dataset.id)));
    store.set('thali-new', { a: served.a.map((d) => d.id), b: served.b.map((d) => d.id) });
  };
  const makeEl = (d) => {
    const el = document.createElement('button'); el.type = 'button';
    el.className = 'tn-item ' + (d.as === 'bowl' ? 'bowl' : 'plated'); el.title = d.name;
    el.setAttribute('aria-label', `${d.name}. Tap to take it off.`);
    el.innerHTML = `<img src="${d.img}" alt="">`;
    el.addEventListener('click', () => take(d.id));
    return el;
  };
  const flourish = (el, d) => {
    if (reduce) return;
    if (d.as === 'bowl') {
      el.classList.add('drop'); const st = document.createElement('span'); st.className = 'tn-steam'; st.innerHTML = '<i></i><i></i><i></i>'; el.appendChild(st);
      setTimeout(() => st.remove(), 5200);
    } else {
      el.classList.add('land');
      for (let k = 0; k < 12; k++) { const s = document.createElement('span'); s.className = 'tn-sp'; s.style.setProperty('--a', (k * 30 + Math.random() * 20) + 'deg'); s.style.setProperty('--d', (40 + Math.random() * 50) + '%'); el.appendChild(s); setTimeout(() => s.remove(), 850); }
    }
    setTimeout(() => el.classList.remove('drop', 'land'), 1400);
  };
  const serve = (id, from, quiet) => {
    const d = dish(id); if (!d || els.has(id)) return;
    const key = plateOf(d); served[key].push(d);
    const el = makeEl(d); els.set(id, el); plates[key].appendChild(el); apply(key);
    if (!from || reduce) { flourish(el, d); sync(); return; }
    // the dish is carried from the counter in an arc and set down in its place
    el.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      const to = el.getBoundingClientRect(), fr = from.getBoundingClientRect();
      const fly = document.createElement('div'); fly.className = 'tn-fly' + (d.as === 'bowl' ? ' round' : '');
      fly.innerHTML = `<img src="${d.img}" alt="">`; fly.style.left = to.left + 'px'; fly.style.top = to.top + 'px'; fly.style.width = to.width + 'px';
      document.body.appendChild(fly);
      const s0 = fr.width / Math.max(1, to.width), dx = fr.left + fr.width / 2 - (to.left + to.width / 2), dy = fr.top + fr.height / 2 - (to.top + to.height / 2);
      const a = fly.animate([
        { transform: `translate(${dx}px,${dy}px) scale(${s0}) rotate(-10deg)`, opacity: .9 },
        { transform: `translate(${dx * .42}px,${dy * .42 - 120}px) scale(${(s0 + 1.2) / 2}) rotate(5deg)`, opacity: 1, offset: .55 },
        { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      ], { duration: 780, easing: 'cubic-bezier(.45,.05,.3,1)' });
      a.onfinish = () => { fly.remove(); el.style.visibility = ''; flourish(el, d); };
    });
    if (!quiet) msg.textContent = `${d.name} served.`;
    sync();
  };
  const take = (id) => {
    const el = els.get(id), d = dish(id); if (!el || !d) return;
    const key = plateOf(d); served[key] = served[key].filter((x) => x.id !== id); els.delete(id);
    el.classList.add('leave'); setTimeout(() => el.remove(), 420); apply(key);
    msg.textContent = `${d.name} taken off.`; sync();
  };
  cards.forEach((c) => c.addEventListener('click', () => (els.has(c.dataset.id) ? take(c.dataset.id) : serve(c.dataset.id, $('img', c)))));

  /* ---------- steps ---------- */
  const stepBtns = $$('.tn-step'), groups = $$('.tn-group'), title = $('.tn-title'), next = $('.tn-next'), back = $('.tn-back');
  const summary = $('.tn-summary'), actions = $('.tn-actions'), filter = $('.tn-filter');
  let cur = 0;
  const go = (i) => {
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
        for (const d of served[key]) {
          const p = pos[d.id], im = await loadImg(d.img), cx = ox + p[0] * W, cy = oy + p[1] * H, s = p[2] * W;
          if (d.as === 'bowl') {
            const r = s / 2, g = c.createRadialGradient(cx - r * .25, cy - r * .35, 0, cx, cy, r);
            g.addColorStop(0, '#fbe7b0'); g.addColorStop(.45, '#d6a956'); g.addColorStop(1, '#6e4a18');
            c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
            const ri = r * .82; c.save(); c.beginPath(); c.arc(cx, cy, ri, 0, Math.PI * 2); c.clip();
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
  go(0);
  const saved = store.get('thali-new', null);
  if (saved && (saved.a.length || saved.b.length)) [...saved.a, ...saved.b].forEach((id) => serve(id, null, true));
  else new IntersectionObserver((es, o) => es.forEach((e) => {
    if (!e.isIntersecting) return; o.disconnect();
    ['tandoori', 'samosa', 'paneer-tikka', 'pani-puri'].forEach((id, k) => setTimeout(() => { if (!els.has(id)) serve(id, $('img', byId[id]), true); }, 600 + k * 300));
  }), { threshold: .4 }).observe(stage);
})();
