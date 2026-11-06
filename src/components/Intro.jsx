import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, useNearView, useReveal } from '../hooks.js';
import { Btn } from './Chrome.jsx';
import { Img, imgSrc } from '../img.jsx';

const HeroSlides = lazy(() => import('../three/HeroSlides.jsx'));

const SLIDES = [
  { n: 'karahi', cap: 'Butter chicken, served in copper' },
  { n: 'bride', cap: 'Engagements & weddings', f: [0.5, 0.8] },
  { n: 'buffet', cap: 'Catering for hundreds of guests' },
  { n: 'thali-dark', cap: 'The full thali, done properly' },
  { n: 'cake', cap: 'Birthdays & parties' },
];

// uv focus (y measured from the bottom in GL), used to keep faces in frame
const FOCUS = SLIDES.map((s) => s.f || [0.5, 0.5]);

const split = (text) => {
  let n = 0;
  return text.split(' ').map((word, w) => (
    <span className="wd" key={w}>
      {word.split('').map((c) => <span className="ch" key={n} style={{ '--i': n++ }}>{c}</span>)}
    </span>
  ));
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/*
 * Hero: a framed window of real photography in the middle of an ivory page.
 * Scrolling grows the window until it fills the screen, then the page continues.
 * Driven by plain scroll position + clip-path, so it works with or without
 * smooth scrolling, on touch devices, and without WebGL (falls back to <img>).
 */
export function GrowHero({ ready }) {
  const root = useRef();
  const win = useRef();
  const zoom = useRef(1.12);
  const near = useNearView(root, '0px');
  const [gl, setGl] = useState(false);
  const [glReady, setGlReady] = useState(false);
  const [idx, setIdx] = useState(0);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && innerWidth < 900);

  useEffect(() => {
    import('../three/HeroSlides.jsx').then((m) => setGl(m.webglAvailable()));
    const r = () => setMobile(innerWidth < 900);
    addEventListener('resize', r);
    return () => removeEventListener('resize', r);
  }, []);

  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = root.current, w = win.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - innerHeight;
      const p = reducedMotion() ? 1 : clamp01(-r.top / Math.max(1, total));
      const g = ease(clamp01(p / 0.78));
      const m = innerWidth < 900;
      const start = m ? [28, 7, 19, 7, 18] : [21, 31, 15, 31, 22]; // top right bottom left radius (%/px)
      const ins = start.slice(0, 4).map((v) => lerp(v, 0, g));
      const rad = lerp(start[4], 0, g);
      w.style.clipPath = `inset(${ins[0]}% ${ins[1]}% ${ins[2]}% ${ins[3]}% round ${rad}px)`;
      el.style.setProperty('--g', g.toFixed(4));
      el.style.setProperty('--late', clamp01((p - 0.7) / 0.24).toFixed(4));
      zoom.current = lerp(1.12, 1.0, g);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  const urls = useMemo(() => SLIDES.map((s) => imgSrc(s.n, mobile ? 960 : 1920)), [mobile]);
  const onGlReady = useCallback(() => setGlReady(true), []);

  return (
    <section className={`grow-hero ${ready ? 'is-ready' : ''}`} ref={root} id="top">
      <div className="gh-stage">
        <p className="eyebrow gh-top"><span>Glasgow</span><i>✦</i><span>Wedding &amp; event caterers</span><i>✦</i><span>Since 1975</span></p>

        <h1 className="gh-title">
          <span className="gh-word l">{split('Love for')}</span>
          <span className="gh-word r"><em>{split('food.')}</em></span>
        </h1>

        <div className="gh-window" ref={win}>
          <div className="gh-media">
            {SLIDES.map((s, i) => (
              <Img key={s.n} n={s.n} className={`gh-img ${i === idx ? 'on' : ''}`} sizes="100vw" eager={i === 0} style={s.f ? { objectPosition: `${s.f[0] * 100}% ${(1 - s.f[1]) * 100}%` } : undefined} />
            ))}
            {gl && near && (
              <div className={`gh-gl ${glReady ? 'on' : ''}`}>
                <Suspense fallback={null}>
                  <HeroSlides urls={urls} focus={FOCUS} index={idx} zoom={zoom} active={near} onReady={onGlReady} />
                </Suspense>
              </div>
            )}
          </div>
          <div className="gh-shade" />
          <div className="gh-inside wrap">
            <p className="eyebrow">Discover Apna Catering</p>
            <h2 className="display">Make it <em>memorable.</em></h2>
            <p className="gh-inside-sub">Engagements, mehndis, weddings, walimas and birthdays. Indian &amp; Asian catering from a Glasgow family kitchen.</p>
            <div className="hero-ctas">
              <Btn to="enquire">Check your date →</Btn>
              <Btn to="occasions" variant="ghost">Explore occasions</Btn>
            </div>
          </div>
          <div className="gh-caption">
            <span className="gh-count">0{idx + 1}<i>/0{SLIDES.length}</i></span>
            <span className="gh-cap" key={idx}>{SLIDES[idx].cap}</span>
          </div>
        </div>

        <div className="gh-foot">
          <p className="gh-lede">Glasgow's wedding &amp; event caterers with a passion for fine food. Sikh, Hindu and Muslim celebrations since 1975.</p>
          <div className="hero-ctas">
            <Btn to="enquire" variant="dark">Check your date →</Btn>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden="true"><span>Scroll</span><i /></div>
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
