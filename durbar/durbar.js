/* Direction B only: interactive tools and scroll stages. Loaded after site.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k, d) { try { const v = JSON.parse(sessionStorage.getItem('apna-' + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem('apna-' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const gbp = (n) => '£' + Math.round(n).toLocaleString('en-GB');
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const WA = 'https://wa.me/447818478036?text=';

  const CER = {
    roka: { name: 'Roka & Chunni', menu: { veg: 'Chaat, paneer tikka, samosas and fresh mithai', jain: 'Chaat, paneer tikka (no onion or garlic) and mithai', nonveg: 'Chaat, chicken tikka, seekh kebab and mithai' } },
    mehndi: { name: 'Mehndi & Sangeet', menu: { veg: 'Live chaat, paneer tikka, veg biryani and late-night chai', jain: 'Live chaat, paneer tikka and pulao, all Jain', nonveg: 'Live chaat, tandoori grill, biryani and late-night chai' } },
    haldi: { name: 'Haldi / Jaggo', menu: { veg: 'Puri chole, kachori and fresh jalebi', jain: 'Puri, Jain chole and fresh jalebi', nonveg: 'Puri chole, kachori and fresh jalebi' } },
    wedding: { name: 'Anand Karaj / Pheras', menu: { veg: 'Vegetarian breakfast: pakoras, puri chole, jalebi and chai', jain: 'Jain breakfast: puri, paneer, jalebi and chai', nonveg: 'Vegetarian breakfast: pakoras, puri chole, jalebi and chai' } },
    reception: { name: 'Reception', menu: { veg: 'Paneer makhani, dal makhani, veg biryani, naan and rasmalai', jain: 'Jain paneer, dal, pulao, naan and rasmalai', nonveg: 'Butter chicken, lamb rogan josh, dal makhani, biryani and gulab jamun' } },
  };
  const ORDER = ['roka', 'mehndi', 'haldi', 'wedding', 'reception'];
  const EXTRA_NAME = { chaat: 'live chaat', tandoor: 'live tandoor', dessert: 'dessert & mithai bar', bar: 'mocktail bar' };

  /* ---------- count a number smoothly to its target ---------- */
  const tweens = new WeakMap();
  const countTo = (el, to, fmt = (n) => Math.round(n).toLocaleString('en-GB')) => {
    const from = tweens.get(el) ?? 0; tweens.set(el, to);
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 700;
    const step = (t) => {
      const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1 && tweens.get(el) === to) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* =========================================================
     FEAST PLANNER
     ========================================================= */
  $$('.pl').forEach((form) => {
    const range = $('.pl-range', form), gOut = $('.pl-guests', form), list = $('.pl-events', form);
    let summary = '';
    const draw = () => {
      const f = new FormData(form), guests = +range.value, diet = f.get('diet'), style = f.get('style');
      const cer = ORDER.filter((k) => f.getAll('cer').includes(k)), ext = f.getAll('ext');
      range.style.setProperty('--fill', ((guests - 50) / 950 * 100).toFixed(1) + '%');
      countTo(gOut, guests);
      list.innerHTML = cer.length ? cer.map((k, i) => `<li style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b><h4>${CER[k].name}</h4><p>${CER[k].menu[diet]}</p></li>`).join('')
        : '<li class="none">Choose at least one ceremony to see your plan.</li>';
      const staff = cer.length ? Math.ceil(guests / (style === 'plated' ? 12 : 25)) : 0, chefs = cer.length ? Math.ceil(guests / 100) + 1 : 0;
      countTo($('.pl-staff', form), staff); countTo($('.pl-chefs', form), chefs); countTo($('.pl-count', form), guests * cer.length);
      summary = [
        'Hello Apna Catering, here is the feast I planned on your website:', '',
        `Guests: ${guests}`, `Food: ${{ veg: 'Vegetarian', jain: 'Jain', nonveg: 'Veg and non-veg' }[diet]}`, `Service: ${style === 'plated' ? 'Plated' : 'Buffet'}`,
        ...cer.map((k) => `• ${CER[k].name}: ${CER[k].menu[diet]}`),
        ext.length ? `Extras: ${ext.map((x) => EXTRA_NAME[x]).join(', ')}` : '',
        '', 'Please let me know if my date is available and send me a quote.',
      ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
      store.set('plan', { guests, diet, style, cer, ext });
    };
    form.addEventListener('input', draw); form.addEventListener('change', draw);
    const saved = store.get('plan', null);
    if (saved) {
      range.value = saved.guests;
      $$('input[name=cer]', form).forEach((i) => { i.checked = saved.cer.includes(i.value); });
      $$('input[name=ext]', form).forEach((i) => { i.checked = saved.ext.includes(i.value); });
      $$('input[name=diet],input[name=style]', form).forEach((i) => { i.checked = i.value === saved[i.name]; });
    }
    draw();
    $('.pl-send', form).addEventListener('click', () => window.open(WA + encodeURIComponent(summary), '_blank'));
  });

  /* =========================================================
     MENU FILTERS (Veg / Jain / Non-veg / Live)
     ========================================================= */
  const board = $('.board');
  const menuFilter = $('#menu .mfilter');
  if (board && menuFilter) {
    const apply = (f) => {
      $$('button', menuFilter).forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === f));
      $$('.cat', board).forEach((cat) => {
        let shown = 0;
        $$('.dish', cat).forEach((d) => {
          const on = f === 'all' || d.dataset.diet.split(' ').includes(f);
          d.classList.toggle('out', !on); if (on) shown++;
        });
        cat.classList.toggle('empty', shown === 0);
      });
    };
    $$('button', menuFilter).forEach((b) => b.addEventListener('click', () => apply(b.dataset.f)));
  }

  /* =========================================================
     DESIGN YOUR THALI: food is served from the counter onto a real brass thali.
     Positions are fractions of the thali image (centre x, centre y, width).
     ========================================================= */
  // six katoris for gravies, and ten free spots on the plate that any dish can take
  const KATORI = [[.155, .44, .135], [.236, .26, .135], [.402, .156, .135], [.598, .156, .135], [.759, .26, .135], [.839, .447, .135]];
  const SPOTS = [[.50, .52, .23], [.73, .60, .21], [.27, .62, .21], [.50, .77, .19], [.70, .81, .17], [.30, .81, .17],
                 [.50, .31, .13], [.85, .67, .10], [.15, .67, .10], [.50, .905, .11]];
  const PREFER = {  // which plate spot each kind of dish looks for first
    rice: [0, 6, 3, 1, 2, 4, 5, 7, 8, 9], bread: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9], starter: [2, 1, 3, 4, 5, 0, 6, 7, 8, 9],
    sweet: [4, 5, 3, 9, 6, 7, 8, 2, 1, 0], bowl: [6, 7, 8, 9, 4, 5, 3, 2, 1, 0],
  };
  $$('.thali-sec').forEach((sec) => {
    const plate = $('.thali', sec), layer = $('.th-food', sec), toks = $$('.tok', sec), msg = $('.th-msg', sec), count = $('.th-count b', sec);
    const served = { katori: KATORI.map(() => null), spot: SPOTS.map(() => null) };
    const POS = { katori: KATORI, spot: SPOTS };
    $('.th-count', sec).lastChild.textContent = ` of ${KATORI.length + SPOTS.length} places served`;
    const all = () => [...served.katori, ...served.spot].filter(Boolean);
    const sync = () => {
      const on = new Set(all().map((d) => d.cut));
      toks.forEach((t) => t.classList.toggle('on', on.has(t.dataset.cut)));
      count.textContent = all().length;
      store.set('thali3', served);
    };
    const place = (pool, i, d, animateFrom) => {
      const [x, y, w] = POS[pool][i], bowl = d.kind === 'bowl';
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'food ' + (bowl ? 'bowl' : 'plated') + (bowl && pool === 'spot' ? ' extra' : '');
      el.dataset.pool = pool; el.dataset.i = i;
      el.style.left = x * 100 + '%'; el.style.top = y * 100 + '%'; el.style.width = w * 100 + '%';
      el.setAttribute('aria-label', d.name + ', tap to take it off');
      el.innerHTML = `<img src="img/cut/${d.cut}.webp" alt="">`;
      const old = $(`.food[data-pool="${pool}"][data-i="${i}"]`, layer); if (old) old.remove();
      el.addEventListener('click', () => {
        served[pool][i] = null; el.classList.add('leave'); setTimeout(() => el.remove(), 350);
        msg.textContent = `${d.name} taken off.`; sync();
      });
      if (!animateFrom || reduce) { layer.appendChild(el); return; }
      // fly from the counter to its place on the thali, as if served by hand
      el.style.visibility = 'hidden'; layer.appendChild(el);
      const to = el.getBoundingClientRect(), from = animateFrom.getBoundingClientRect();
      const fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = `<img src="img/cut/${d.cut}.webp" alt=""${bowl ? ' style="border-radius:50%"' : ''}>`;
      fly.style.left = to.left + 'px'; fly.style.top = to.top + 'px'; fly.style.width = to.width + 'px';
      document.body.appendChild(fly);
      const s0 = from.width / to.width, dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const a = fly.animate([
        { transform: `translate(${dx}px,${dy}px) scale(${s0})`, opacity: .9 },
        { transform: `translate(${dx * .45}px,${dy * .45 - 90}px) scale(${(s0 + 1.15) / 2})`, opacity: 1, offset: .55 },
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
      ], { duration: 720, easing: 'cubic-bezier(.45,.05,.3,1)' });
      a.onfinish = () => { fly.remove(); el.style.visibility = ''; el.classList.add('settle'); };
    };
    const serve = (tok, fromEl) => {
      const d = { cut: tok.dataset.cut, name: tok.dataset.name, kind: tok.dataset.kind };
      if (all().some((x) => x.cut === d.cut)) { msg.textContent = `${d.name} is already on your thali.`; return; }
      let pool = 'katori', i = d.kind === 'bowl' ? served.katori.findIndex((x) => !x) : -1;
      if (i < 0) { pool = 'spot'; i = (PREFER[d.kind] || PREFER.starter).find((k) => !served.spot[k]) ?? -1; }
      if (i < 0) { msg.textContent = 'Your thali is full. Tap any dish on it to make room.'; return; }
      msg.textContent = d.kind === 'bowl' && pool === 'spot' ? `${d.name} served in an extra katori.` : `${d.name} served.`;
      served[pool][i] = d; place(pool, i, d, fromEl || $('img', tok)); sync();
    };
    // tap to serve, or drag onto the thali
    toks.forEach((tok) => {
      tok.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const sx = e.clientX, sy = e.clientY; let ghost = null, over = false;
        const move = (ev) => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
          if (!ghost) { ghost = tok.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = tok.offsetWidth + 'px'; document.body.appendChild(ghost); }
          ghost.style.left = ev.clientX - tok.offsetWidth / 2 + 'px'; ghost.style.top = ev.clientY - 44 + 'px';
          const r = plate.getBoundingClientRect(); over = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
          plate.classList.toggle('over', over);
        };
        const up = () => {
          removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
          plate.classList.remove('over');
          if (ghost) { const g = $('img', ghost); if (over) serve(tok, g); setTimeout(() => ghost.remove(), over ? 30 : 0); } else serve(tok);
        };
        addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
      });
      tok.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); serve(tok); } });
    });
    $$('.th-filter button', sec).forEach((b) => b.addEventListener('click', () => {
      $$('.th-filter button', sec).forEach((x) => x.setAttribute('aria-pressed', x === b));
      toks.forEach((t) => t.classList.toggle('out', b.dataset.f !== 'all' && !t.dataset.diet.split(' ').includes(b.dataset.f)));
      $$('.tgroup', sec).forEach((g) => g.classList.toggle('empty', !$$('.tok:not(.out)', g).length));
    }));
    const clear = () => { served.katori.fill(null); served.spot.fill(null); layer.innerHTML = ''; sync(); };
    $('.th-clear', sec).addEventListener('click', () => { clear(); msg.textContent = 'Thali cleared.'; });
    // chef's choice: a balanced thali, served one dish at a time
    $('.th-chef', sec).addEventListener('click', () => {
      clear();
      const veg = $('.th-filter [aria-pressed=true]', sec).dataset.f;
      const pick = (kind, n) => toks.filter((t) => t.dataset.kind === kind && !t.classList.contains('out')).slice(0, n);
      const order = [...pick('bowl', 6), ...pick('rice', 1), ...pick('bread', 1), ...pick('starter', 2), ...pick('sweet', 1)];
      order.forEach((t, k) => setTimeout(() => serve(t), reduce ? 0 : k * 260));
      setTimeout(() => { msg.textContent = `Chef’s choice served${veg === 'all' ? '' : ' (' + veg.replace('nonveg', 'non-veg') + ')'}. Swap anything you like.`; }, order.length * 260 + 300);
    });
    $('.th-add', sec).addEventListener('click', () => {
      const names = all().map((d) => d.name);
      if (!names.length) { msg.textContent = 'Serve a dish or two first.'; return; }
      const picks = store.get('picks', []); names.forEach((n) => { if (!picks.includes(n)) picks.push(n); });
      store.set('picks', picks);
      const pill = $('.picks'); if (pill) { $('b', pill).textContent = picks.length; pill.classList.add('on'); }
      msg.innerHTML = `Added ${names.length} ${names.length === 1 ? 'dish' : 'dishes'} to your enquiry. <a href="contact.html" class="link">Send it →</a>`;
    });
    const saved = store.get('thali3', null);
    if (saved) ['katori', 'spot'].forEach((p) => (saved[p] || []).forEach((d, i) => { if (d && d.kind && i < POS[p].length) { served[p][i] = d; place(p, i, d); } }));
    sync();
  });

  /* =========================================================
     WEDDING COUNTDOWN
     ========================================================= */
  $$('.cd').forEach((sec) => {
    const input = $('.cd-date', sec), clock = $('.cd-clock', sec), steps = $('.cd-steps', sec);
    let timer;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    input.min = new Date(today.getTime() + 864e5).toISOString().slice(0, 10);
    const show = () => {
      clearInterval(timer);
      if (!input.value) { clock.hidden = steps.hidden = true; return; }
      const day = new Date(input.value + 'T12:00:00');
      store.set('date', input.value);
      const tick = () => {
        const ms = Math.max(0, day - new Date());
        $('.cd-d', sec).textContent = Math.floor(ms / 864e5);
        $('.cd-h', sec).textContent = String(Math.floor(ms / 36e5) % 24).padStart(2, '0');
        $('.cd-m', sec).textContent = String(Math.floor(ms / 6e4) % 60).padStart(2, '0');
        $('.cd-s', sec).textContent = String(Math.floor(ms / 1e3) % 60).padStart(2, '0');
      };
      tick(); timer = setInterval(tick, 1000); clock.hidden = false;
      // milestones are planned forward from today: the ideal lead time when there is room,
      // otherwise compressed into the time left (never in the past)
      const DAY = 864e5, lead = Math.max(1, Math.floor((day - today) / DAY));
      const plan = [['Book your tasting', 150, .2], ['Confirm the menu', 75, .5], ['Final guest numbers', 14, .8]];
      let prev = today.getTime(), rushedAny = false;
      const items = plan.map(([t, ideal, frac]) => {
        let when = day.getTime() - ideal * DAY, rushed = false;
        const soonest = today.getTime() + Math.max(1, Math.round(lead * frac)) * DAY;
        if (when < soonest) { when = soonest; rushed = true; rushedAny = true; }
        when = Math.min(Math.max(when, prev + DAY), day.getTime() - DAY);
        prev = when;
        return [t, new Date(when), rushed];
      });
      items.push(['The big day', day, false]);
      steps.innerHTML = items.map(([t, w, r], i) => `<li class="${i === 0 ? 'next' : ''}" style="--i:${i}"><b>${t}</b>${i === 3 ? 'on' : 'by'} <time>${fmtDate(w)}</time>${r ? '<em>Fast-tracked</em>' : ''}</li>`).join('');
      steps.hidden = false;
      const note = $('.cd-note', sec);
      if (note) {
        note.hidden = !rushedAny;
        note.textContent = rushedAny ? `Only ${lead} ${lead === 1 ? 'day' : 'days'} to go? That’s fine. We fast-track the tasting and menu for short-notice weddings, so call us today.` : '';
      }
    };
    input.addEventListener('change', show);
    const saved = store.get('date', null); if (saved) { input.value = saved; show(); }
  });
  // carry the date into the enquiry form
  const formDate = $('#enquiry input[name=date]'), savedDate = store.get('date', null);
  if (formDate && savedDate && !formDate.value) formDate.value = savedDate;

  /* =========================================================
     SCROLL STAGES: hero into an arch, candle words, gold spine
     ========================================================= */
  const hx = $('.hx'), spine = $('.spine');
  const candle = $('[data-candle]');
  let words = [];
  if (candle) {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const s = document.createElement('span'); s.className = 'cw'; s.textContent = w; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(candle); words = $$('.cw', candle);
  }
  let lastY = -1, lastW = 0;
  const frame = () => {
    if (scrollY !== lastY || innerWidth !== lastW) {
      lastY = scrollY; lastW = innerWidth; const vh = innerHeight;
      if (hx) { const r = hx.getBoundingClientRect(); hx.style.setProperty('--p', reduce ? 0 : clamp(-r.top / (r.height - vh)).toFixed(4)); }
      if (words.length) {
        const r = candle.getBoundingClientRect(), p = reduce ? 1 : clamp((vh * .9 - r.top) / (vh * .55 + r.height));
        words.forEach((w, i) => { const l = clamp(p * words.length * 1.2 - i); w.style.setProperty('--l', l.toFixed(2)); w.classList.toggle('lit', l >= 1); });
      }
      if (spine) spine.style.setProperty('--sp', clamp(scrollY / (document.documentElement.scrollHeight - vh)).toFixed(4));
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // numbers count up when they come into view
  const nio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; nio.unobserve(e.target);
    const raw = e.target.textContent, n = parseFloat(raw.replace(/,/g, '')), suffix = raw.replace(/[\d,.]/g, '');
    if (!isNaN(n) && n > 1) { tweens.set(e.target, 0); countTo(e.target, n, (v) => Math.round(v).toLocaleString('en-GB') + suffix); }
  }), { threshold: .6 });
  $$('.stats b, .hero-foot b').forEach((b) => nio.observe(b));

  /* =========================================================
     AMBIENT: a diya glow follows the cursor; steam over the dish
     ========================================================= */
  const diya = $('.diya');
  if (diya && fine && !reduce) {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; diya.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => diya.classList.remove('on'));
    (function glow() { x += (tx - x) * .12; y += (ty - y) * .12; diya.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; requestAnimationFrame(glow); })();
  }
  const photo = $('.board-photo');
  if (photo && !reduce) {
    const cv = document.createElement('canvas'); cv.className = 'steam'; photo.appendChild(cv);
    const ctx = cv.getContext('2d'); let W = 0, H = 0, visible = false;
    const size = () => { const r = photo.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = cv.width = r.width * d; H = cv.height = r.height * d; };
    size(); addEventListener('resize', size);
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(photo);
    const puffs = Array.from({ length: 16 }, (_, i) => ({ t: Math.random(), x: .3 + Math.random() * .4, s: .7 + Math.random() * .6, ph: Math.random() * 6.28, sp: .0012 + Math.random() * .0012, i }));
    (function steam() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        puffs.forEach((p) => {
          p.t += p.sp; if (p.t > 1) { p.t = 0; p.x = .3 + Math.random() * .4; }
          const y = H * (.78 - p.t * .7), x = W * p.x + Math.sin(p.t * 6 + p.ph) * W * .06, r = W * .09 * p.s * (.6 + p.t);
          const a = Math.sin(p.t * Math.PI) * .09;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,248,235,${a})`); g.addColorStop(1, 'rgba(255,248,235,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        });
      }
      requestAnimationFrame(steam);
    })();
  }
})();

/* =========================================================
   3D MENU BOOKLET: tap, swipe or arrow keys to turn pages
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.bk-sec').forEach((sec) => {
    const book = $('.book', sec), leaves = $$('.leaf', book), n = leaves.length;
    const labels = JSON.parse(book.dataset.labels), at = $('.bk-at', sec), prevB = $('.bk-prev', sec), nextB = $('.bk-next', sec);
    let cur = 0;
    const z = (i) => (i < cur ? i + 1 : n - i);
    const set = (k) => {
      k = Math.max(0, Math.min(n, k)); if (k === cur) return;
      const prev = cur; cur = k;
      leaves.forEach((l, i) => {
        const f = i < k; l.classList.toggle('flipped', f);
        if ((i < prev) !== f && !reduce) { l.style.zIndex = n + 5; setTimeout(() => { l.style.zIndex = z(i); }, 1150); } else l.style.zIndex = z(i);
      });
      book.dataset.state = k === 0 ? 'closed' : k === n ? 'end' : 'open';
      at.textContent = labels[k]; buttons();
    };
    /* phones: one page at a time. Views run cover, then left and right page of each spread, then the back cover. */
    const phone = matchMedia('(max-width: 700px)');
    let v = 0;
    const show = (nv) => {
      v = Math.max(0, Math.min(2 * n - 1, nv));
      const k = v === 0 ? 0 : Math.ceil(v / 2);
      book.dataset.side = v === 0 || v % 2 === 0 ? 'R' : 'L';
      if (k !== cur) set(k); else buttons();
    };
    function buttons() {
      if (phone.matches) { prevB.disabled = v === 0; nextB.disabled = v === 2 * n - 1; }
      else { prevB.disabled = cur === 0; nextB.disabled = cur === n; }
    }
    const step = (d) => (phone.matches ? show(v + d) : set(cur + d));
    phone.addEventListener('change', () => { if (phone.matches) show(cur === 0 ? 0 : 2 * cur - 1); else { delete book.dataset.side; buttons(); } });
    if (phone.matches) book.dataset.side = 'R';
    prevB.addEventListener('click', () => step(-1));
    nextB.addEventListener('click', () => step(1));
    let sx = null, swiped = false;
    book.addEventListener('pointerdown', (e) => { sx = e.clientX; swiped = false; });
    book.addEventListener('pointerup', (e) => {
      if (sx === null) return; const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 45) { swiped = true; step(dx < 0 ? 1 : -1); }
    });
    book.addEventListener('click', (e) => {
      if (swiped || e.target.closest('a,button')) return;
      if (phone.matches) { const r = book.parentElement.getBoundingClientRect(); step(e.clientX < r.left + r.width / 3 ? -1 : 1); return; }
      const leaf = e.target.closest('.leaf'); if (!leaf) return;
      set(leaf.classList.contains('flipped') ? cur - 1 : cur + 1);
    });
    book.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    // the book lies tilted, settles flat as it comes into view, then the cover opens
    if (!reduce) {
      book.classList.add('pre');
      new IntersectionObserver((es, o) => es.forEach((e) => {
        if (!e.isIntersecting) return; o.disconnect();
        book.classList.remove('pre'); setTimeout(() => { if (cur === 0) step(1); }, 1000);
      }), { threshold: .5 }).observe(book);
    }
    $$('.bk-filter button', sec).forEach((b) => b.addEventListener('click', () => {
      $$('.bk-filter button', sec).forEach((x) => x.setAttribute('aria-pressed', x === b));
      $$('.bdish', sec).forEach((d) => d.classList.toggle('dim', b.dataset.f !== 'all' && !d.dataset.diet.split(' ').includes(b.dataset.f)));
    }));
  });
})();

/* =========================================================
   ABOUT: photos deal in and tilt towards the pointer; promise cards hang on pins and swing
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // How we work: the photos fan out from a stack when the section arrives
  document.querySelectorAll('.team.deal').forEach((t) => {
    if (reduce) { t.classList.add('in'); return; }
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { t.classList.add('in'); o.disconnect(); } }), { threshold: 0.25 }).observe(t);
    if (!fine) return;
    t.querySelectorAll('.arch').forEach((a) => {
      a.addEventListener('pointermove', (e) => {
        const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        a.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg'); a.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        a.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); a.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); a.style.setProperty('--go', 1);
      });
      a.addEventListener('pointerleave', () => { ['--rx', '--ry'].forEach((v) => a.style.setProperty(v, '0deg')); a.style.setProperty('--go', 0); });
    });
  });

  // Three promises: each card hangs from its pin like a pendulum
  document.querySelectorAll('[data-pins]').forEach((board) => {
    const cards = [...board.querySelectorAll('.pin-card')];
    const S = cards.map((c) => ({ c, rest: +getComputedStyle(c).getPropertyValue('--r') || 0, a: 0, v: 0, drop: 1, hover: false, drag: null }));
    if (reduce) { S.forEach((s) => { s.c.style.transform = `rotate(${s.rest}deg)`; s.c.classList.add('in'); }); return; }
    let raf = 0, last = 0;
    const tick = (t) => {
      const dt = Math.min(0.032, (t - (last || t)) / 1000) || 0.016; last = t;
      let moving = false;
      S.forEach((s) => {
        const target = s.drag !== null ? s.drag : s.hover ? 0 : s.rest;
        const k = s.drag !== null ? 160 : 38, damp = s.drag !== null ? 16 : 2.6;   // a loose pin: it swings a few times, then settles
        s.v += (-k * (s.a - target) - damp * s.v) * dt; s.a += s.v * dt;
        s.drop += (0 - s.drop) * Math.min(1, dt * 7);
        s.c.style.transform = `translateY(${(s.drop * -110).toFixed(1)}vh) rotate(${s.a.toFixed(2)}deg) ${s.hover ? 'translateZ(0) scale(1.035)' : ''}`;
        if (Math.abs(s.v) > 0.02 || Math.abs(s.a - target) > 0.02 || s.drop > 0.001) moving = true;
      });
      raf = moving ? requestAnimationFrame(tick) : 0; if (!moving) last = 0;
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
    // they fall onto their pins one after another, arriving with a swing
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect();
      S.forEach((s, i) => setTimeout(() => { s.c.classList.add('in'); s.a = s.rest + (i % 2 ? -26 : 24); s.drop = 1; go(); }, 180 + i * 220));
    }), { threshold: 0.08 }).observe(board);
    S.forEach((s) => {
      s.c.style.transform = 'translateY(-110vh)';
      s.c.addEventListener('pointerenter', () => { if (fine) { s.hover = true; go(); } });
      s.c.addEventListener('pointerleave', () => { s.hover = false; s.drag = null; go(); });
      // brushing past a card gives it a push in the direction the pointer moves
      let px = null;
      s.c.addEventListener('pointermove', (e) => {
        if (s.drag !== null) {
          const r = s.c.getBoundingClientRect(), pinX = r.left + r.width / 2, pinY = r.top;
          s.drag = Math.max(-40, Math.min(40, Math.atan2(e.clientX - pinX, Math.max(40, e.clientY - pinY)) * -57.3 * 0.9)); go(); return;
        }
        if (px !== null && !s.hover) { s.v += (e.clientX - px) * 0.6; go(); }
        px = e.clientX;
      });
      s.c.addEventListener('pointerdown', (e) => { s.drag = s.a; s.c.setPointerCapture(e.pointerId); go(); });
      s.c.addEventListener('pointerup', () => { if (s.drag !== null) { s.v += (s.drag - s.rest) * -2; s.drag = null; go(); } });
      s.c.addEventListener('click', () => { if (!fine) { s.v += (Math.random() > 0.5 ? 1 : -1) * 90; go(); } });
      s.c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.v += 90; go(); } });
    });
  });
})();

/* =========================================================
   HOME: the gallery fan (cards fan out, the centre grows as you scroll) and the spotlit step cards
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-hg]').forEach((row) => {
    if (reduce) { row.classList.add('in'); return; }
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { row.classList.add('in'); o.disconnect(); } }), { threshold: 0.2 }).observe(row);
    let raf = 0;
    const upd = () => {
      raf = 0; const r = row.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const g = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (vh * 0.9)));
      row.style.setProperty('--g', g.toFixed(3));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd();
  });
  // one ceiling lamp: its beam swings to follow the pointer and lights the cards it falls on
  document.querySelectorAll('[data-lamp]').forEach((sec) => {
    const lamp = sec.querySelector('.lamp'), cone = sec.querySelector('.cone'), pool = sec.querySelector('.pool');
    const cards = [...sec.querySelectorAll('.pin-card')];
    let tx = 0, ty = 0, cx = 0, cy = 0, pointer = false, raf = 0, on = false, t0 = performance.now(), tapAt = 0;
    const origin = () => { const r = sec.getBoundingClientRect(), l = lamp.getBoundingClientRect(); return [l.left - r.left, l.top - r.top, r]; };
    const idle = (t) => {                                      // no pointer: the light drifts slowly from card to card
      const [, , r] = origin(), k = (Math.sin((t - t0) / 2600) + 1) / 2;
      const a = cards[0].getBoundingClientRect(), z = cards[cards.length - 1].getBoundingClientRect();
      tx = (a.left + a.width / 2 - r.left) + k * ((z.left + z.width / 2) - (a.left + a.width / 2));
      ty = (a.top + a.height * 0.5 - r.top) + k * (z.top - a.top);
    };
    const frame = (t) => {
      raf = 0; if (!on) return;
      if (!pointer && !reduce && t - tapAt > 2500) idle(t);
      cx += (tx - cx) * 0.055; cy += (ty - cy) * 0.055;
      const [lx, ly, r] = origin(), dx = cx - lx, dy = Math.max(40, cy - ly), len = Math.hypot(dx, dy) + 160;
      cone.style.height = len + 'px'; cone.style.width = len * 0.62 + 'px';
      cone.style.rotate = (-Math.atan2(dx, dy) * 57.2958).toFixed(2) + 'deg';
      pool.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      cards.forEach((c) => {
        const b = c.getBoundingClientRect(), d = Math.hypot(b.left + b.width / 2 - r.left - cx, b.top + b.height / 2 - r.top - cy);
        c.style.setProperty('--lit', Math.max(0, 1 - d / Math.max(r.width * 0.32, b.height * 0.9)).toFixed(3));
      });
      raf = requestAnimationFrame(frame);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
    sec.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = sec.getBoundingClientRect(); pointer = true; tx = e.clientX - r.left; ty = e.clientY - r.top; go(); });
    sec.addEventListener('pointerleave', () => { pointer = false; });
    cards.forEach((c) => c.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; const r = sec.getBoundingClientRect(), b = c.getBoundingClientRect(); tx = b.left + b.width / 2 - r.left; ty = b.top + b.height * 0.45 - r.top; tapAt = performance.now(); go(); }));
    new IntersectionObserver((es) => es.forEach((e) => { on = e.isIntersecting; if (on) { if (!cx) { const [lx, ly] = origin(); cx = lx; cy = ly + 300; } idle(performance.now()); go(); } }), { rootMargin: '100px' }).observe(sec);
  });
})();

/* =========================================================
   ABOUT: progress timeline. Steps slide in, the step in view is active (glow + ripple),
   the connectors fill in gold up to it, and hover reveals each description.
   ========================================================= */
(() => {
  document.querySelectorAll('[data-ptl]').forEach((tl) => {
    const steps = [...tl.querySelectorAll('.ptl-step')];
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { tl.classList.add('in'); o.disconnect(); } }), { threshold: 0.2 }).observe(tl);
    let raf = 0;
    const set = (k) => steps.forEach((s, i) => { s.classList.toggle('active', i === k); s.classList.toggle('done', i < k); s.style.setProperty('--f', i < k ? 1 : 0); });
    const upd = () => {
      raf = 0; const r = tl.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      // progress through the section as it rises from the lower third to the upper third of the screen
      const p = Math.min(1, Math.max(0, (vh * 0.78 - r.top) / (vh * 0.62)));
      set(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd();
    steps.forEach((s, i) => { s.addEventListener('mouseenter', () => set(i)); s.addEventListener('focus', () => set(i)); });
  });
})();

/* =========================================================
   PAGE TRANSITION: a wine curtain with the emblem covers the page on leaving and lifts on arrival
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pt = document.createElement('div'); pt.className = 'pt'; pt.setAttribute('aria-hidden', 'true'); document.body.appendChild(pt);
  let arriving = false; try { arriving = sessionStorage.getItem('apna-pt') === '1'; sessionStorage.removeItem('apna-pt'); } catch (e) { /* private mode */ }
  if (arriving && !document.querySelector('.ld')) {
    pt.style.transition = 'none'; pt.classList.add('cover'); void pt.offsetWidth; pt.style.transition = '';
    requestAnimationFrame(() => setTimeout(() => { pt.classList.add('leave'); setTimeout(() => pt.classList.remove('cover', 'leave'), 700); }, 120));
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || /^(mailto|tel):/.test(a.href)) return;
    e.preventDefault();
    try { sessionStorage.setItem('apna-pt', '1'); } catch (er) { /* private mode */ }
    pt.classList.remove('leave'); pt.classList.add('cover');
    setTimeout(() => { location.href = url.href; }, reduce ? 150 : 520);
  });
  // coming back with the browser's back button: never leave the curtain down
  addEventListener('pageshow', (e) => { if (e.persisted) pt.classList.remove('cover', 'leave'); });
})();
