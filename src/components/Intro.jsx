import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, reducedMotion, finePointer, useReveal } from '../hooks.js';
import { Btn } from './Chrome.jsx';
import { Img, imgSrc } from '../img.jsx';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const split = (text) => {
  let n = 0;
  return text.split(' ').map((word, w) => (
    <span className="wd" key={w}>
      {word.split('').map((c) => <span className="ch" key={n} style={{ '--i': n++ }}>{c}</span>)}
    </span>
  ));
};

const TRAIL = ['karahi', 'bride', 'kebab', 'cake', 'chaat', 'rings', 'biryani', 'buffet', 'paneer-tikka', 'cupcakes', 'samosa', 'aisle', 'thali', 'cocktail'];

/*
 * Hero: big, calm type on ivory. Moving the cursor (or a finger) leaves a
 * trail of real 4K photographs that pop in and fade. It also plays on its own
 * for a few seconds on load, so phones and still mice get the moment too.
 * Text always sits on plain ivory, never over a busy photo.
 */
export function TrailHero({ ready }) {
  const root = useRef();
  const layer = useRef();
  const copy = useRef();
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    if (reducedMotion()) return;
    const el = root.current, L = layer.current;
    const nodes = Array.from(L.children);
    let k = 0, last = null, auto = true, raf = 0, t0 = 0;
    const gap = () => (innerWidth < 900 ? 70 : 95);

    // never drop a photo over the words: skip points inside the text block
    const clearOfText = (x, y) => {
      const c = copy.current.getBoundingClientRect();
      const pad = (nodes[0].offsetWidth || 200) * 0.62 + 12;
      return x < c.left - pad || x > c.right + pad || y < c.top - pad || y > c.bottom + pad;
    };
    const spawn = (x, y) => {
      if (!clearOfText(x, y)) return;
      const img = nodes[k % nodes.length];
      k += 1;
      const r = el.getBoundingClientRect();
      gsap.killTweensOf(img);
      gsap.set(img, { x: x - r.left, y: y - r.top, xPercent: -50, yPercent: -50, rotate: gsap.utils.random(-9, 9), zIndex: k, opacity: 1, scale: 0.4 });
      gsap.timeline()
        .to(img, { scale: 1, duration: 0.55, ease: 'expo.out' })
        .to(img, { opacity: 0, scale: 0.85, y: '+=40', duration: 0.9, ease: 'power2.in' }, 0.75);
    };
    const feed = (x, y) => {
      if (!last) { last = { x, y }; spawn(x, y); return; }
      const d = Math.hypot(x - last.x, y - last.y);
      if (d > gap()) { last = { x, y }; spawn(x, y); }
    };
    const inHero = (y) => { const r = el.getBoundingClientRect(); return y > r.top && y < r.bottom; };
    const pm = (e) => {
      if (!inHero(e.clientY)) return;
      if (auto) { auto = false; setIdle(false); }
      feed(e.clientX, e.clientY);
    };
    const tm = (e) => { const t = e.touches[0]; if (t && inHero(t.clientY)) { auto = false; setIdle(false); feed(t.clientX, t.clientY); } };

    // autoplay: a slow figure-eight across the hero, until the visitor takes over
    const tick = (now) => {
      if (!t0) t0 = now;
      const s = (now - t0) / 1000;
      if (auto && s < 7) {
        const r = el.getBoundingClientRect();
        const a = s * 1.1;
        const x = r.left + r.width / 2 + Math.cos(a) * r.width * 0.43;
        const y = r.top + r.height * 0.5 + Math.sin(a) * r.height * 0.4;
        feed(x, y);
        raf = requestAnimationFrame(tick);
      }
    };
    let start;
    if (ready) start = setTimeout(() => { raf = requestAnimationFrame(tick); }, 700);
    addEventListener('pointermove', pm, { passive: true });
    addEventListener('touchmove', tm, { passive: true });
    return () => {
      clearTimeout(start); cancelAnimationFrame(raf);
      removeEventListener('pointermove', pm); removeEventListener('touchmove', tm);
    };
  }, [ready]);

  return (
    <section className={`trail-hero ${ready ? 'is-ready' : ''}`} ref={root} id="top">
      <div className="th-layer" ref={layer} aria-hidden="true">
        {TRAIL.map((n) => <img key={n} src={imgSrc(n, 960)} alt="" className="th-img" decoding="async" />)}
      </div>
      <div className="th-copy wrap" ref={copy}>
        <p className="eyebrow center th-eyebrow"><span>Glasgow</span><span className="th-mid"> · Wedding &amp; event caterers</span><span> · Since 1975</span></p>
        <h1 className="th-title">
          <span className="th-line">{split('Make it')}</span>
          <span className="th-line"><em>{split('memorable.')}</em></span>
        </h1>
        <p className="th-sub">Engagements, mehndis, weddings, walimas and birthdays, catered by a Glasgow family kitchen with a love for food.</p>
        <div className="hero-ctas">
          <Btn to="enquire" variant="dark">Check your date →</Btn>
          <Btn to="occasions" variant="ghost">Explore occasions</Btn>
        </div>
      </div>
      <p className={`th-hint ${idle ? '' : 'gone'}`} aria-hidden="true">{finePointer() ? 'Move your cursor' : 'Swipe across'} ✦ taste the feast</p>
    </section>
  );
}

const COLLAGE = [
  { n: 'thali-dark', cls: 'c0' },
  { n: 'bride', cls: 'c1' },
  { n: 'kebab', cls: 'c2' },
  { n: 'cake', cls: 'c3' },
  { n: 'karahi', cls: 'c4' },
  { n: 'buffet', cls: 'c5' },
  { n: 'rings', cls: 'c6' },
];
const SCALES = [4, 5, 6, 5, 6, 8, 9];

