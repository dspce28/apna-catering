import { useEffect, useRef, useState } from 'react';
import { gsap, finePointer, reducedMotion, scrollToId } from '../hooks.js';
import { PHONE, PHONE_INTL, EMAIL } from '../data.js';

export function Preloader({ onDone }) {
  const [n, setN] = useState(0);
  const root = useRef();
  useEffect(() => {
    const quick = reducedMotion();
    const obj = { v: 0 };
    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(obj, { v: 100, duration: quick ? 0.2 : 1.7, ease: 'power2.inOut', onUpdate: () => setN(Math.round(obj.v)) })
      .to('.pre-word span', { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.04 }, '+=0.1')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: quick ? 0.2 : 1.1, ease: 'expo.inOut' }, '-=0.2');
    return () => tl.kill();
  }, [onDone]);
  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="pre-word">
        {'Apna'.split('').map((c, i) => <span key={i}>{c}</span>)}
      </div>
      <div className="pre-meta"><span>Est. 1975</span><span>{String(n).padStart(3, '0')}</span></div>
      <div className="pre-bar"><span style={{ transform: `scaleX(${n / 100})` }} /></div>
    </div>
  );
}

export function Cursor() {
  const dot = useRef(), ring = useRef();
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    document.body.classList.add('has-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12 }), yd = gsap.quickTo(dot.current, 'y', { duration: 0.12 });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' }), yr = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e) => { document.body.classList.add('cursor-moved'); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); };
    const over = (e) => {
      const hit = e.target.closest('a,button,label,input,textarea,[data-cursor]');
      document.body.classList.toggle('cursor-hover', !!hit);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerover', over);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerover', over); document.body.classList.remove('has-cursor'); };
  }, []);
  return (
    <>
      <div className="c-dot" ref={dot} aria-hidden="true" />
      <div className="c-ring" ref={ring} aria-hidden="true"><span>Drag</span></div>
    </>
  );
}

export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!finePointer() || reducedMotion() || !el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,0.4)' });
    const m = (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * strength); yTo((e.clientY - r.top - r.height / 2) * strength); };
    const l = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', m); el.addEventListener('pointerleave', l);
    return () => { el.removeEventListener('pointermove', m); el.removeEventListener('pointerleave', l); };
  }, [strength]);
  return <span className="magnetic" ref={ref}>{children}</span>;
}

export const Btn = ({ to, children, variant = 'gold', className = '', ...rest }) => (
  <Magnetic>
    <a
      href={`#${to}`}
      className={`btn btn-${variant} ${className}`}
      onClick={(e) => { e.preventDefault(); scrollToId(to); }}
      {...rest}
    >
      <span className="btn-label" data-text={typeof children === 'string' ? children : undefined}>{children}</span>
    </a>
  </Magnetic>
);

const links = [['heritage', 'Our story'], ['occasions', 'Occasions'], ['traditions', 'Weddings'], ['menus', 'Menus'], ['experiences', 'Services']];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let last = 0;
    const on = () => {
      const y = scrollY;
      setScrolled(y > 40);
      setHidden(y > 600 && y > last + 4 && !open);
      if (y < last - 4) setHidden(false);
      last = y;
      const h = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--progress', h > 0 ? y / h : 0);
    };
    addEventListener('scroll', on, { passive: true });
    on();
    return () => removeEventListener('scroll', on);
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }, [open]);
  const go = (id) => (e) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(id), open ? 350 : 0); };
  return (
    <>
      <div className="progress" aria-hidden="true" />
      <header className={`nav ${scrolled ? 'scrolled' : ''} ${hidden ? 'hide' : ''}`}>
        <a href="#top" className="brand" onClick={go('top')} aria-label="Apna Catering, back to top">
          <span className="brand-mark">Apna</span>
          <span className="brand-sub">Catering · Est. 1975</span>
        </a>
        <nav className="nav-links" aria-label="Main">
          {links.map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={go(id)}><span data-text={l}>{l}</span></a>
          ))}
        </nav>
        <div className="nav-cta"><Btn to="enquire" className="btn-sm">Check your date</Btn></div>
        <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </header>
      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        {links.map(([id, l], i) => (
          <a key={id} href={`#${id}`} onClick={go(id)} style={{ '--i': i }}><small>0{i + 1}</small>{l}</a>
        ))}
        <a href="#enquire" onClick={go('enquire')} className="btn btn-gold" style={{ '--i': links.length }}>Check your date</a>
        <div className="drawer-foot"><a href={`tel:+${PHONE_INTL}`}>{PHONE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
      </div>
    </>
  );
}

export function MobileBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(scrollY > innerHeight * 0.8);
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <div className={`mobile-bar ${show ? 'show' : ''}`}>
      <a href={`tel:+${PHONE_INTL}`}>Call</a>
      <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a href="#enquire" className="mb-cta" onClick={(e) => { e.preventDefault(); scrollToId('enquire'); }}>Check date</a>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-lede">Love for food, since 1975. Let's make yours memorable.</p>
          <Btn to="enquire">Start planning →</Btn>
        </div>
        <div>
          <h4>Explore</h4>
          {links.map(([id, l]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>{l}</a>)}
        </div>
        <div>
          <h4>Talk to us</h4>
          <a href={`tel:+${PHONE_INTL}`}>{PHONE}</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <span className="muted">Glasgow, Scotland</span>
        </div>
      </div>
      <div className="footer-giant" aria-hidden="true">Apna</div>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} Apna Catering. All rights reserved.</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollToId('top'); }}>Back to top ↑</a>
      </div>
    </footer>
  );
}
