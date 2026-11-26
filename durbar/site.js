(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k, d) { try { const v = JSON.parse(sessionStorage.getItem('apna-' + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem('apna-' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* ---------- nav ---------- */
  const nav = $('.nav'), burger = $('.burger'), drawer = $('.drawer');
  const onScrollNav = () => nav.classList.toggle('scrolled', scrollY > 30);
  onScrollNav(); addEventListener('scroll', onScrollNav, { passive: true });
  const setDrawer = (open) => { burger.setAttribute('aria-expanded', open); drawer.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  burger && burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer && drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) setDrawer(false); });
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- reveals: slow fade, soft wipe ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-fade],[data-wipe]').forEach((el) => rio.observe(el));

  /* ---------- one scroll loop for everything scroll-linked ---------- */
  const jobs = [];
  let lastY = -1, lastW = innerWidth;
  (function loop() {
    if (scrollY !== lastY || innerWidth !== lastW) { lastY = scrollY; lastW = innerWidth; jobs.forEach((f) => f()); }
    requestAnimationFrame(loop);
  })();

  /* ---------- events stage ---------- */
  const stage = $('.stage');
  if (stage) {
    const bgs = $$('.st-bg', stage), cards = $$('.st-card', stage), dots = $$('.st-dots i', stage), n = bgs.length;
    jobs.push(() => {
      const r = stage.getBoundingClientRect(), span = r.height - innerHeight;
      const p = clamp(-r.top / span) * (n - 1);
      for (let i = 1; i < n; i++) {
        const t = clamp(p - (i - 1)), e = reduce ? Math.round(t) : (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        bgs[i].style.setProperty('--r', e.toFixed(4)); cards[i].style.setProperty('--r', e.toFixed(4));
      }
      const cur = Math.min(n - 1, Math.round(p)); dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    });
  }

  /* ---------- process thread ---------- */
  const steps = $('.steps');
  if (steps) jobs.push(() => {
    const r = steps.getBoundingClientRect();
    steps.style.setProperty('--sp', reduce ? 1 : clamp((innerHeight * .85 - r.top) / (r.height * .8)).toFixed(4));
  });

  /* ---------- menu board: photo follows the category being read ---------- */
  const board = $('.board');
  if (board) {
    const photos = $$('.board-photo img', board), cap = $('.board-cap', board);
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const k = e.target.dataset.cat;
      photos.forEach((p) => { const on = p.dataset.for === k; if (on) p.loading = 'eager'; p.classList.toggle('on', on); });
      if (cap) cap.textContent = e.target.dataset.title;
    }), { rootMargin: '-40% 0px -50% 0px' });
    $$('.cat', board).forEach((c) => cio.observe(c));
  }

  /* ---------- dish picks carry through to the enquiry ---------- */
  let picks = store.get('picks', []);
  const pill = $('.picks');
  const syncPicks = () => {
    $$('.dish .add, .bdish .add').forEach((b) => b.setAttribute('aria-pressed', picks.includes(b.dataset.dish)));
    if (pill) { $('b', pill).textContent = picks.length; pill.classList.toggle('on', picks.length > 0); }
    const fp = $('.form-picks');
    if (fp) fp.innerHTML = picks.length ? 'Dishes you picked: <b>' + picks.map((p) => p.replace(/</g, '')).join(', ') + '</b>' : '';
  };
  $$('.dish .add, .bdish .add').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.dish; picks = picks.includes(d) ? picks.filter((x) => x !== d) : [...picks, d];
    store.set('picks', picks); syncPicks();
  }));
  syncPicks();

  /* ---------- glass venues: rose and marigold petals cover the view; brush them aside, they drift back ---------- */
  const PETALS = [['#c4162f', '#f0607a'], ['#9c0f27', '#d8324d'], ['#e8780c', '#f6b04a'], ['#f08a1c', '#ffc46b'], ['#f3c2cc', '#fff0f2'], ['#b3123a', '#ff8fa3']];
  const drawPetal = (c, x, y, len, rot, col) => {
    c.save(); c.translate(x, y); c.rotate(rot);
    const w = len * 0.62, g = c.createLinearGradient(0, -len, 0, len);
    g.addColorStop(0, col[1]); g.addColorStop(1, col[0]);
    c.fillStyle = g; c.beginPath(); c.moveTo(0, -len);
    c.bezierCurveTo(w, -len * 0.6, w * 0.9, len * 0.55, 0, len);
    c.bezierCurveTo(-w * 0.9, len * 0.55, -w, -len * 0.6, 0, -len); c.fill();
    c.strokeStyle = 'rgba(80,0,10,.18)'; c.lineWidth = Math.max(0.6, len * 0.05); c.beginPath(); c.moveTo(0, -len * 0.7); c.quadraticCurveTo(len * 0.08, 0, 0, len * 0.8); c.stroke();
    c.restore();
  };
  const SHEET = new Image(), TILES = 24, TS = 128; SHEET.src = 'img/petals.webp';
  const strew = (c, W, H, dpr) => {
    const n = Math.round((W * H) / (dpr * dpr * 1900)), ready = SHEET.complete && SHEET.naturalWidth;
    c.shadowColor = 'rgba(30,0,6,.45)'; c.shadowBlur = 5 * dpr; c.shadowOffsetX = 1.5 * dpr; c.shadowOffsetY = 3 * dpr;
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W, y = Math.random() * H, rot = Math.random() * Math.PI * 2;
      if (!ready) { drawPetal(c, x, y, (11 + Math.random() * 12) * dpr, rot, PETALS[(Math.random() * PETALS.length) | 0]); continue; }
      const k = (Math.random() * TILES) | 0, sz = (30 + Math.random() * 26) * dpr;
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(Math.random() < .5 ? -1 : 1, 1);
      c.drawImage(SHEET, k * TS, 0, TS, TS, -sz / 2, -sz / 2, sz, sz); c.restore();
    }
    c.shadowColor = 'transparent';
  };
  const spriteEl = (size, rot) => {
    const k = (Math.random() * TILES) | 0, e = document.createElement('i');
    e.className = 'petal-sprite'; e.style.width = e.style.height = size + 'px';
    e.style.backgroundPosition = `${(k / (TILES - 1)) * 100}% 0`; e.style.transform = `rotate(${rot}deg)`;
    return e;
  };
  const petalSVG = (col, rot, size) => `<svg viewBox="-12 -16 24 32" width="${size}" height="${size * 1.33}" style="transform:rotate(${rot}deg)"><defs><linearGradient id="pg${col[0].slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col[1]}"/><stop offset="1" stop-color="${col[0]}"/></linearGradient></defs><path d="M0-14C9-9 8 8 0 14C-8 8-9-9 0-14Z" fill="url(#pg${col[0].slice(1)})"/></svg>`;
  const glass = $('.glass');
  if (glass) {
    const cv = $('canvas', glass), ctx = cv.getContext('2d');
    const imgs = $$('.glass-img', glass), texts = $$('[data-kind-text]', glass), tabs = $$('.glass-toggle button', glass);
    let kind = 'indoor', frost = null, W = 0, H = 0, dpr = 1, last = null, holdUntil = 0;
    const current = () => imgs.find((im) => im.dataset.kind === kind);
    SHEET.addEventListener('load', () => { if (frost) build(); }, { once: true });
    const build = () => {
      const im = current();
      if (!im.complete || !im.naturalWidth) { im.addEventListener('load', build, { once: true }); return; }
      const r = glass.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      const tiny = document.createElement('canvas'); tiny.width = Math.max(8, Math.round(W / 26)); tiny.height = Math.max(8, Math.round(H / 26));
      const tc = tiny.getContext('2d'), s = Math.max(tiny.width / im.naturalWidth, tiny.height / im.naturalHeight);
      tc.drawImage(im, (tiny.width - im.naturalWidth * s) / 2, (tiny.height - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
      frost = document.createElement('canvas'); frost.width = W; frost.height = H;
      const fc = frost.getContext('2d'); fc.imageSmoothingQuality = 'high'; fc.drawImage(tiny, 0, 0, W, H);
      fc.fillStyle = getComputedStyle(glass).getPropertyValue('--frost').trim() || 'rgba(250,245,236,.62)'; fc.fillRect(0, 0, W, H);
      strew(fc, W, H, dpr);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); ctx.drawImage(frost, 0, 0);
      glass.classList.remove('wiped');
    };
    const wipe = (x, y) => {
      const R = 140 * dpr, steps = last ? Math.max(1, Math.ceil(Math.hypot(x - last[0], y - last[1]) / (R * .3))) : 1;
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1;
      for (let k = 1; k <= steps; k++) {
        const px = last ? last[0] + (x - last[0]) * k / steps : x, py = last ? last[1] + (y - last[1]) * k / steps : y;
        const g = ctx.createRadialGradient(px, py, 0, px, py, R);
        g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
      }
      last = [x, y]; holdUntil = performance.now() + 1100; glass.classList.add('wiped');
    };
    // the pointer becomes a little cluster of petals; brushed petals tumble away as you go
    const cursor = $('.glass-cursor', glass), fine = matchMedia('(pointer: fine)').matches, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cursor) [[-30, 30], [28, 26], [100, 22]].forEach(([r, sz]) => cursor.appendChild(spriteEl(sz, r)));
    if (fine) glass.classList.add('petal-cursor');
    let fly = 0, lastFly = null;
    const tumble = (x, y, dx, dy) => {
      if (calm || fly > 36) return;
      const el = document.createElement('i'); el.className = 'petal-fly';
      el.appendChild(spriteEl(26 + Math.random() * 22, Math.random() * 360)); el.style.left = x + 'px'; el.style.top = y + 'px';
      glass.appendChild(el); fly++;
      const sx = dx * (0.6 + Math.random() * 0.8) + (Math.random() - 0.5) * 60, fall = 120 + Math.random() * 160, spin = (Math.random() - 0.5) * 720;
      const a = el.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${sx * 0.6}px), calc(-50% + ${dy * 0.3 - 30}px)) rotate(${spin * 0.4}deg) scale(1.05)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${fall}px)) rotate(${spin}deg) scale(.8)`, opacity: 0 },
      ], { duration: 1300 + Math.random() * 900, easing: 'cubic-bezier(.3,.6,.4,1)' });
      a.onfinish = () => { el.remove(); fly--; };
    };
    glass.addEventListener('pointermove', (e) => {
      const r = glass.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const onToggle = !!e.target.closest('.glass-toggle');
      if (cursor) { cursor.style.transform = `translate(${x}px, ${y}px)`; cursor.classList.toggle('off', onToggle); }
      if (onToggle) { last = null; lastFly = null; return; }
      wipe(x * dpr, y * dpr);
      if (lastFly) { const d = Math.hypot(x - lastFly[0], y - lastFly[1]); if (d > 26) { tumble(x, y, x - lastFly[0], y - lastFly[1]); if (d > 70) tumble(x, y, x - lastFly[0], y - lastFly[1]); lastFly = [x, y]; } } else lastFly = [x, y];
    });
    glass.addEventListener('pointerenter', () => cursor && cursor.classList.add('on'));
    glass.addEventListener('pointerleave', () => { last = null; lastFly = null; if (cursor) cursor.classList.remove('on'); });
    (function refrost(t) {
      if (frost && t > holdUntil) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .02; ctx.drawImage(frost, 0, 0); ctx.globalAlpha = 1; }
      requestAnimationFrame(refrost);
    })(0);
    const setKind = (k) => {
      kind = k;
      imgs.forEach((im) => { const on = im.dataset.kind === k; if (on) im.loading = 'eager'; im.classList.toggle('on', on); });
      texts.forEach((t) => { t.hidden = t.dataset.kindText !== k; });
      tabs.forEach((b) => b.setAttribute('aria-selected', b.dataset.kind === k));
      build();
    };
    tabs.forEach((b) => b.addEventListener('click', () => setKind(b.dataset.kind)));
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { setKind('indoor'); o.disconnect(); } }), { rootMargin: '300px' }).observe(glass);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => frost && build(), 200); });
  }

  /* ---------- tabs ---------- */
  $$('.tabs').forEach((bar) => {
    const btns = $$('[role=tab]', bar);
    const show = (b) => {
      btns.forEach((x) => x.setAttribute('aria-selected', x === b));
      $$('.tpanel').forEach((p) => { p.hidden = p.id !== b.getAttribute('aria-controls'); });
      $$('[data-wipe],[data-fade]', $('#' + b.getAttribute('aria-controls'))).forEach((el) => el.classList.add('in'));
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b)));
    bar.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
      const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]; n.focus(); show(n);
    });
  });

  /* ---------- testimonials ---------- */
  const qs = $$('.quote-slide'), qd = $$('.quote-dots button');
  if (qs.length > 1) {
    let qi = 0, qt;
    const go = (i) => { qi = i; qs.forEach((s, k) => s.classList.toggle('on', k === i)); qd.forEach((d, k) => d.setAttribute('aria-current', k === i)); };
    const auto = () => { clearInterval(qt); if (!reduce) qt = setInterval(() => go((qi + 1) % qs.length), 7000); };
    qd.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    go(0); auto();
  }

  /* ---------- remember the occasion a visitor clicked ---------- */
  $$('[data-occasion]').forEach((a) => a.addEventListener('click', () => store.set('occasion', a.dataset.occasion)));

  /* ---------- big scroll sections load their photos early, so nobody waits on a blurred preview ---------- */
  if ('IntersectionObserver' in window) {
    const pre = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; pre.unobserve(e.target);
      e.target.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
    }), { rootMargin: '1600px 0px' });
    document.querySelectorAll('[data-preload]').forEach((s) => pre.observe(s));
  }

  /* ---------- enquiry form ---------- */
  const form = $('#enquiry');
  if (form) {
    const occ = store.get('occasion', null);
    if (occ) { const r = $$('input[name=occasion]', form).find((i) => i.value === occ); if (r) r.checked = true; }
    const err = $('.form-err', form), wrap = form.closest('.form');
    const build = () => {
      const f = new FormData(form), val = (k) => (f.get(k) || '').toString().trim();
      const lines = [
        'Hello Apna Catering, I would like to enquire about catering.',
        '', 'Occasion: ' + (val('occasion') || 'Not chosen'), 'Date: ' + (val('date') || 'TBC'), 'Guests: ' + (val('guests') || 'TBC'),
        'Venue: ' + (val('venue') || 'TBC'),
      ];
      if (picks.length) lines.push('Dishes we liked: ' + picks.join(', '));
      if (val('message')) lines.push('', val('message'));
      lines.push('', 'Name: ' + val('name'), 'Phone: ' + val('phone'));
      if (val('email')) lines.push('Email: ' + val('email'));
      return lines.join('\n');
    };
    const check = () => {
      const f = new FormData(form);
      if (!f.get('occasion')) return 'Please choose what you are celebrating.';
      if (!(f.get('name') || '').toString().trim()) return 'Please tell us your name.';
      if (!(f.get('phone') || '').toString().trim()) return 'Please add a phone number so we can call you back.';
      return '';
    };
    // with a form key, every enquiry is emailed to the caterer and kept on record, even if the visitor goes on to WhatsApp
    const key = form.dataset.key;
    const record = (via) => {
      if (!key) return Promise.resolve(false);
      const f = new FormData(form), val = (k) => (f.get(k) || '').toString().trim();
      if (f.get('botcheck')) return Promise.resolve(true);
      return fetch('https://api.web3forms.com/submit', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: key, subject: `Website enquiry: ${val('occasion') || 'catering'}, ${val('name')}`, from_name: 'Apna Catering website',
          name: val('name'), phone: val('phone'), email: val('email'), replyto: val('email'), sent_via: via, enquiry: build() }),
      }).then((r) => r.json()).then((j) => !!j.success).catch(() => false);
    };
    const done = (msg) => { $('.form-done-msg', wrap).textContent = msg; wrap.classList.add('sent'); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    $$('[data-send]', form).forEach((b) => b.addEventListener('click', async (e) => {
      e.preventDefault();
      const m = check(); err.textContent = m; if (m) return;
      const text = build();
      if (b.dataset.send === 'form') {
        b.disabled = true; const label = b.innerHTML; b.textContent = 'Sending…';
        const ok = await record('website form');
        b.disabled = false; b.innerHTML = label;
        if (ok) done('We have your enquiry and will call you within one working day.');
        else err.textContent = 'Sorry, that did not go through. Please use “Send on WhatsApp” or call 07818 478036.';
        return;
      }
      if (b.dataset.send === 'whatsapp') record('WhatsApp');
      const url = b.dataset.send === 'whatsapp'
        ? 'https://wa.me/447818478036?text=' + encodeURIComponent(text)
        : 'mailto:hello@apnacatering.co.uk?subject=' + encodeURIComponent('Catering enquiry') + '&body=' + encodeURIComponent(text);
      window.open(url, b.dataset.send === 'whatsapp' ? '_blank' : '_self');
      done(key ? 'We have your details and will be in touch within one working day.' : 'Your message is ready to send. We’ll be in touch within one working day.');
    }));
  }
})();
