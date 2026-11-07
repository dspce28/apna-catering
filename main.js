(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem('apna-' + k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem('apna-' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  /* ---------- Curtain loader & page transitions ---------- */
  const curtain = $('.curtain');
  const firstVisit = !store.get('seen');
  const openCurtain = () => {
    if (!curtain) { document.body.classList.add('loaded'); return; }
    curtain.classList.remove('is-closed', 'closing');
    curtain.classList.add('opening');
    setTimeout(() => document.body.classList.add('loaded'), reduce ? 0 : 250);
    setTimeout(() => curtain.classList.add('gone'), reduce ? 0 : 1500);
  };
  const runLoader = () => {
    if (!curtain || reduce) { store.set('seen', true); openCurtain(); return; }
    if (!firstVisit) { curtain.classList.add('quick'); setTimeout(openCurtain, 380); return; }
    store.set('seen', true);
    curtain.classList.add('intro');
    const count = $('.curtain-count', curtain), diyas = $$('.diya', curtain);
    const t0 = performance.now(), dur = 2200;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      if (count) count.textContent = Math.round(e * 100);
      diyas.forEach((d, i) => d.classList.toggle('lit', p > 0.22 + i * 0.24));
      if (p < 1) requestAnimationFrame(tick); else setTimeout(openCurtain, 420);
    };
    requestAnimationFrame(tick);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runLoader); else runLoader();
  addEventListener('pageshow', (e) => { if (e.persisted) openCurtain(); });

  // close the curtain before moving to another page of the site
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !curtain || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // same page anchor
    e.preventDefault();
    curtain.classList.remove('gone', 'opening', 'intro');
    curtain.classList.add('quick', 'closing');
    setTimeout(() => { location.href = url.href; }, 720);
  });

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Split headings into words/letters for reveals ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = cls; s.innerHTML = `<span>${w}</span>`; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    $$('.' + cls, el).forEach((s, i) => s.style.setProperty('--w', i));
  };
  $$('[data-words]').forEach((el) => splitWords(el, 'wrd'));
  $$('[data-split]').forEach((el) => splitWords(el, 'wrd'));

  /* ---------- Scroll: nav, progress, parallax layers ---------- */
  const nav = $('.nav'), bar = $('.progress'), mbar = $('.mobile-bar');
  const par = $$('.parallax');
  const spices = $$('.spice, .dish'), ghosts = $$('.ghost-word');
  const phMedia = $('.ph-media'), ctaMedia = $$('.cta-media');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav?.classList.toggle('scrolled', y > 40);
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    mbar?.classList.toggle('show', y > innerHeight * 0.6);
    if (!reduce) {
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate3d(0,${((r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed)).toFixed(1)}px,0)`;
      });
      spices.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const d = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0,${(d * parseFloat(el.dataset.speed)).toFixed(1)}px,0) rotate(${(d / innerHeight * parseFloat(el.dataset.rot)).toFixed(1)}deg)`;
      });
      ghosts.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = `translate3d(${((r.top - innerHeight / 2) * parseFloat(el.dataset.drift)).toFixed(1)}px,0,0)`;
      });
      if (phMedia && y < innerHeight * 1.2) phMedia.style.transform = `translate3d(0,${(y * 0.35).toFixed(1)}px,0) scale(${1.08 + y / innerHeight * 0.06})`;
      ctaMedia.forEach((m) => {
        const r = m.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        m.style.transform = `translate3d(0,${((r.top - innerHeight / 2) * -0.18).toFixed(1)}px,0) scale(1.15)`;
      });
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Hidden filigree: a lamp that reveals gold jali around the pointer ---------- */
  $$('.hero, .page-hero').forEach((zone) => {
    const set = (x, y) => { zone.style.setProperty('--mx', x + 'px'); zone.style.setProperty('--my', y + 'px'); };
    let touched = false, t0 = performance.now(), raf = 0;
    const drift = (t) => {
      if (touched || reduce) return;
      const r = zone.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const s = (t - t0) / 1000;
        set(r.width * (0.5 + Math.sin(s * 0.45) * 0.36), r.height * (0.48 + Math.sin(s * 0.9) * 0.28));
      }
      raf = requestAnimationFrame(drift);
    };
    raf = requestAnimationFrame(drift);
    const move = (cx, cy) => {
      const r = zone.getBoundingClientRect();
      touched = true; cancelAnimationFrame(raf);
      zone.classList.add('lamp-on');
      set(cx - r.left, cy - r.top);
    };
    zone.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
    zone.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    zone.addEventListener('pointerleave', () => { touched = false; t0 = performance.now(); raf = requestAnimationFrame(drift); });
  });

  /* ---------- Hero: slideshow, pointer depth, copy lift ---------- */
  const slides = $$('.arch img.slide'), caps = $$('.arch-caps span'), capNo = $('.arch-cap b'), capBar = $('.arch-bar');
  let si = 0;
  const showSlide = (i) => {
    si = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    caps.forEach((c, k) => c.classList.toggle('on', k === i));
    if (capNo) capNo.textContent = String(i + 1).padStart(2, '0');
    if (capBar) { capBar.classList.remove('run'); void capBar.offsetWidth; if (!reduce) capBar.classList.add('run'); }
  };
  if (slides.length) { showSlide(0); if (!reduce) setInterval(() => showSlide((si + 1) % slides.length), 5500); }

  const hero = $('.hero'), heroCopy = $('.hero-copy'), depthEls = $$('.hero [data-depth]');
  if (hero && !reduce && fine) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
      depthEls.forEach((el) => { const d = parseFloat(el.dataset.depth); el.style.translate = `${(-mx * 34 * d).toFixed(1)}px ${(-my * 26 * d).toFixed(1)}px`; });
    });
    hero.addEventListener('pointerleave', () => depthEls.forEach((el) => { el.style.translate = '0 0'; }));
  }
  if (hero && heroCopy && !reduce) {
    addEventListener('scroll', () => {
      const y = Math.min(scrollY, innerHeight);
      heroCopy.style.translate = `0 ${(y * 0.22).toFixed(1)}px`;
      heroCopy.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.85)));
    }, { passive: true });
  }

  /* ---------- Drawer ---------- */
  const burger = $('.burger'), drawer = $('.drawer');
  const setDrawer = (open) => {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', open);
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  if (drawer) $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));

  /* ---------- Reveal on scroll + counters ---------- */
  const countUp = (el) => {
    const to = +el.dataset.to, from = +(el.dataset.from || 0), t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduce) el.textContent = to; else requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('.count', e.target).concat(e.target.classList.contains('count') ? [e.target] : []).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal-up, [data-words]').filter((el) => !el.closest('.hero')).forEach((el) => io.observe(el));
  const revealParents = new Set($$('.img-reveal').map((el) => el.parentElement));
  const io2 = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    $$(':scope > .img-reveal', e.target).forEach((el) => el.classList.add('in'));
    io2.unobserve(e.target);
  }), { threshold: 0.08 });
  revealParents.forEach((p) => (reduce ? $$(':scope > .img-reveal', p).forEach((el) => el.classList.add('in')) : io2.observe(p)));

  /* ---------- Tabs ---------- */
  const tabs = $$('.tabs [role=tab]'), ink = $('.tab-ink');
  if (tabs.length && ink) {
    const moveInk = (btn) => { ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft}px)`; };
    const selectTab = (btn) => {
      tabs.forEach((t) => t.setAttribute('aria-selected', t === btn));
      $$('.panel').forEach((p) => { const on = p.dataset.panel === btn.dataset.tab; p.hidden = !on; p.classList.toggle('active', on); });
      moveInk(btn);
    };
    tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
    $('.tabs').addEventListener('keydown', (e) => {
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(n); n.focus();
      }
    });
    const initInk = () => moveInk($('.tabs [aria-selected=true]'));
    addEventListener('resize', initInk); document.fonts?.ready.then(initInk); initInk();
  }

  /* ---------- Menu builder (selection travels to the contact page) ---------- */
  const chipGroups = $$('.chips');
  const domPicks = () => chipGroups.flatMap((c) => $$('button.on', c).map((b) => ({ course: c.dataset.course, dish: b.textContent })));
  const picks = () => (chipGroups.length ? domPicks() : (store.get('picks') || []));
  if (chipGroups.length) {
    const list = $('.summary-list'), countEl = $('.summary-count b'), meter = $('.meter span');
    const saved = store.get('picks') || [];
    chipGroups.forEach((g) => $$('button', g).forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
      if (saved.some((p) => p.dish === b.textContent && p.course === g.dataset.course)) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
    }));
    const render = () => {
      const p = domPicks();
      store.set('picks', p);
      if (list) list.innerHTML = p.length ? p.map((x) => `<li><span>${x.dish}</span><small>${x.course}</small></li>`).join('') : '<li class="empty">Tap a dish to begin…</li>';
      if (countEl) countEl.textContent = p.length;
      if (meter) meter.style.width = Math.min(100, p.length / 13 * 100) + '%';
    };
    chipGroups.forEach((group) => group.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (!b.classList.contains('on') && $$('button.on', group).length >= +group.dataset.max) {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return;
      }
      b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); render();
    }));
    render();
    const gr = $('#guests'), go = $('#guestsOut');
    if (gr && go) {
      const g = store.get('guests'); if (g) { gr.value = g; go.textContent = g; }
      gr.addEventListener('input', () => { go.textContent = gr.value + (gr.value === gr.max ? '+' : ''); store.set('guests', gr.value); });
    }
  }

  /* ---------- Testimonials ---------- */
  const quotes = $$('.quote'), dots = $$('.quote-dots button');
  if (quotes.length) {
    let qi = 0, qt;
    const showQ = (i) => { qi = i; quotes.forEach((q, k) => q.classList.toggle('active', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    const autoQ = () => { clearInterval(qt); if (!reduce) qt = setInterval(() => showQ((qi + 1) % quotes.length), 6500); };
    dots.forEach((d, i) => d.addEventListener('click', () => { showQ(i); autoQ(); }));
    autoQ();
  }

  /* ---------- Lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.innerHTML = '<button aria-label="Close">×</button><img alt="">';
  document.body.appendChild(lb);
  const closeLb = () => lb.classList.remove('open');
  $$('.g').forEach((g) => g.addEventListener('click', () => {
    const i = $('img', g); $('img', lb).src = (i.getAttribute('src') || '').replace(/\.webp$/, '-3840.webp'); $('img', lb).alt = i.alt; lb.classList.add('open');
  }));
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLb(); setDrawer(false); } });

  /* ---------- Drag-to-scroll services ---------- */
  const hs = $('.hscroll');
  if (hs) {
    let down = false, sx = 0, sl = 0;
    hs.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = hs.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) hs.classList.add('drag'); hs.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; hs.classList.remove('drag'); });
  }

  /* ---------- Magnetic buttons, cursor glow, card tilt ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('.why-card, .mcard, .ccard').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`); c.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
        c.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`); c.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
    const cur = document.createElement('div'); cur.className = 'cursor'; document.body.appendChild(cur);
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  }

  /* ---------- Occasion cards remember the choice for the contact page ---------- */
  $$('[data-occasion]').forEach((a) => a.addEventListener('click', () => store.set('occasion', a.dataset.occasion)));

  /* ---------- Enquiry wizard (contact page) ---------- */
  const form = $('.wizard');
  if (form) {
    const steps = $$('.wiz-step', form), prev = $('[data-prev]', form), next = $('[data-next]', form);
    const err = $('.wiz-error', form), label = $('.wiz-step-label b', form), pbar = $('.wiz-bar span', form);
    let cur = 0;
    const go2 = (i) => {
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
      return [
        'New enquiry: Apna Catering',
        `Occasion: ${f.get('occasion')}`, `Date: ${f.get('date')}`, `Guests: ${f.get('guests')}`,
        f.get('venue') && `Venue: ${f.get('venue')}`, f.get('notes') && `Notes: ${f.get('notes')}`,
        p.length && `Menu wishlist: ${p.map((x) => x.dish).join(', ')}`,
        `Name: ${f.get('name')}`, `Phone: ${f.get('phone')}`, f.get('email') && `Email: ${f.get('email')}`,
      ].filter(Boolean).join('\n');
    };
    next.addEventListener('click', () => {
      const m = validate(); if (m) { err.textContent = m; return; }
      if (cur < steps.length - 1) return go2(cur + 1);
      const msg = buildMessage();
      $('#sendWa').href = 'https://wa.me/447818478036?text=' + encodeURIComponent(msg);
      $('#sendMail').href = 'mailto:hello@apnacatering.co.uk?subject=' + encodeURIComponent('Event enquiry') + '&body=' + encodeURIComponent(msg);
      steps.forEach((s) => s.classList.remove('active'));
      $('.wiz-nav', form).hidden = true; $('.wiz-step-label', form).hidden = true; err.textContent = '';
      pbar.style.width = '100%'; $('.wiz-done', form).hidden = false;
    });
    prev.addEventListener('click', () => cur > 0 && go2(cur - 1));
    $$('input[name=occasion]', form).forEach((r) => r.addEventListener('change', () => { store.set('occasion', r.value); setTimeout(() => go2(1), 280); }));
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next.click(); } });
    form.addEventListener('submit', (e) => e.preventDefault());
    const g = store.get('guests'), gIn = $('input[name=guests]', form); if (g && gIn && !gIn.value) gIn.value = g;
    const occ = store.get('occasion');
    const r = occ && $(`input[name=occasion][value="${occ}"]`, form);
    if (r) { r.checked = true; go2(1); }
  }
})();
