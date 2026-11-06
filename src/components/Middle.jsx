import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, finePointer, scrollToId, useNearView, useReveal } from '../hooks.js';
import { traditions, menus, courses, gallery, experiences, occasionCards, allServices } from '../data.js';
import { Btn, Magnetic } from './Chrome.jsx';

const Gallery3D = lazy(() => import('../three/Gallery3D.jsx'));

export function Traditions({ onOccasion }) {
  const root = useRef();
  const [tab, setTab] = useState(0);
  const tabsRef = useRef([]);
  const [ink, setInk] = useState({ x: 0, w: 0 });
  useReveal(root);
  useEffect(() => {
    const upd = () => { const b = tabsRef.current[tab]; if (b) setInk({ x: b.offsetLeft, w: b.offsetWidth }); };
    upd();
    document.fonts?.ready.then(upd);
    addEventListener('resize', upd);
    return () => removeEventListener('resize', upd);
  }, [tab]);
  const t = traditions[tab];
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (tab + (e.key === 'ArrowRight' ? 1 : traditions.length - 1)) % traditions.length;
    setTab(n); tabsRef.current[n]?.focus();
  };
  return (
    <section className="traditions section" id="traditions" ref={root}>
      <div className="ghost ghost-trad" aria-hidden="true" key={t.word}>{t.word}</div>
      <div className="wrap">
        <p className="eyebrow center" data-reveal>Weddings &amp; events</p>
        <h2 className="h2 center" data-reveal>Every family celebrates <em>in its own way.</em></h2>
        <div className="tabs" role="tablist" aria-label="Celebration type" onKeyDown={onKey} data-reveal>
          {traditions.map((x, i) => (
            <button key={x.key} ref={(el) => (tabsRef.current[i] = el)} role="tab" aria-selected={i === tab} tabIndex={i === tab ? 0 : -1} onClick={() => setTab(i)}>{x.label}</button>
          ))}
          <span className="tab-ink" style={{ width: ink.w, transform: `translateX(${ink.x}px)` }} aria-hidden="true" />
        </div>
        <article className="panel" key={t.key} role="tabpanel">
          <div className="panel-img"><img src={t.img} alt="" /><span className="panel-no">0{tab + 1}</span></div>
          <div className="panel-copy">
            <h3>{t.title}</h3>
            <p>{t.body}</p>
            <ul className="ticks">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <a href="#enquire" className="link-arrow" onClick={(e) => { e.preventDefault(); onOccasion(t.occasion); scrollToId('enquire'); }}>
              Plan your {t.label.toLowerCase()} {t.key === 'corporate' ? 'event' : 'celebration'} <span>→</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function TiltCard({ m, i }) {
  const ref = useRef();
  const move = (e) => {
    if (!finePointer() || reducedMotion()) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--rx', `${-y * 8}deg`);
    ref.current.style.setProperty('--ry', `${x * 10}deg`);
    ref.current.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const leave = () => { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg'); };
  return (
    <article className="mcard" ref={ref} onPointerMove={move} onPointerLeave={leave}>
      <div className="mcard-img"><img src={m.img} alt="" loading="lazy" /></div>
      <div className="mcard-body">
        <span className="mcard-no">{m.no}</span>
        <h3>{m.name}</h3>
        <ul>{m.dishes.map((d) => <li key={d}>{d}</li>)}</ul>
      </div>
      <span className="mcard-glare" aria-hidden="true" />
      <span className="mcard-idx" aria-hidden="true">0{i + 1}</span>
    </article>
  );
}

export function Menus() {
  const root = useRef();
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const track = root.current.querySelector('.h-track');
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.to('.h-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } });
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="menus" id="menus" ref={root}>
      <div className="h-track">
        <div className="h-intro">
          <p className="eyebrow">Signature menus</p>
          <h2 className="h2">Start with a classic. <em>Make it yours.</em></h2>
          <p className="muted">Four menus our families return to again and again. Every one can be changed dish by dish, or build your own below.</p>
          <Btn to="builder" variant="ghost">Build your own →</Btn>
        </div>
        {menus.map((m, i) => <TiltCard key={m.name} m={m} i={i} />)}
        <div className="h-end">
          <p className="display-sm">Every menu is<br /><em>a starting point.</em></p>
        </div>
      </div>
      <div className="h-progress" aria-hidden="true"><span /></div>
    </section>
  );
}

export function GallerySection({ velocity }) {
  const root = useRef();
  const near = useNearView(root);
  const [open, setOpen] = useState(null);
  useReveal(root);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(null);
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);
  return (
    <section className="gallery section" id="gallery" ref={root}>
      <div className="wrap gallery-head">
        <p className="eyebrow center" data-reveal>A taste of Apna</p>
        <h2 className="h2 center" data-reveal>Drag through <em>the kitchen.</em></h2>
      </div>
      <div className="gallery-stage" data-cursor="drag">
        {near && (
          <Suspense fallback={<div className="gallery-loading">Loading…</div>}>
            <Gallery3D images={gallery} onOpen={setOpen} velocity={velocity} active={near} />
          </Suspense>
        )}
      </div>
      <p className="center muted gallery-hint">Drag to rotate · tap a dish to enlarge</p>
      <div className={`lightbox ${open ? 'open' : ''}`} onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-hidden={!open}>
        {open && <img src={open} alt="Dish from the Apna kitchen" />}
        <button aria-label="Close">×</button>
      </div>
    </section>
  );
}

export function Builder({ picks, setPicks, guests, setGuests }) {
  const root = useRef();
  const [shake, setShake] = useState('');
  useReveal(root);
  const toggle = (course, dish, max) => {
    const has = picks.some((p) => p.dish === dish);
    if (has) return setPicks(picks.filter((p) => p.dish !== dish));
    if (picks.filter((p) => p.course === course).length >= max) { setShake(dish); setTimeout(() => setShake(''), 420); return; }
    setPicks([...picks, { course, dish }]);
  };
  const total = courses.reduce((a, c) => a + c.max, 0);
  return (
    <section className="builder section" id="builder" ref={root}>
      <div className="wrap">
        <p className="eyebrow center" data-reveal>Interactive</p>
        <h2 className="h2 center" data-reveal>Design your menu <em>in sixty seconds.</em></h2>
        <p className="center muted narrow" data-reveal>Choose the dishes you love. We'll attach your selection to your enquiry, so our first conversation starts with your menu.</p>
        <div className="builder-grid">
          <div>
            {courses.map((c) => {
              const n = picks.filter((p) => p.course === c.name).length;
              return (
                <div className="course" key={c.name} data-reveal>
                  <h4>{c.name} <small>{n}/{c.max}</small></h4>
                  <div className="chips">
                    {c.dishes.map((d) => {
                      const on = picks.some((p) => p.dish === d);
                      return (
                        <button key={d} className={`${on ? 'on' : ''} ${shake === d ? 'shake' : ''}`} aria-pressed={on} onClick={() => toggle(c.name, d, c.max)}>{d}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="summary" aria-live="polite">
            <div className="summary-inner">
              <p className="eyebrow">Your menu</p>
              <div className="guests">
                <label htmlFor="guests">Guests <output>{guests}{guests >= 1000 ? '+' : ''}</output></label>
                <input type="range" id="guests" min="50" max="1000" step="25" value={guests} onChange={(e) => setGuests(+e.target.value)} />
              </div>
              <ol className="summary-list">
                {picks.length ? picks.map((p) => <li key={p.dish}><span>{p.dish}</span><small>{p.course}</small></li>) : <li className="empty">Tap a dish to begin…</li>}
              </ol>
              <div className="meter"><span style={{ width: `${(picks.length / total) * 100}%` }} /></div>
              <p className="summary-count"><b>{picks.length}</b> of {total} dishes</p>
              <Magnetic><a href="#enquire" className="btn btn-gold full" onClick={(e) => { e.preventDefault(); scrollToId('enquire'); }}><span className="btn-label">Add to my enquiry →</span></a></Magnetic>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function Experiences() {
  const root = useRef();
  const float = useRef();
  const [active, setActive] = useState(-1);
  useReveal(root);
  useEffect(() => {
    if (!finePointer()) return;
    const xTo = gsap.quickTo(float.current, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(float.current, 'y', { duration: 0.6, ease: 'power3' });
    const m = (e) => { xTo(e.clientX); yTo(e.clientY); };
    addEventListener('pointermove', m);
    return () => removeEventListener('pointermove', m);
  }, []);
  return (
    <section className="experiences section" id="experiences" ref={root}>
      <div className="wrap">
        <div className="head-row">
          <div>
            <p className="eyebrow" data-reveal>Beyond the plate</p>
            <h2 className="h2" data-reveal>Theatre your guests <em>will remember.</em></h2>
          </div>
          <p className="muted" data-reveal>Live stations, displays and full event service, all from one team, so your family can enjoy the day.</p>
        </div>
        <ul className="xlist" onPointerLeave={() => setActive(-1)}>
          {experiences.map((x, i) => (
            <li key={x.title} data-reveal onPointerEnter={() => setActive(i)} className={active === i ? 'on' : ''}>
              <span className="x-no">0{i + 1}</span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <img className="x-thumb" src={x.img} alt="" loading="lazy" />
              <span className="x-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`x-float ${active >= 0 ? 'show' : ''}`} ref={float} aria-hidden="true">
        {experiences.map((x, i) => <img key={x.title} src={x.img} alt="" className={active === i ? 'on' : ''} />)}
      </div>
    </section>
  );
}

export function Occasions({ onOccasion }) {
  const root = useRef();
  useReveal(root);
  const move = (e) => {
    if (!finePointer() || reducedMotion()) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <section className="occasions section" id="occasions" ref={root}>
      <div className="wrap">
        <div className="head-row">
          <div>
            <p className="eyebrow" data-reveal>For your special day</p>
            <h2 className="h2" data-reveal>Every chapter <em>deserves a feast.</em></h2>
          </div>
          <p className="muted" data-reveal>From the roka to the reception, and every birthday after: exceptional catering for the moments you'll post about for years.</p>
        </div>
        <div className="occ-grid">
          {occasionCards.map((o, i) => (
            <a
              key={o.title}
              href="#enquire"
              className={`occ ${i === 2 ? 'occ-feature' : ''}`}
              data-reveal
              style={{ '--d': `${(i % 4) * 0.07}s` }}
              onPointerMove={move}
              onClick={(e) => { e.preventDefault(); onOccasion(o.occasion); scrollToId('enquire'); }}
            >
              <img src={o.img} alt="" loading="lazy" />
              <span className="occ-shine" aria-hidden="true" />
              <span className="occ-tag">{o.tag}</span>
              <span className="occ-body">
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                <span className="occ-cta">Plan this <i>→</i></span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div className="svc-marquee" aria-label="Our services">
        <div className="svc-track">
          {[...allServices, ...allServices].map((x, i) => <span key={i}>{x}<i>✦</i></span>)}
        </div>
      </div>
    </section>
  );
}

export function Featured() {
  const root = useRef();
  useReveal(root);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.feat-img img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.feat-img', { clipPath: 'inset(18% 18% 18% 18% round 999px 999px 8px 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 8px 8px)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center center', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="featured section" ref={root}>
      <div className="wrap feat-grid">
        <div className="feat-img"><img src="/img/table.webp" alt="A dressed banquet table" loading="lazy" /></div>
        <div className="feat-copy">
          <p className="eyebrow" data-reveal>Featured event</p>
          <h2 className="h2" data-reveal>Archana &amp; Sanjeev's <em>celebration.</em></h2>
          <p data-reveal>One of the most exciting events we've catered was Archana and Sanjeev's wedding. We provided the full package for their celebration in an open pavilion at one of Glasgow's premier hotels.</p>
          <ul className="feat-tags" data-reveal>
            {['Floral', 'Lighting', 'Food', 'Bar', 'Staff'].map((t) => <li key={t}>{t}</li>)}
          </ul>
          <blockquote className="feat-quote" data-reveal>“Our cocktail party was a huge success due to your efficiency and the care you took with the presentation of the food.”<cite>Archana &amp; Sanjeev</cite></blockquote>
          <div data-reveal><Btn to="enquire">Start planning yours →</Btn></div>
        </div>
      </div>
    </section>
  );
}

export { ScrollTrigger };
