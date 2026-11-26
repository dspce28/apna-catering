/* Diya loader. Plays once per session (or always, with data-always on the script). Ends at ~1.2s, or when tapped,
   and never holds a slow page longer than 2.5s. window.apnaLoader.play(slow) replays it (used by the demo). */
(() => {
  const DIYA = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs>
    <radialGradient id="ldf" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fffbe8"/><stop offset=".35" stop-color="#ffe08a"/><stop offset=".75" stop-color="#ff9a2e"/><stop offset="1" stop-color="#e2541a" stop-opacity="0"/></radialGradient>
    <linearGradient id="ldb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc9c"/><stop offset=".45" stop-color="#c9a25a"/><stop offset="1" stop-color="#6e4c18"/></linearGradient>
    <linearGradient id="ldo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a1e"/><stop offset="1" stop-color="#3a2408"/></linearGradient></defs>
    <g class="ld-flame"><path d="M60 22C68 36 72 46 67 55C64 60 56 60 53 55C48 46 52 36 60 22Z" fill="url(#ldf)"/><path d="M60 40C63 46 64 50 62 54C61 56 59 56 58 54C56 50 57 46 60 40Z" fill="#fffdf2"/></g>
    <path d="M57 60L63 60L62 66L58 66Z" fill="#3a2408"/>
    <path d="M14 66C14 66 30 64 60 64C90 64 106 66 106 66C104 86 86 98 60 98C34 98 16 86 14 66Z" fill="url(#ldb)"/>
    <ellipse cx="60" cy="66" rx="46" ry="6" fill="url(#ldo)"/><ellipse cx="60" cy="65.5" rx="40" ry="4" fill="#c98a2a" opacity=".55"/>
    <path d="M106 66C112 64 116 60 117 56C114 62 108 64 104 64Z" fill="url(#ldb)"/>
    <path d="M24 80C40 88 80 88 96 80" stroke="#f6dc9c" stroke-width="1.2" fill="none" opacity=".7"/>
    <g fill="#f6dc9c" opacity=".8"><circle cx="40" cy="84" r="1.6"/><circle cx="60" cy="87" r="1.6"/><circle cx="80" cy="84" r="1.6"/></g>
    <path d="M44 98L76 98L72 106L48 106Z" fill="url(#ldb)"/></svg>`;
  const make = () => {
    const el = document.createElement('div'); el.className = 'ld'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<div class="ld-glow"></div><div class="ld-stage"><div class="ld-diya">${DIYA}<i class="ld-spark"></i><i class="ld-spark"></i><i class="ld-spark"></i></div>
      <div class="ld-name"><b>Apna</b><small>Catering · Est. 1995</small></div></div>`;
    return el;
  };
  const play = (slow) => {
    document.querySelectorAll('.ld').forEach((e) => e.remove());
    const el = make(), ls = slow ? 3 : 1; el.style.setProperty('--ls', ls); document.body.appendChild(el);
    let gone = false;
    const leave = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => el.remove(), 650 * ls); };
    const t0 = performance.now(), MIN = 1150 * ls, MAX = 2500 * ls;
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
