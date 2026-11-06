import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, useNearView, useReveal } from '../hooks.js';
import { Btn } from './Chrome.jsx';

const ArchCorridor = lazy(() => import('../three/ArchCorridor.jsx'));

const split = (text) => {
  let n = 0;
  return text.split(' ').map((word, w) => (
    <span className="wd" key={w}>
      {word.split('').map((c) => <span className="ch" key={n} style={{ '--i': n++ }}>{c}</span>)}
    </span>
  ));
};

/*
 * The royal arch intro: a corridor of cusped Mughal arches in WebGL.
 * Scrolling walks the camera through each arch until the last one opens
 * onto the site itself.
 */
export function RoyalArch({ ready, velocity }) {
  const root = useRef();
  const progress = useRef(0);
  const near = useNearView(root, '0px');
  const [small, setSmall] = useState(() => typeof window !== 'undefined' && innerWidth < 900);
  const [arch, setArch] = useState(1);

  useEffect(() => {
    const r = () => setSmall(innerWidth < 900);
    addEventListener('resize', r);
    return () => removeEventListener('resize', r);
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion()) { root.current.classList.add('static'); return; }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current, start: 'top top', end: 'bottom bottom',
        onUpdate: (s) => {
          progress.current = s.progress;
          setArch(Math.min(4, 1 + Math.floor(s.progress * 4.2)));
        },
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
      tl.to('.ra-intro .hero-word.l', { xPercent: -40, opacity: 0, duration: 0.14, ease: 'power2.in' }, 0)
        .to('.ra-intro .hero-word.r', { xPercent: 40, opacity: 0, duration: 0.14, ease: 'power2.in' }, 0)
        .to('.ra-intro .ra-top, .ra-intro .hero-foot, .scroll-hint', { opacity: 0, y: -30, duration: 0.1 }, 0)
        .fromTo('.ra-chapter', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.08)
        .to('.ra-chapter', { opacity: 0, duration: 0.05 }, 0.8)
        .fromTo('.ra-shade', { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.78)
        .fromTo('.ra-end > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.1 }, 0.82)
        .fromTo('.ra-veil', { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.96);
    }, root);
    return () => ctx.revert();
  }, []);

  const chapters = ['', 'The welcome', 'The feast', 'The celebration', 'Step inside'];

  return (
    <section className={`royal ${ready ? 'is-ready' : ''}`} ref={root} id="top">
      <div className="ra-stage">
        <div className="ra-canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <ArchCorridor progress={progress} speed={velocity} active={near} small={small} />
          </Suspense>
        </div>
        <div className="ra-vignette" aria-hidden="true" />

        <div className="ra-intro">
          <p className="eyebrow ra-top"><span>Glasgow</span><i>✦</i><span>Wedding &amp; event caterers</span><i>✦</i><span>Since 1975</span></p>
          <h1 className="hero-title">
            <span className="hero-word l">{split('Make it')}</span>
            <span className="hero-word r"><em>{split('memorable.')}</em></span>
          </h1>
          <div className="hero-foot">
            <div className="hero-foot-in">
              <p className="hero-lede">Engagements, mehndis, weddings, walimas and birthdays. Indian &amp; Asian catering from a Glasgow family kitchen.</p>
              <div className="hero-ctas">
                <Btn to="enquire">Check your date →</Btn>
                <Btn to="occasions" variant="ghost">Explore occasions</Btn>
              </div>
            </div>
          </div>
          <div className="scroll-hint" aria-hidden="true"><span>Scroll to step inside</span><i /></div>
        </div>

        <div className="ra-chapter" aria-hidden="true">
          <span className="ra-num">0{arch}</span>
          <span className="ra-line"><b style={{ transform: `scaleX(${arch / 4})` }} /></span>
          <span className="ra-name" key={arch}>{chapters[arch]}</span>
        </div>

        <div className="ra-shade" aria-hidden="true" />
        <div className="ra-end wrap">
          <p className="eyebrow">Discover Apna Catering</p>
          <h2 className="display">Love for food,<br /><em>since 1975.</em></h2>
          <p className="ra-end-sub">Glasgow's wedding &amp; event caterers, with a passion for fine food.</p>
        </div>
        <div className="ra-veil" aria-hidden="true" />
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
            <div className="h-img h-img-1 par" data-from="8"><img src="/img/spread.webp" alt="A table of Indian curries, rice and breads" loading="lazy" /></div>
            <div className="h-img h-img-2 par" data-from="-14"><img src="/img/samosa.webp" alt="Golden vegetable samosas" loading="lazy" /></div>
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
