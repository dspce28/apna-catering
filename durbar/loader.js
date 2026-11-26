/* Loader: the emblem fills with colour from the bottom like a glass, the line and percentage follow the page's
   real image loading (smoothed), then the emblem flies into the navbar logo and the page appears.
   Once per session (or always, with data-always). Tap / scroll / key speeds it to the end. Never longer than ~3s.
   window.apnaLoader.play(slow, targetFn, docFn) replays it (used by the demo page). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navLogo = () => document.querySelector('.nav .brand img');
  const make = () => {
    const el = document.createElement('div'); el.className = 'ld'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'Loading Apna Catering');
    el.innerHTML = `<div class="ld-box"><div class="ld-brand"><div class="ld-mark"><i class="dim"></i><i class="fill"></i><i class="shine"></i></div>
      <div class="ld-name"><b>Apna</b><small>Catering · Est. 1995</small></div></div>
      <div class="ld-bar"><i></i></div><p class="ld-pc">Loading 0%</p></div>`;
    return el;
  };
  // the share of eager images that have finished loading (lazy, below-the-fold images are ignored)
  const realProgress = (doc) => {
    if (doc.readyState === 'complete') return 1;
    const imgs = [...doc.images].filter((i) => i.loading !== 'lazy');
    if (!imgs.length) return 0.5;
    return Math.min(0.95, imgs.filter((i) => i.complete).length / imgs.length);
  };
  const play = (slow, targetFn, docFn) => {
    document.querySelectorAll('.ld').forEach((e) => e.remove());
    const ls = slow ? 3 : 1, el = make(); el.style.setProperty('--ls', ls); document.body.appendChild(el);
    const fill = el.querySelector('.fill'), bar = el.querySelector('.ld-bar i'), pc = el.querySelector('.ld-pc'), mark = el.querySelector('.ld-mark');
    const getTarget = targetFn || navLogo, getDoc = docFn || (() => document);
    const hideNav = (on) => { const t = getTarget(); if (t) t.style.opacity = on ? '0' : ''; };
    hideNav(true);
    const t0 = performance.now(), MIN = 1500 * ls, MAX = 3000 * ls;
    let shown = reduce ? 1 : 0, done = false, skip = false;
    const end = () => { hideNav(false); el.classList.add('fade'); setTimeout(() => el.remove(), 700 * ls); };
    const finish = () => {
      el.querySelector('.shine').classList.add('go');
      setTimeout(() => {
        el.classList.add('fly');
        const tgt = getTarget(), a = mark.getBoundingClientRect();
        let b = tgt && tgt.getBoundingClientRect();
        if (b && targetFn && targetFn.offset) { const o = targetFn.offset(); b = { left: b.left + o.x, top: b.top + o.y, width: b.width, height: b.height }; }
        if (!b || !b.width || reduce) { end(); return; }
        const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = b.width / a.width;
        mark.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
          { duration: 750 * ls, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = end;
      }, 420 * ls);
    };
    const tick = (t) => {
      if (done) return;
      const time = Math.min(1, (t - t0) / MIN), real = realProgress(getDoc());
      const target = skip || t - t0 > MAX ? 1 : Math.min(time, Math.max(real, time * 0.9));
      shown += (target - shown) * (skip ? 0.35 : 0.09 / ls * 1.6); if (target === 1 && shown > 0.995) shown = 1;
      const p = shown, calm = 1 - p;
      const wave = (x) => (Math.sin(x * 6.3 + t / (170 * ls)) * 2.4 + Math.sin(x * 11 + t / (120 * ls)) * 1.1) * calm;
      const level = 100 - p * 104;   // a touch past the brim at 100%
      const pts = []; for (let k = 0; k <= 24; k++) { const x = k / 24; pts.push(`${(x * 100).toFixed(1)}% ${(level + wave(x)).toFixed(2)}%`); }
      fill.style.clipPath = `polygon(${pts.join(',')},100% 100%,0% 100%)`;
      bar.style.width = (p * 100).toFixed(1) + '%';
      const n = Math.round(p * 100); pc.textContent = (n < 60 ? 'Loading ' : n < 100 ? 'Almost there ' : 'Welcome ') + n + '%';
      if (p >= 1) { done = true; finish(); return; }
      requestAnimationFrame(tick);
    };
    const hurry = () => { skip = true; };
    el.addEventListener('pointerdown', hurry); addEventListener('wheel', hurry, { once: true, passive: true }); addEventListener('keydown', hurry, { once: true });
    requestAnimationFrame(tick);
  };
  window.apnaLoader = { play };
  const always = document.currentScript && document.currentScript.hasAttribute('data-always');
  let seen = false; try { seen = sessionStorage.getItem('apna-ld') === '1'; sessionStorage.setItem('apna-ld', '1'); } catch (e) { /* private mode */ }
  if (!always && !seen) { if (document.body) play(false); else addEventListener('DOMContentLoaded', () => play(false), { once: true }); }
})();
