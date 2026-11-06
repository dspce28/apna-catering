import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, useNearView, useReveal } from '../hooks.js';
import { Btn } from './Chrome.jsx';
import { Img, imgSrc } from '../img.jsx';

const HeroSlides = lazy(() => import('../three/HeroSlides.jsx'));
const PetalField = lazy(() => import('../three/PetalField.jsx'));

/* Set to '/video/tadka.mp4' once the clip is in public/video (see README):
   the sizzle section then scrubs it with scroll instead of the slideshow. */
const TADKA_VIDEO = '';

const SLIDES = [
  { n: 'karahi', cap: 'Butter chicken, served in copper' },
  { n: 'kebab', cap: 'Off the grill, straight to the table' },
  { n: 'brass-curry', cap: 'Slow-cooked, finished with cream' },
  { n: 'paneer-tikka', cap: 'Paneer tikka, still sizzling' },
  { n: 'thali-dark', cap: 'The full thali, done properly' },
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
 * Opening moment: a carpet of rose and marigold petals over the feast.
 * Move the cursor (or a finger) to scatter them; scrolling blows them away.
 */
export function PetalHero({ ready }) {
  const root = useRef();
  const gust = useRef(0);
  const near = useNearView(root, '0px');
  const [revealed, setRevealed] = useState(false);
  const [mobile] = useState(() => typeof window !== 'undefined' && innerWidth < 900);
  const [gl, setGl] = useState(true);

  useEffect(() => {
    import('../three/HeroSlides.jsx').then((m) => setGl(m.webglAvailable() && !reducedMotion()));
  }, []);

  useEffect(() => {
    const el = root.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const total = el.offsetHeight - innerHeight;
      const p = clamp01(-el.getBoundingClientRect().top / Math.max(1, total));
      gust.current = clamp01(p / 0.55);
      el.style.setProperty('--p', p.toFixed(4));
      if (p > 0.08) setRevealed(true);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', on, { passive: true });
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { if (!gl) setRevealed(true); }, [gl]);
  const onCleared = useCallback(() => setRevealed(true), []);

  return (
    <section className={`petal-hero ${ready ? 'is-ready' : ''} ${revealed ? 'revealed' : ''}`} ref={root} id="top">
      <div className="ph-stage">
        <Img n={mobile ? 'karahi' : 'thali-dark'} className="ph-bg" sizes="100vw" eager alt="An Indian feast laid out for a celebration" />
        <div className="ph-scrim" aria-hidden="true" />
        <div className="ph-copy wrap">
          <p className="eyebrow center ph-eyebrow"><span>Glasgow</span><span className="ph-mid"> · Wedding &amp; event caterers</span><span> · Since 1975</span></p>
          <h1 className="ph-title">Make it <em>memorable.</em></h1>
          <p className="ph-sub">Engagements, mehndis, weddings, walimas and birthdays, catered by a Glasgow family kitchen with a love for food.</p>
          <div className="hero-ctas">
            <Btn to="enquire">Check your date →</Btn>
            <Btn to="occasions" variant="ghost">Explore occasions</Btn>
          </div>
        </div>
        {gl && (
          <div className="ph-petals" aria-hidden="true">
            <Suspense fallback={null}>
              <PetalField gust={gust} count={mobile ? 520 : 1300} active={near} breeze={ready} onCleared={onCleared} />
            </Suspense>
          </div>
        )}
        <p className="ph-hint" aria-hidden="true">{mobile ? 'Swipe to scatter the petals' : 'Move to scatter the petals'}</p>
        <div className="scroll-hint ph-scroll" aria-hidden="true"><span>Scroll</span><i /></div>
      </div>
    </section>
  );
}

/*
 * Sizzle section: a framed window of real photography in the middle of an ivory page.
 * Scrolling grows the window until it fills the screen, then the page continues.
 * Driven by plain scroll position + clip-path, so it works with or without
 * smooth scrolling, on touch devices, and without WebGL (falls back to <img>).
 */
export function GrowHero({ ready = true }) {
  const video = useRef();
  const [hasVideo, setHasVideo] = useState(false);
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
      const v = video.current;
      if (v && v.duration) v.currentTime = Math.min(v.duration - 0.05, p * v.duration);
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
    <section className={`grow-hero ${ready ? 'is-ready' : ''} ${hasVideo ? 'has-video' : ''}`} ref={root} id="sizzle">
      <div className="gh-stage">
        <p className="eyebrow gh-top"><span>The sizzle</span><i>✦</i><span>Cooked fresh on the day</span></p>

        <h1 className="gh-title">
          <span className="gh-word l">{split('Cooked')}</span>
          <span className="gh-word r"><em>{split('fresh.')}</em></span>
        </h1>

        <div className="gh-window" ref={win}>
          <div className="gh-media">
            {SLIDES.map((s, i) => (
              <Img key={s.n} n={s.n} className={`gh-img ${i === idx ? 'on' : ''}`} sizes="100vw" eager={i === 0} style={s.f ? { objectPosition: `${s.f[0] * 100}% ${(1 - s.f[1]) * 100}%` } : undefined} />
            ))}
            {TADKA_VIDEO && <video
              ref={video}
              className={`gh-video ${hasVideo ? 'on' : ''}`}
              src={TADKA_VIDEO}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={() => setHasVideo(true)}
              onError={() => setHasVideo(false)}
            />}
            {gl && near && !hasVideo && (
              <div className={`gh-gl ${glReady ? 'on' : ''}`}>
                <Suspense fallback={null}>
                  <HeroSlides urls={urls} focus={FOCUS} index={idx} zoom={zoom} active={near} onReady={onGlReady} />
                </Suspense>
              </div>
            )}
          </div>
          <div className="gh-shade" />
          <div className="gh-inside wrap">
            <p className="eyebrow">Always fresh ingredients</p>
            <h2 className="display">Served hot, <em>every time.</em></h2>
            <p className="gh-inside-sub">Kebabs, curries and breads are cooked on the day, never batch-made and reheated. That’s the difference your guests taste.</p>
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
          <p className="gh-lede">We only work with the best suppliers, including small local family farms, so every dish starts with the freshest ingredients.</p>
          <div className="hero-ctas">
            <Btn to="menus" variant="dark">See our menus →</Btn>
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
