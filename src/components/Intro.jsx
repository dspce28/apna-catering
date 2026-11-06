import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, useNearView, useReveal } from '../hooks.js';
import { Btn } from './Chrome.jsx';

const HeroScene = lazy(() => import('../three/HeroScene.jsx'));

const split = (text) => {
  let n = 0;
  return text.split(' ').map((word, w) => (
    <span className="wd" key={w}>
      {word.split('').map((c) => <span className="ch" key={n} style={{ '--i': n++ }}>{c}</span>)}
    </span>
  ));
};

export function Hero({ ready }) {
  const root = useRef();
  const scroll = useRef(0);
  const near = useNearView(root, '0px');
  const [small, setSmall] = useState(() => typeof window !== 'undefined' && innerWidth < 900);

  useEffect(() => {
    const r = () => setSmall(innerWidth < 900);
    addEventListener('resize', r);
    return () => removeEventListener('resize', r);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current, start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (s) => { scroll.current = s.progress; },
      });
      if (!reducedMotion()) {
        gsap.to('.hero-word.l', { xPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-word.r', { xPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.fromTo('.hero-foot', { y: 0, opacity: 1 }, { y: -60, opacity: 0, immediateRender: false, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '60% top', scrub: true } });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className={`hero ${ready ? 'is-ready' : ''}`} ref={root} id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-3d" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroScene scroll={scroll} active={near} small={small} />
        </Suspense>
      </div>
      <p className="eyebrow hero-eyebrow"><span>Glasgow</span><i>✦</i><span>Indian wedding &amp; event caterers</span><i>✦</i><span>Since 1975</span></p>
      <h1 className="hero-title">
        <span className="hero-word l">{split('Fifty years')}</span>
        <span className="hero-word r"><em>{split('of feasts.')}</em></span>
      </h1>
      <div className="hero-foot">
        <div className="hero-foot-in">
        <p className="hero-lede">Sikh, Hindu and Muslim weddings, mehndis, walimas and milestone celebrations across Scotland, cooked with the same care for every guest.</p>
        <div className="hero-ctas">
          <Btn to="enquire">Check your date →</Btn>
          <Btn to="builder" variant="ghost">Design your menu</Btn>
        </div>
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true"><span>Scroll to step inside</span><i /></div>
    </section>
  );
}

/* Pinned section: a jharokha (Mughal arch) window that you scroll through into the image. */
export function StepInside() {
  const root = useRef();
  useLayoutEffect(() => {
    if (reducedMotion()) { root.current.classList.add('static'); return; }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', scrub: 1, pin: '.si-stage', anticipatePin: 1 },
      });
      tl.fromTo('.si-mask', { scale: 1 }, { scale: 14, ease: 'power2.in', duration: 1 }, 0)
        .fromTo('.si-img', { scale: 1.35 }, { scale: 1, ease: 'power1.out', duration: 1 }, 0)
        .to('.si-pre', { opacity: 0, y: -40, duration: 0.25 }, 0)
        .fromTo('.si-copy > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, 0.7);
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="step-inside" ref={root} aria-label="Fifty years at Scotland's finest celebrations">
      <div className="si-stage">
        <div className="si-img" style={{ backgroundImage: 'url(/img/hero-wide.webp)' }} role="img" aria-label="Curry in a brass handi on a gold tray" />
        <div className="si-shade" />
        <svg className="si-mask" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path fillRule="evenodd" d="M-2000 -2000H3000V3000H-2000Z M420 640 L420 470 C420 418 455 398 478 376 Q496 358 500 330 Q504 358 522 376 C545 398 580 418 580 470 L580 640 Z" />
          <path className="si-outline" fill="none" d="M410 650 L410 468 C410 410 448 388 472 366 Q494 345 500 312 Q506 345 528 366 C552 388 590 410 590 468 L590 650 Z" />
        </svg>
        <p className="si-pre eyebrow">A family kitchen since 1975</p>
        <div className="si-copy wrap">
          <p className="eyebrow">Glasgow · Est. 1975</p>
          <h2 className="display">Fifty years at Scotland's<br /><em>finest celebrations.</em></h2>
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
          <span className="odo-strip" style={{ transform: run ? `translateY(-${(+d + 10) * 10 / 2}%)` : 'translateY(0)', transitionDelay: `${i * 0.12}s` }}>
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
  const statement = 'Since 1975 we have cooked for the biggest days in families’ lives. Weddings, walimas and reunions that bring three generations around one table. The recipes are handed down. The standards have never moved.';
  return (
    <section className="heritage section" id="heritage" ref={root}>
      <div className="ghost ghost-heritage" aria-hidden="true">Heritage · Heritage ·</div>
      <div className="wrap">
        <p className="eyebrow" data-reveal>Our heritage</p>
        <p className="fill-text">
          {statement.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
        </p>
        <div className="heritage-grid">
          <div className="h-media">
            <div className="h-img h-img-1 par" data-from="8"><img src="/img/spread.webp" alt="A table of Indian curries, rice and breads" loading="lazy" /></div>
            <div className="h-img h-img-2 par" data-from="-14"><img src="/img/samosa.webp" alt="Golden vegetable samosas" loading="lazy" /></div>
          </div>
          <div className="h-copy">
            <h2 className="h2" data-reveal>A family kitchen that grew up with <em>Glasgow's Asian community.</em></h2>
            <p data-reveal>Every menu is built around your family's traditions, using fresh ingredients from suppliers we've trusted for years and served by a team that knows the difference between feeding guests and honouring them.</p>
            <div className="stats">
              <div><Odometer value={1975} run={run} /><span>Founded in Glasgow</span></div>
              <div><Odometer value={50} suffix="+" run={run} /><span>Years of celebrations</span></div>
              <div><Odometer value={3} run={run} /><span>Faith traditions, deeply understood</span></div>
              <div><Odometer value={13} run={run} /><span>Live stations &amp; event extras</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
