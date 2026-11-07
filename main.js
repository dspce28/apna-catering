(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // Intro
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('loaded'), 80));
  $('#yr').textContent = new Date().getFullYear();

  // Nav, progress, mobile bar, parallax
  const nav = $('.nav'), bar = $('.progress'), mbar = $('.mobile-bar');
  const par = $$('.parallax');
  const spices = $$('.spice, .dish'), ghosts = $$('.ghost-word');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    mbar.classList.toggle('show', y > innerHeight * 0.6);
    if (!reduce) par.forEach(el => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed);
      el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    });
    if (!reduce) spices.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const d = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0,${(d * parseFloat(el.dataset.speed)).toFixed(1)}px,0) rotate(${(d / innerHeight * parseFloat(el.dataset.rot)).toFixed(1)}deg)`;
    });
    if (!reduce) ghosts.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = `translate3d(${((r.top - innerHeight / 2) * parseFloat(el.dataset.drift)).toFixed(1)}px,0,0)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Burger drawer
  const burger = $('.burger'), drawer = $('.drawer');
  const setDrawer = open => {
    burger.setAttribute('aria-expanded', open);
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  // Reveal on scroll + counters
  const countUp = el => {
    const to = +el.dataset.to, from = +(el.dataset.from || 0), t0 = performance.now(), dur = 1800;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduce) el.textContent = to; else requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('.count', e.target).concat(e.target.classList.contains('count') ? [e.target] : []).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal-up').filter(el => !el.closest('.hero')).forEach(el => io.observe(el));
  // a clipped element never reports as visible, so watch each card's (unclipped) parent instead
  const revealParents = new Set($$('.img-reveal').map(el => el.parentElement));
  const io2 = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$(':scope > .img-reveal', e.target).forEach(el => el.classList.add('in'));
    io2.unobserve(e.target);
  }), { threshold: 0.08 });
  revealParents.forEach(p => (reduce ? $$(':scope > .img-reveal', p).forEach(el => el.classList.add('in')) : io2.observe(p)));

  // Tabs
  const tabs = $$('.tabs [role=tab]'), ink = $('.tab-ink');
  const moveInk = btn => { ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft}px)`; };
  const selectTab = btn => {
    tabs.forEach(t => t.setAttribute('aria-selected', t === btn));
    $$('.panel').forEach(p => {
      const on = p.dataset.panel === btn.dataset.tab;
      p.hidden = !on; p.classList.toggle('active', on);
    });
    moveInk(btn);
  };
  tabs.forEach(t => t.addEventListener('click', () => selectTab(t)));
  $('.tabs').addEventListener('keydown', e => {
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(n); n.focus();
    }
  });
  const initInk = () => moveInk($('.tabs [aria-selected=true]'));
  addEventListener('resize', initInk); document.fonts?.ready.then(initInk); initInk();

  // Menu builder
  const list = $('.summary-list'), countEl = $('.summary-count b'), meter = $('.meter span');
  const picks = () => $$('.chips').flatMap(c => $$('button.on', c).map(b => ({ course: c.dataset.course, dish: b.textContent })));
  const render = () => {
    const p = picks();
    list.innerHTML = p.length ? p.map(x => `<li><span>${x.dish}</span><small>${x.course}</small></li>`).join('') : '<li class="empty">Tap a dish to begin…</li>';
    countEl.textContent = p.length;
    meter.style.width = Math.min(100, p.length / 13 * 100) + '%';
  };
  $$('.chips').forEach(group => group.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (!b.classList.contains('on') && $$('button.on', group).length >= +group.dataset.max) {
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return;
    }
    b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); render();
  }));
  $$('.chips button').forEach(b => b.setAttribute('aria-pressed', 'false'));
  const gr = $('#guests'), go = $('#guestsOut');
  gr.addEventListener('input', () => { go.textContent = gr.value + (gr.value === gr.max ? '+' : ''); });

  // Testimonials
  const quotes = $$('.quote'), dots = $$('.quote-dots button');
  let qi = 0, qt;
  const showQ = i => { qi = i; quotes.forEach((q, k) => q.classList.toggle('active', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  const autoQ = () => { clearInterval(qt); if (!reduce) qt = setInterval(() => showQ((qi + 1) % quotes.length), 6500); };
  dots.forEach((d, i) => d.addEventListener('click', () => { showQ(i); autoQ(); }));
  autoQ();

  // Lightbox
  const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.innerHTML = '<button aria-label="Close">×</button><img alt="">';
  document.body.appendChild(lb);
  const closeLb = () => lb.classList.remove('open');
  $$('.g').forEach(g => g.addEventListener('click', () => {
    const i = $('img', g); $("img", lb).src = (i.getAttribute("src") || "").replace(/\.webp$/, "-3840.webp"); $('img', lb).alt = i.alt; lb.classList.add('open');
  }));
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); setDrawer(false); } });

  // Drag-to-scroll experiences
  const hs = $('.hscroll'); let down = false, sx = 0, sl = 0, moved = false;
  hs.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = hs.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; hs.classList.add('drag'); } hs.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { down = false; hs.classList.remove('drag'); });

  // Magnetic buttons + cursor glow
  if (fine && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    const c = document.createElement('div'); c.className = 'cursor'; document.body.appendChild(c);
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  }

  // Enquiry wizard
  const form = $('.wizard'), steps = $$('.wiz-step', form), prev = $('[data-prev]', form), next = $('[data-next]', form);
  const err = $('.wiz-error', form), label = $('.wiz-step-label b', form), pbar = $('.wiz-bar span', form);
  let cur = 0;
  const go2 = i => {
    cur = i;
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    label.textContent = i + 1; pbar.style.width = ((i + 1) / steps.length * 100) + '%';
    prev.disabled = i === 0; next.innerHTML = i === steps.length - 1 ? 'Prepare enquiry ✦' : 'Continue →';
    err.textContent = '';
    if (i === 2) { const n = picks().length; const m = $('.menu-attach', form); m.hidden = !n; $('b', m).textContent = n; }
  };
  const validate = () => {
    const s = steps[cur];
    if (cur === 0 && !$('input[name=occasion]:checked', form)) return 'Please choose an occasion.';
    for (const el of $$('input[required]', s)) {
      if (!el.value.trim()) { el.focus(); return 'Please complete the highlighted field.'; }
      if (!el.checkValidity()) { el.focus(); return 'Please check this field.'; }
    }
    return '';
  };
  const buildMessage = () => {
    const f = new FormData(form), p = picks();
    const lines = [
      'New enquiry: Apna Catering',
      `Occasion: ${f.get('occasion')}`,
      `Date: ${f.get('date')}`,
      `Guests: ${f.get('guests')}`,
      f.get('venue') && `Venue: ${f.get('venue')}`,
      f.get('notes') && `Notes: ${f.get('notes')}`,
      p.length && `Menu wishlist: ${p.map(x => x.dish).join(', ')}`,
      `Name: ${f.get('name')}`, `Phone: ${f.get('phone')}`,
      f.get('email') && `Email: ${f.get('email')}`
    ].filter(Boolean);
    return lines.join('\n');
  };
  next.addEventListener('click', () => {
    const m = validate(); if (m) { err.textContent = m; return; }
    if (cur < steps.length - 1) return go2(cur + 1);
    const msg = buildMessage();
    $('#sendWa').href = 'https://wa.me/447818478036?text=' + encodeURIComponent(msg);
    $('#sendMail').href = 'mailto:hello@apnacatering.co.uk?subject=' + encodeURIComponent('Event enquiry') + '&body=' + encodeURIComponent(msg);
    steps.forEach(s => s.classList.remove('active'));
    $('.wiz-nav', form).hidden = true; $('.wiz-step-label', form).hidden = true; err.textContent = '';
    pbar.style.width = '100%'; $('.wiz-done', form).hidden = false;
  });
  prev.addEventListener('click', () => cur > 0 && go2(cur - 1));
  $$('input[name=occasion]', form).forEach(r => r.addEventListener('change', () => setTimeout(() => go2(1), 280)));
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next.click(); } });
  form.addEventListener('submit', e => e.preventDefault());

  // Deep links that preselect an occasion
  $$('[data-occasion]').forEach(a => a.addEventListener('click', () => {
    const r = $(`input[name=occasion][value="${a.dataset.occasion}"]`, form); if (r) { r.checked = true; go2(1); }
  }));
  $('#useMenu').addEventListener('click', () => { if (cur === 0 && $('input[name=occasion]:checked', form)) go2(1); });
})();
