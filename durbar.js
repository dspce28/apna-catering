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

  /* =========================================================
     PRICES: PLACEHOLDERS until the client supplies real figures.
     Per guest, per ceremony, buffet service. Plated adds 30%.
     ========================================================= */
  const PRICES = {
    roka: 18, mehndi: 22, haldi: 12, wedding: 14, reception: 28,
    platedUplift: 0.30, nonvegUplift: 0.12, jainUplift: 0.05,
    extras: { chaat: 4, tandoor: 6, dessert: 5, bar: 4 },   // per guest, once
    spread: [0.9, 1.25],                                     // shown as a range
  };
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
      let per = 0;
      cer.forEach((k) => { per += PRICES[k]; });
      per *= 1 + (style === 'plated' ? PRICES.platedUplift : 0) + (diet === 'nonveg' ? PRICES.nonvegUplift : 0) + (diet === 'jain' ? PRICES.jainUplift : 0);
      if (cer.length) ext.forEach((x) => { per += PRICES.extras[x]; });
      const lo = Math.round(per * guests * PRICES.spread[0] / 50) * 50, hi = Math.round(per * guests * PRICES.spread[1] / 50) * 50;
      const staff = cer.length ? Math.ceil(guests / (style === 'plated' ? 12 : 25)) : 0, chefs = cer.length ? Math.ceil(guests / 100) + 1 : 0;
      countTo($('.pl-staff', form), staff); countTo($('.pl-chefs', form), chefs); countTo($('.pl-count', form), guests * cer.length);
      const total = $('.pl-total', form);
      if (cer.length) {
        total.textContent = `${gbp(lo)} – ${gbp(hi)}`;
        $('.pl-per', form).textContent = `about ${gbp(lo / guests)} – ${gbp(hi / guests)} per guest across ${cer.length} ${cer.length === 1 ? 'event' : 'events'}`;
      } else { total.textContent = '—'; $('.pl-per', form).textContent = ''; }
      summary = [
        'Hello Apna Catering, here is the feast I planned on your website:', '',
        `Guests: ${guests}`, `Food: ${{ veg: 'Vegetarian', jain: 'Jain', nonveg: 'Veg and non-veg' }[diet]}`, `Service: ${style === 'plated' ? 'Plated' : 'Buffet'}`,
        ...cer.map((k) => `• ${CER[k].name}: ${CER[k].menu[diet]}`),
        ext.length ? `Extras: ${ext.map((x) => EXTRA_NAME[x]).join(', ')}` : '',
        cer.length ? `Indicative total shown: ${gbp(lo)} – ${gbp(hi)}` : '', '', 'Please let me know if my date is available.',
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
  const PLACES = {
    bowl: [[.155, .44, .135], [.236, .26, .135], [.402, .156, .135], [.598, .156, .135], [.759, .26, .135], [.839, .447, .135]],
    rice: [[.47, .55, .25]],
    bread: [[.71, .60, .27]],
    starter: [[.28, .67, .21], [.48, .835, .21]],
    sweet: [[.69, .83, .16]],
  };
  const KIND_NAME = { bowl: 'katori', rice: 'rice', bread: 'bread', starter: 'starter', sweet: 'sweet' };
  $$('.thali-sec').forEach((sec) => {
    const plate = $('.thali', sec), layer = $('.th-food', sec), toks = $$('.tok', sec), msg = $('.th-msg', sec), count = $('.th-count b', sec);
    const served = {}; Object.keys(PLACES).forEach((k) => { served[k] = PLACES[k].map(() => null); });
    const total = Object.values(PLACES).reduce((n, a) => n + a.length, 0);
    $('.th-count', sec).lastChild.textContent = ` of ${total} places served`;
    const all = () => Object.values(served).flat().filter(Boolean);
    const sync = () => {
      const on = new Set(all().map((d) => d.cut));
      toks.forEach((t) => t.classList.toggle('on', on.has(t.dataset.cut)));
      count.textContent = all().length;
      store.set('thali2', served);
    };
    const place = (kind, i, d, animateFrom) => {
      const [x, y, w] = PLACES[kind][i];
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'food ' + (kind === 'bowl' ? 'bowl' : 'plated'); el.dataset.kind = kind; el.dataset.i = i;
      el.style.left = x * 100 + '%'; el.style.top = y * 100 + '%'; el.style.width = w * 100 + '%';
      el.setAttribute('aria-label', d.name + ', tap to take it off');
      el.innerHTML = `<img src="img/cut/${d.cut}.webp" alt="">`;
      const old = $(`.food[data-kind="${kind}"][data-i="${i}"]`, layer); if (old) old.remove();
      el.addEventListener('click', () => {
        served[kind][i] = null; el.classList.add('leave'); setTimeout(() => el.remove(), 350);
        msg.textContent = `${d.name} taken off.`; sync();
      });
      if (!animateFrom || reduce) { layer.appendChild(el); return; }
      // fly from the counter to its place on the thali, as if served by hand
      el.style.visibility = 'hidden'; layer.appendChild(el);
      const to = el.getBoundingClientRect(), from = animateFrom.getBoundingClientRect();
      const fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = `<img src="img/cut/${d.cut}.webp" alt=""${kind === 'bowl' ? ' style="border-radius:50%"' : ''}>`;
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
      const d = { cut: tok.dataset.cut, name: tok.dataset.name }, kind = tok.dataset.kind, slots = served[kind];
      const here = slots.findIndex((x) => x && x.cut === d.cut);
      if (here >= 0) { msg.textContent = `${d.name} is already on your thali.`; return; }
      let i = slots.findIndex((x) => !x);
      if (i < 0) {
        if (kind === 'bowl') { msg.textContent = 'All six katoris are full. Tap one on the thali to empty it.'; return; }
        i = slots.length - 1; msg.textContent = `${slots[i].name} swapped for ${d.name}.`;
      } else msg.textContent = `${d.name} served.`;
      slots[i] = d; place(kind, i, d, fromEl || $('img', tok)); sync();
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
    const clear = () => { Object.keys(served).forEach((k) => served[k].fill(null)); layer.innerHTML = ''; sync(); };
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
    const saved = store.get('thali2', null);
    if (saved) Object.keys(PLACES).forEach((k) => (saved[k] || []).forEach((d, i) => { if (d && i < PLACES[k].length) { served[k][i] = d; place(k, i, d); } }));
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
      const ms = [['Book your tasting', 150], ['Confirm the menu', 75], ['Final guest numbers', 14], ['The big day', 0]];
      let nextSet = false;
      steps.innerHTML = ms.map(([t, d], i) => {
        const when = new Date(day - d * 864e5), done = when < today && d > 0;
        let cls = done ? 'done' : ''; if (!done && !nextSet) { cls = 'next'; nextSet = true; }
        return `<li class="${cls}" style="--i:${i}"><b>${t}</b>${done ? 'Overdue: let’s talk soon' : 'by'} <time>${fmtDate(when)}</time></li>`;
      }).join('');
      steps.hidden = false;
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
