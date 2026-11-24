/* Design-your-thali page (Direction B only): serving, effects, save and send. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sec = $('.tx'); if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k, d) { try { const v = JSON.parse(sessionStorage.getItem('apna-' + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem('apna-' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  // positions are fractions of the thali image: centre x, centre y, width
  const KATORI = [[.155, .44], [.236, .26], [.402, .156], [.598, .156], [.759, .26], [.839, .447]];
  const FILL = .146;
  const SPOTS = [[.50, .52, .23], [.73, .60, .21], [.27, .62, .21], [.50, .77, .19], [.70, .81, .17], [.30, .81, .17],
                 [.50, .31, .13], [.85, .67, .11], [.15, .67, .11], [.50, .905, .12]];
  const PREFER = {
    rice: [0, 6, 3, 1, 2, 4, 5, 7, 8, 9], bread: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9], starter: [2, 1, 3, 4, 5, 0, 6, 7, 8, 9],
    sweet: [4, 5, 3, 9, 6, 7, 8, 2, 1, 0], bowl: [6, 7, 8, 9, 4, 5, 3, 2, 1, 0],
  };

  const plate = $('.tx-plate'), layer = $('.tx-food'), cards = $$('.tx-card'), list = $('.tx-list'), meter = $('.tx-meter b'), msg = $('.tx-msg');
  const byId = Object.fromEntries(cards.map((c) => [c.dataset.id, c]));
  const served = { katori: KATORI.map(() => null), spot: SPOTS.map(() => null) };
  const all = () => [...served.katori.map((d, i) => d && { d, pool: 'katori', i }), ...served.spot.map((d, i) => d && { d, pool: 'spot', i })].filter(Boolean);
  const dish = (id) => { const c = byId[id]; return c && { id, name: c.dataset.name, kind: c.dataset.kind, diet: c.dataset.diet, img: c.dataset.img }; };
  const geom = (pool, i, d) => {
    if (pool === 'katori') { const [x, y] = KATORI[i]; return [x, y, FILL]; }
    const [x, y, w] = SPOTS[i]; return [x, y, d.kind === 'bowl' ? Math.min(Math.max(w, .14), .16) : w];
  };

  /* ---------- effects layer: gold sparkles and rising steam ---------- */
  const fx = $('.tx-fx'), ctx = fx.getContext('2d');
  let FW = 0, FH = 0, dpr = 1, parts = [], steams = [], running = false;
  const sizeFx = () => { const r = fx.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); FW = fx.width = r.width * dpr; FH = fx.height = r.height * dpr; };
  sizeFx(); addEventListener('resize', sizeFx);
  const toFx = (x, y) => [((x + .1) / 1.2) * FW, ((y + .1) / 1.2) * FH];
  const kick = () => { if (!running && !reduce) { running = true; requestAnimationFrame(tick); } };
  const burst = (x, y, n = 26) => {
    const [cx, cy] = toFx(x, y);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = (1.5 + Math.random() * 3.5) * dpr;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr, life: 1, s: (1 + Math.random() * 2.2) * dpr, c: Math.random() < .7 ? '255,214,130' : '255,246,220' });
    }
    kick();
  };
  const steam = (x, y, w) => { steams.push({ x, y, w, until: performance.now() + 6500, puffs: [] }); kick(); };
  function tick(now) {
    ctx.clearRect(0, 0, FW, FH);
    parts = parts.filter((p) => p.life > 0);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += .12 * dpr; p.vx *= .98; p.life -= .022;
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = `rgba(${p.c},1)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
    });
    steams = steams.filter((s) => s.until > now || s.puffs.length);
    steams.forEach((s) => {
      const [cx, cy] = toFx(s.x, s.y), R = s.w / 1.2 * FW / 2;
      if (s.until > now && Math.random() < .35) s.puffs.push({ x: cx + (Math.random() - .5) * R, y: cy - R * .2, t: 0, sp: .006 + Math.random() * .006, ph: Math.random() * 6 });
      s.puffs = s.puffs.filter((p) => p.t < 1);
      s.puffs.forEach((p) => {
        p.t += p.sp; const yy = p.y - p.t * R * 3.2, xx = p.x + Math.sin(p.t * 5 + p.ph) * R * .25, r = R * (.25 + p.t * .7);
        const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r);
        g.addColorStop(0, `rgba(255,250,240,${.16 * Math.sin(p.t * Math.PI)})`); g.addColorStop(1, 'rgba(255,250,240,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx, yy, r, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
    if (parts.length || steams.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, FW, FH); }
  }

  /* ---------- serving ---------- */
  const sync = () => {
    const on = new Set(all().map((s) => s.d.id));
    cards.forEach((c) => c.classList.toggle('on', on.has(c.dataset.id)));
    meter.textContent = all().length;
    const items = all();
    list.innerHTML = items.length
      ? items.map((s) => `<li>${s.d.name}<button type="button" data-pool="${s.pool}" data-i="${s.i}" aria-label="Remove ${s.d.name}">×</button></li>`).join('')
      : '<li class="tx-empty">Nothing served yet. Pick a chef’s thali or start with a curry.</li>';
    store.set('thali-hd', { katori: served.katori.map((d) => d && d.id), spot: served.spot.map((d) => d && d.id) });
  };
  const elFor = (pool, i) => $(`.tf[data-pool="${pool}"][data-i="${i}"]`, layer);
  const take = (pool, i) => {
    const d = served[pool][i]; if (!d) return;
    served[pool][i] = null; const el = elFor(pool, i);
    if (el) { el.classList.add('leave'); setTimeout(() => el.remove(), 380); }
    msg.textContent = `${d.name} taken off.`; sync();
  };
  const place = (pool, i, d, from) => {
    const [x, y, w] = geom(pool, i, d), bowl = d.kind === 'bowl';
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'tf ' + (bowl ? 'bowl' : 'plated') + (bowl && pool === 'spot' ? ' extra' : '');
    el.dataset.pool = pool; el.dataset.i = i; el.title = d.name;
    el.style.left = x * 100 + '%'; el.style.top = y * 100 + '%'; el.style.width = w * 100 + '%';
    el.setAttribute('aria-label', `${d.name}. Tap to take it off.`);
    el.innerHTML = `<img src="${d.img}" alt="">`;
    el.addEventListener('click', () => take(pool, i));
    const old = elFor(pool, i); if (old) old.remove();
    layer.appendChild(el);
    if (!from || reduce) return;
    const settle = () => {
      if (bowl) {
        el.classList.add('pour'); const ring = document.createElement('span'); ring.className = 'tf-ring'; el.appendChild(ring);
        setTimeout(() => ring.remove(), 950); steam(x, y, w);
      } else { el.classList.add('land'); burst(x, y, 18); }
      setTimeout(() => el.classList.remove('pour', 'land'), 1200);
    };
    // the dish travels from the counter in an arc and lands on its place
    el.style.visibility = 'hidden';
    const to = el.getBoundingClientRect(), fr = from.getBoundingClientRect();
    const fly = document.createElement('div'); fly.className = 'tx-fly' + (bowl ? ' round' : '');
    fly.innerHTML = `<img src="${d.img}" alt="">`;
    fly.style.left = to.left + 'px'; fly.style.top = to.top + 'px'; fly.style.width = to.width + 'px';
    document.body.appendChild(fly);
    const s0 = fr.width / to.width, dx = fr.left + fr.width / 2 - (to.left + to.width / 2), dy = fr.top + fr.height / 2 - (to.top + to.height / 2);
    const anim = fly.animate([
      { transform: `translate(${dx}px,${dy}px) scale(${s0}) rotate(-8deg)`, opacity: .9 },
      { transform: `translate(${dx * .42}px,${dy * .42 - 110}px) scale(${(s0 + 1.2) / 2}) rotate(4deg)`, opacity: 1, offset: .55 },
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
    ], { duration: 760, easing: 'cubic-bezier(.45,.05,.3,1)' });
    anim.onfinish = () => { fly.remove(); el.style.visibility = ''; settle(); };
  };
  const serve = (id, from, quiet) => {
    const d = dish(id); if (!d) return false;
    if (all().some((s) => s.d.id === id)) { if (!quiet) msg.textContent = `${d.name} is already on your thali.`; return false; }
    let pool = 'katori', i = d.kind === 'bowl' ? served.katori.findIndex((x) => !x) : -1;
    if (i < 0) { pool = 'spot'; i = (PREFER[d.kind] || PREFER.starter).find((k) => !served.spot[k]) ?? -1; }
    if (i < 0) { msg.textContent = 'Your thali is full. Tap any dish on it to make room.'; return false; }
    served[pool][i] = d; place(pool, i, d, from || $('img', byId[id]));
    if (!quiet) msg.textContent = d.kind === 'bowl' && pool === 'spot' ? `${d.name} served in an extra katori.` : `${d.name} served.`;
    sync(); return true;
  };
  const clear = () => { served.katori.fill(null); served.spot.fill(null); layer.innerHTML = ''; sync(); };
  list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) take(b.dataset.pool, +b.dataset.i); });

  /* ---------- the counter: tap or drag ---------- */
  cards.forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const sx = e.clientX, sy = e.clientY; let ghost = null, over = false;
      const move = (ev) => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        if (!ghost) { ghost = card.cloneNode(true); ghost.classList.add('tx-ghost'); ghost.style.width = card.offsetWidth + 'px'; document.body.appendChild(ghost); }
        ghost.style.left = ev.clientX - card.offsetWidth / 2 + 'px'; ghost.style.top = ev.clientY - 50 + 'px';
        const r = plate.getBoundingClientRect(); over = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
        plate.classList.toggle('over', over);
      };
      const up = () => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        plate.classList.remove('over');
        if (ghost) { if (over) serve(card.dataset.id, $('img', ghost)); setTimeout(() => ghost.remove(), over ? 40 : 0); } else serve(card.dataset.id);
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); serve(card.dataset.id); } });
  });

  // course tabs and diet filter work together
  let tab = 'all', diet = 'all';
  const filter = () => cards.forEach((c) => c.classList.toggle('hide',
    (tab !== 'all' && c.dataset.kind !== tab) || (diet !== 'all' && !c.dataset.diet.split(' ').includes(diet))));
  $$('.tx-tabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; $$('.tx-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b)); filter(); }));
  $$('.tx-filter button').forEach((b) => b.addEventListener('click', () => { diet = b.dataset.f; $$('.tx-filter button').forEach((x) => x.setAttribute('aria-pressed', x === b)); filter(); }));

  // chef's thalis are served one dish at a time
  let presetTimer = [];
  $$('.tx-preset').forEach((b) => b.addEventListener('click', () => {
    presetTimer.forEach(clearTimeout); clear();
    const ids = b.dataset.ids.split(' ');
    ids.forEach((id, k) => presetTimer.push(setTimeout(() => serve(id, null, true), reduce ? 0 : k * 240)));
    presetTimer.push(setTimeout(() => { msg.textContent = `${b.textContent} thali served. Swap anything you like.`; }, ids.length * 240 + 500));
  }));
  $('.tx-clear').addEventListener('click', () => { presetTimer.forEach(clearTimeout); clear(); msg.textContent = 'Thali cleared.'; });

  // the thali tilts gently towards the pointer
  if (fine && !reduce) {
    const stage = $('.tx-stage');
    stage.addEventListener('pointermove', (e) => {
      const r = plate.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      plate.style.setProperty('--rx', (10 - y * 8).toFixed(2) + 'deg'); plate.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
    });
    stage.addEventListener('pointerleave', () => { plate.style.removeProperty('--rx'); plate.style.removeProperty('--ry'); });
  }

  /* ---------- save a picture, send, add to enquiry ---------- */
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  $('.tx-save').addEventListener('click', async () => {
    const items = all(); if (!items.length) { msg.textContent = 'Serve a few dishes first.'; return; }
    msg.textContent = 'Preparing your picture…';
    try {
      const base = await loadImg($('.tx-plate-img').src), W = base.naturalWidth, H = base.naturalHeight, pad = 90;
      const cv = document.createElement('canvas'); cv.width = W + pad * 2; cv.height = H + pad * 2 + 120;
      const c = cv.getContext('2d'), bg = getComputedStyle(document.body).backgroundColor;
      c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
      const glow = c.createRadialGradient(cv.width / 2, pad + H / 2, 0, cv.width / 2, pad + H / 2, W * .7);
      glow.addColorStop(0, 'rgba(255,214,150,.22)'); glow.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = glow; c.fillRect(0, 0, cv.width, cv.height);
      c.drawImage(base, pad, pad, W, H);
      for (const { d, pool, i } of items) {
        const [x, y, w] = geom(pool, i, d), im = await loadImg(d.img), cx = pad + x * W, cy = pad + y * H, s = w * W;
        if (d.kind === 'bowl') {
          let r = s / 2;
          if (pool === 'spot') { const g = c.createRadialGradient(cx - r * .2, cy - r * .3, 0, cx, cy, r); g.addColorStop(0, '#f6dfa0'); g.addColorStop(.55, '#c99a4a'); g.addColorStop(1, '#7f5a20'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); r *= .82; }
          c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
          const k = Math.max(2 * r / im.width, 2 * r / im.height); c.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k);
          const sh = c.createRadialGradient(cx, cy, r * .7, cx, cy, r); sh.addColorStop(0, 'rgba(40,20,0,0)'); sh.addColorStop(1, 'rgba(40,20,0,.45)'); c.fillStyle = sh; c.fillRect(cx - r, cy - r, r * 2, r * 2);
          c.restore();
        } else {
          const k = Math.min(s / im.width, s / im.height), iw = im.width * k, ih = im.height * k;
          c.save(); c.shadowColor = 'rgba(40,20,0,.5)'; c.shadowBlur = 16; c.shadowOffsetX = 6; c.shadowOffsetY = 12;
          c.drawImage(im, cx - iw / 2, cy - ih / 2, iw, ih); c.restore();
        }
      }
      c.fillStyle = '#e9cf94'; c.textAlign = 'center';
      c.font = '400 54px "Playfair Display", Georgia, serif'; c.fillText('My Apna Catering thali', cv.width / 2, cv.height - 70);
      c.font = '600 22px Manrope, sans-serif'; c.fillText('APNACATERING.CO.UK · GLASGOW · SINCE 1995', cv.width / 2, cv.height - 30);
      cv.toBlob((blob) => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-apna-thali.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        msg.textContent = 'Picture saved. Share it with the family!';
      }, 'image/png');
    } catch (e) { msg.textContent = 'Sorry, the picture could not be made in this browser.'; }
  });
  const names = () => all().map((s) => s.d.name);
  $('.tx-send').addEventListener('click', () => {
    const n = names(); if (!n.length) { msg.textContent = 'Serve a few dishes first.'; return; }
    const text = ['Hello Apna Catering, this is the thali I designed on your website:', '', ...n.map((x) => '• ' + x), '', 'Please let me know if my date is available.'].join('\n');
    window.open('https://wa.me/447818478036?text=' + encodeURIComponent(text), '_blank');
  });
  $('.tx-enquire').addEventListener('click', () => {
    const n = names(); if (!n.length) { msg.textContent = 'Serve a few dishes first.'; return; }
    const picks = store.get('picks', []); n.forEach((x) => { if (!picks.includes(x)) picks.push(x); }); store.set('picks', picks);
    const pill = $('.picks'); if (pill) { $('b', pill).textContent = picks.length; pill.classList.add('on'); }
    msg.innerHTML = `Added ${n.length} dishes to your enquiry. <a href="contact.html" class="link">Send it →</a>`;
  });

  /* ---------- restore the last thali, or serve the Royal Punjabi as a welcome ---------- */
  const saved = store.get('thali-hd', null);
  if (saved) {
    ['katori', 'spot'].forEach((p) => (saved[p] || []).forEach((id, i) => { const d = id && dish(id); if (d && i < served[p].length) { served[p][i] = d; place(p, i, d); } }));
    sync();
  } else {
    sync();
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect();
      setTimeout(() => { if (!all().length) $('.tx-preset').click(); }, 700);
    }), { threshold: .4 }).observe(plate);
  }
})();
