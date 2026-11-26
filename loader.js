/* Logo loader. Plays once per session (or always, with data-always on the script). Ends at ~1.3s, or when tapped,
   and never holds a slow page longer than 2.5s. window.apnaLoader.play(slow) replays it (used by the demo). */
(() => {
  const make = () => {
    const el = document.createElement('div'); el.className = 'ld'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<div class="ld-stage"><div class="ld-glow"></div>
      <svg class="ld-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="r1" cx="50" cy="50" r="49" pathLength="100"/><circle class="r2" cx="50" cy="50" r="46" pathLength="100"/></svg>
      <div class="ld-steam"><i></i><i></i><i></i></div><div class="ld-logo" role="img" aria-label="Apna Catering"></div><div class="ld-shine"></div></div>`;
    return el;
  };
  const play = (slow) => {
    document.querySelectorAll('.ld').forEach((e) => e.remove());
    const el = make(), ls = slow ? 3 : 1; el.style.setProperty('--ls', ls); document.body.appendChild(el);
    let gone = false;
    const leave = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => el.remove(), 650 * ls); };
    const t0 = performance.now(), MIN = 1300 * ls, MAX = 2500 * ls;
    const ready = () => setTimeout(leave, Math.max(0, MIN - (performance.now() - t0)));
    if (document.readyState === 'complete') ready(); else addEventListener('load', ready, { once: true });
    setTimeout(leave, MAX);
    el.addEventListener('pointerdown', leave); addEventListener('wheel', leave, { once: true, passive: true }); addEventListener('keydown', leave, { once: true });
  };
  window.apnaLoader = { play };
  const always = document.currentScript && document.currentScript.hasAttribute('data-always');
  let seen = false; try { seen = sessionStorage.getItem('apna-ld') === '1'; sessionStorage.setItem('apna-ld', '1'); } catch (e) { /* private mode */ }
  if (always || !seen) play(false);
})();
