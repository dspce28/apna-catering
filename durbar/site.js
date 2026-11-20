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

  /* ---------- glass venues: wipe the frost, it slowly returns ---------- */
  const glass = $('.glass');
  if (glass) {
    const cv = $('canvas', glass), ctx = cv.getContext('2d');
    const imgs = $$('.glass-img', glass), texts = $$('[data-kind-text]', glass), tabs = $$('.glass-toggle button', glass);
    let kind = 'indoor', frost = null, W = 0, H = 0, dpr = 1, last = null, holdUntil = 0;
    const current = () => imgs.find((im) => im.dataset.kind === kind);
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
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); ctx.drawImage(frost, 0, 0);
      glass.classList.remove('wiped');
    };
    const wipe = (x, y) => {
      const R = 120 * dpr, steps = last ? Math.max(1, Math.ceil(Math.hypot(x - last[0], y - last[1]) / (R * .3))) : 1;
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1;
      for (let k = 1; k <= steps; k++) {
        const px = last ? last[0] + (x - last[0]) * k / steps : x, py = last ? last[1] + (y - last[1]) * k / steps : y;
        const g = ctx.createRadialGradient(px, py, 0, px, py, R);
        g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
      }
      last = [x, y]; holdUntil = performance.now() + 1100; glass.classList.add('wiped');
    };
    glass.addEventListener('pointermove', (e) => {
      if (e.target.closest('.glass-toggle')) { last = null; return; }
      const r = cv.getBoundingClientRect(); wipe((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr);
    });
    glass.addEventListener('pointerleave', () => { last = null; });
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
    $$('[data-send]', form).forEach((b) => b.addEventListener('click', () => {
      const m = check(); err.textContent = m; if (m) return;
      const text = build();
      const url = b.dataset.send === 'whatsapp'
        ? 'https://wa.me/447818478036?text=' + encodeURIComponent(text)
        : 'mailto:hello@apnacatering.co.uk?subject=' + encodeURIComponent('Catering enquiry') + '&body=' + encodeURIComponent(text);
      window.open(url, b.dataset.send === 'whatsapp' ? '_blank' : '_self');
      wrap.classList.add('sent');
    }));
  }
})();