/*
 * Zoom collage: seven photographs in a loose grid. Scrolling zooms each at its
 * own rate until the centre dish fills the screen; then a solid card brings in
 * the words, so text never sits on a busy image.
 */
export function ZoomCollage() {
  const root = useRef();
  useEffect(() => {
    const el = root.current;
    const items = Array.from(el.querySelectorAll('.zc-item'));
    const card = el.querySelector('.zc-card');
    let raf = 0;
    const update = () => {
      raf = 0;
      const total = el.offsetHeight - innerHeight;
      const p = reducedMotion() ? 1 : clamp01(-el.getBoundingClientRect().top / Math.max(1, total));
      const z = clamp01(p / 0.78);
      const e = z * z * (3 - 2 * z);
      items.forEach((it, i) => { it.style.transform = `scale(${1 + (SCALES[i] - 1) * e})`; });
      const c = clamp01((p - 0.72) / 0.22);
      card.style.opacity = c;
      card.style.transform = `translateY(${(1 - c) * 60}px)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="zoom-collage" ref={root} aria-label="A feast for every chapter">
      <div className="zc-stage">
        {COLLAGE.map((c, i) => (
          <div className={`zc-item ${c.cls}`} key={c.n}>
            <div className="zc-frame"><Img n={c.n} sizes={i === 0 ? '100vw' : '40vw'} /></div>
          </div>
        ))}
        <div className="zc-card">
          <p className="eyebrow">Love for food · Since 1975</p>
          <h2 className="h2">Cooked fresh, <em>served beautifully.</em></h2>
          <p>We only work with the best suppliers, including small local family farms, and cook on the day, never batch-made and reheated.</p>
          <Btn to="menus" variant="dark">See our menus →</Btn>
        </div>
      </div>
    </section>
  );
}

function Odometer({ value, suffix = '', run }) {
  const digits = String(value).split('');
  return (
    <span className="odo" aria-label={`${value}${suffix}`}>
      {digits.map((d, i) => (
        <span className="odo-col" key={i} aria-hidden="true">
          <span className="odo-strip" style={{ transform: run ? `translateY(-${(+d + 10) * 5}%)` : 'translateY(0)', transitionDelay: `${i * 0.12}s` }}>
            {[...Array(20)].map((_, k) => <span key={k}>{k % 10}</span>)}
          </span>
        </span>
      ))}
      {suffix && <span className="odo-suf">{suffix}</span>}
    </span>
  );
}

export function Heritage() {
  const root = useRef();
  const [run, setRun] = useState(false);
  useReveal(root);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setRun(true), { threshold: 0.4 });
    io.observe(root.current.querySelector('.stats'));
    return () => io.disconnect();
  }, []);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reducedMotion()) return;
      gsap.fromTo('.fill-text .w', { opacity: 0.14 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: '.fill-text', start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
      gsap.to('.ghost-heritage', { xPercent: -25, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.utils.toArray('.par').forEach((el) => {
        gsap.fromTo(el, { yPercent: +el.dataset.from }, { yPercent: -el.dataset.from, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  const statement = 'We specialise in Sikh, Hindu and Muslim celebrations, and in anyone who simply adores Asian cuisine. Each family celebrates in its own way, and our menus honour every tradition at the table.';
  return (
    <section className="heritage section" id="heritage" ref={root}>
      <div className="ghost ghost-heritage" aria-hidden="true">Our story · Our story ·</div>
      <div className="wrap">
        <p className="eyebrow" data-reveal>Our story</p>
        <p className="fill-text">
          {statement.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
        </p>
        <div className="heritage-grid">
          <div className="h-media">
            <div className="h-img h-img-1 par" data-from="8"><Img n="spread" alt="A table of Indian curries, rice and breads" /></div>
            <div className="h-img h-img-2 par" data-from="-14"><Img n="samosa" alt="Golden vegetable samosas" sizes="25vw" /></div>
          </div>
          <div className="h-copy">
            <blockquote className="shaw" data-reveal>
              “There is no sincerer love than the love of food.”
              <cite>George Bernard Shaw</cite>
            </blockquote>
            <p data-reveal>Keeping Indian weddings at the standard they deserve is the mission in the Apna kitchen, bringing food to life for the couple and every one of their guests. Indian celebrations are famous for colour and vibrancy, and our food follows suit: dishes that taste as good as they look.</p>
            <div className="stats">
              <div><Odometer value={1975} run={run} /><span>Founded in Glasgow</span></div>
              <div><Odometer value={50} suffix="+" run={run} /><span>Years of celebrations</span></div>
              <div><Odometer value={3} run={run} /><span>Faith traditions, deeply understood</span></div>
              <div><Odometer value={13} run={run} /><span>Live stations &amp; event extras</span></div>
            </div>
          </div>
        </div>

        <div className="pillars">
          {[
            ['Always fresh ingredients', 'We only work with the best food suppliers, including small local family farms, so every dish starts with the freshest ingredients.'],
            ['Always friendly & professional', 'Our staff are our most valuable asset: warm, experienced and calm on the busiest day of your year.'],
            ['The full package', 'Food, beverages, full china service, staff and equipment. Choose a sample menu or create your own with us.'],
          ].map(([h, p], i) => (
            <div className="pillar" key={h} data-reveal style={{ '--d': `${i * 0.1}s` }}>
              <span className="pillar-no">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
