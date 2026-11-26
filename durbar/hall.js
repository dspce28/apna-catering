/* Gallery hallway: scroll walks you down a candlelit corridor past photos on both walls,
   pausing at each one, to a lit doorway at the end; you step through into the last picture.
   Tap any photo to open it full screen. With reduced motion it is a plain grid. */
(() => {
  const sec = document.querySelector('.hall'); if (!sec) return;
  const $ = (s, r = sec) => r.querySelector(s), $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const view = $('.hall-view'), world = $('.hall-world'), cards = $$('.hall-card'), door = $('.hall-door'), end = $('.hall-end');
  const n = cards.length;
  if (reduce) { sec.classList.add('flat'); }

  /* ---------- the corridor, sized to the screen ---------- */
  let G = {};
  const layout = () => {
    const w = view.clientWidth, h = view.clientHeight, phone = w < 700;
    const hw = phone ? w * 0.62 : Math.min(w * 0.42, 760);       // half the corridor's width
    const hh = h * 0.5;                                          // half its height
    const cw = phone ? w * 0.5 : Math.min(w * 0.22, 380);        // card width
    const gap = phone ? cw * 1.5 : cw * 1.35;                    // distance between cards along the corridor
    const L = gap * (n + 1.6);                                   // length to the doorway
    const turn = phone ? 38 : 34;                                // how far each card turns towards you
    G = { w, h, hw, hh, cw, gap, L, turn, view: phone ? cw * 1.25 : cw * 1.5 };
    world.style.setProperty('--hw', hw + 'px'); world.style.setProperty('--hh', hh + 'px');
    world.style.setProperty('--L', L + 'px'); world.style.setProperty('--cw', cw + 'px');
    cards.forEach((c, i) => {
      const side = i % 2 ? 1 : -1, z = -(i + 1) * gap;
      c.dataset.z = z;
      c.style.transform = `translate3d(${side * (hw - cw * 0.55)}px, ${-cw * 0.1}px, ${z}px) rotateY(${-side * turn}deg)`;
    });
    door.style.transform = `translate3d(0,0,${-L}px)`;
  };

  /* ---------- the walk: the camera eases to a stop at every card ---------- */
  const stops = () => [0, ...cards.map((c) => -c.dataset.z - G.view), G.L + G.view * 0.2];
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);          // smootherstep: slow at each stop
  const camAt = (p) => {
    const s = stops(), seg = s.length - 1, x = Math.min(seg - 1e-6, Math.max(0, p * seg)), i = Math.floor(x);
    return s[i] + (s[i + 1] - s[i]) * ease(x - i);
  };
  let target = 0, cur = 0, mx = 0, my = 0, pmx = 0, pmy = 0, raf = 0, active = false;
  const progress = () => {
    const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
    return Math.min(1, Math.max(0, -r.top / total));
  };
  const frame = () => {
    raf = 0;
    cur += (target - cur) * 0.085; pmx += (mx - pmx) * 0.06; pmy += (my - pmy) * 0.06;
    const cam = camAt(cur), toDoor = G.L - cam;
    world.style.transform = `translateZ(${cam}px) rotateY(${pmx * 2.2}deg) rotateX(${-pmy * 1.6}deg)`;
    // depth of field and light: cards sharpen and brighten as you reach them
    cards.forEach((c) => {
      const d = -c.dataset.z - cam;                                   // distance ahead of the camera
      const blur = d < -G.view ? 0 : Math.min(7, Math.abs(d - G.view) / (G.gap * 0.55) * 2.2);
      const lit = Math.max(0.28, Math.min(1, 1.15 - Math.abs(d - G.view) / (G.gap * 2.4)));
      c.style.filter = `blur(${blur.toFixed(2)}px) brightness(${lit.toFixed(3)})`;
      c.style.opacity = d < -G.view * 0.4 ? Math.max(0, 1 + (d + G.view * 0.4) / (G.view * 0.6)) : 1;
    });
    // the doorway light grows as you approach; then you step into the picture
    const near = Math.max(0, Math.min(1, 1 - toDoor / (G.gap * 2.5)));
    sec.style.setProperty('--glow', near.toFixed(3));
    sec.style.setProperty('--walk', Math.min(1, cur * 9).toFixed(3));
    const through = Math.max(0, Math.min(1, (cam - (G.L - G.view * 0.5)) / (G.view * 0.7)));
    end.style.opacity = through.toFixed(3);
    end.classList.toggle('on', through > 0.6);
    if (Math.abs(target - cur) > 0.0004 || Math.abs(mx - pmx) > 0.002 || Math.abs(my - pmy) > 0.002) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  if (!reduce) {
    layout(); target = cur = progress(); frame();
    addEventListener('scroll', () => { if (!active) return; target = progress(); kick(); }, { passive: true });
    addEventListener('resize', () => { layout(); kick(); });
    new IntersectionObserver((es) => es.forEach((e) => { active = e.isIntersecting; if (active) { target = progress(); kick(); } }), { rootMargin: '200px' }).observe(sec);
    if (matchMedia('(pointer: fine)').matches) view.addEventListener('pointermove', (e) => {
      const r = view.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; kick();
    });
  }

  /* ---------- full-screen viewer ---------- */
  const box = $('.hall-box'), big = $('img', box), cap = $('.hall-box-cap', box);
  const items = [...cards, door].map((c) => ({ src: c.dataset.full, name: c.dataset.name }));
  let at = 0, lastFocus = null;
  const show = (i) => { at = (i + items.length) % items.length; big.src = items[at].src; big.alt = items[at].name; cap.textContent = items[at].name; };
  const open = (i) => { lastFocus = document.activeElement; show(i); box.hidden = false; requestAnimationFrame(() => box.classList.add('on')); $('.hall-x', box).focus(); document.documentElement.style.overflow = 'hidden'; };
  const close = () => { box.classList.remove('on'); setTimeout(() => { box.hidden = true; }, 350); document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
  [...cards, door].forEach((c, i) => c.addEventListener('click', () => open(i)));
  $('.hall-x', box).addEventListener('click', close);
  $('.hall-prev', box).addEventListener('click', () => show(at - 1));
  $('.hall-next', box).addEventListener('click', () => show(at + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1);
  });
  let sx = null;
  box.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  box.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1)); });
})();
