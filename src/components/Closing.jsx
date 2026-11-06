import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, reducedMotion, useReveal } from '../hooks.js';
import { quotes, occasions, PHONE, PHONE_INTL, EMAIL } from '../data.js';
import { Magnetic } from './Chrome.jsx';

export function Stories() {
  const root = useRef();
  const [i, setI] = useState(0);
  useReveal(root);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), 7000);
    return () => clearInterval(t);
  }, [i]);
  const q = quotes[i];
  return (
    <section className="stories section" id="stories" ref={root}>
      <div className="wrap">
        <p className="eyebrow center" data-reveal>Kind words</p>
        <div className="quote-mark" aria-hidden="true">“</div>
        <figure className="quote" key={i}>
          <blockquote>{q.q.split(' ').map((w, k) => <span key={k} style={{ '--k': k }}>{w} </span>)}</blockquote>
          <figcaption>{q.who} <span>· {q.what}</span></figcaption>
        </figure>
        <div className="quote-dots" role="tablist" aria-label="Testimonials">
          {quotes.map((_, k) => (
            <button key={k} aria-label={`Testimonial ${k + 1}`} aria-selected={k === i} role="tab" className={k === i ? 'on' : ''} onClick={() => setI(k)}><span /></button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const root = useRef();
  useReveal(root);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.steps-line span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  const steps = [
    ['Enquire', "Tell us your date, guest numbers and venue. We'll come back to you within one working day."],
    ['Taste', 'Join us for a tasting and try the dishes before you decide.'],
    ['Tailor', 'We refine the menu, service style and extras around your traditions.'],
    ['Celebrate', 'Our team handles everything on the day. You enjoy it with your family.'],
  ];
  return (
    <section className="process section" ref={root}>
      <div className="wrap">
        <p className="eyebrow center" data-reveal>How it works</p>
        <h2 className="h2 center" data-reveal>From first call <em>to final course.</em></h2>
        <ol className="steps">
          <div className="steps-line" aria-hidden="true"><span /></div>
          {steps.map(([h, p], k) => (
            <li key={h} data-reveal style={{ '--d': `${k * 0.1}s` }}>
              <span className="step-no">0{k + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const STEP_TITLES = ['What are you celebrating?', 'When, and how many guests?', 'Where is it?', 'How can we reach you?'];

export function Enquire({ picks, guests, occasion, setOccasion }) {
  const root = useRef();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ date: '', guests: '', venue: '', notes: '', name: '', phone: '', email: '' });
  useReveal(root);

  useEffect(() => { if (occasion && step === 0 && !done) setStep(1); }, [occasion]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setF((v) => (v.guests ? v : { ...v, guests: String(guests) })); }, [guests]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const validate = () => {
    if (step === 0 && !occasion) return 'Please choose an occasion.';
    if (step === 1 && (!f.date || !f.guests)) return 'Please add a date and guest numbers.';
    if (step === 3) {
      if (!f.name.trim() || !f.phone.trim()) return 'Please add your name and phone number.';
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return 'Please check your email address.';
    }
    return '';
  };
  const next = () => {
    const m = validate();
    setErr(m);
    if (m) return;
    if (step < 3) setStep(step + 1); else setDone(true);
  };
  const message = [
    'New enquiry: Apna Catering',
    `Occasion: ${occasion}`, `Date: ${f.date}`, `Guests: ${f.guests}`,
    f.venue && `Venue: ${f.venue}`, f.notes && `Notes: ${f.notes}`,
    picks.length && `Menu wishlist: ${picks.map((p) => p.dish).join(', ')}`,
    `Name: ${f.name}`, `Phone: ${f.phone}`, f.email && `Email: ${f.email}`,
  ].filter(Boolean).join('\n');

  return (
    <section className="enquire section" id="enquire" ref={root}>
      <div className="wrap enquire-grid">
        <div className="enquire-copy">
          <p className="eyebrow" data-reveal>Enquire</p>
          <h2 className="display" data-reveal>Is your date <em>still available?</em></h2>
          <p className="muted" data-reveal>Wedding season dates go early. Share a few details and we'll confirm availability and arrange a tasting.</p>
          <div className="contact-lines" data-reveal>
            <a href={`tel:+${PHONE_INTL}`}><small>Call</small>{PHONE}</a>
            <a href={`mailto:${EMAIL}`}><small>Email</small>{EMAIL}</a>
            <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer"><small>WhatsApp</small>Message us</a>
          </div>
        </div>

        <form className="wizard" data-reveal noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
          <div className="wiz-bar"><span style={{ width: `${done ? 100 : ((step + 1) / 4) * 100}%` }} /></div>
          {!done ? (
            <>
              <p className="wiz-step-label">Step <b>{step + 1}</b> of 4</p>
              <fieldset key={step} className="wiz-step">
                <legend>{STEP_TITLES[step]}</legend>
                {step === 0 && (
                  <div className="choice-grid">
                    {occasions.map(([v, l]) => (
                      <label key={v}>
                        <input type="radio" name="occasion" value={v} checked={occasion === v} onChange={() => { setOccasion(v); setErr(''); setTimeout(() => setStep(1), 260); }} />
                        <span>{l}</span>
                      </label>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <>
                    <label className="field"><span>Event date</span><input type="date" value={f.date} onChange={set('date')} required /></label>
                    <label className="field"><span>Approximate guests</span><input type="number" min="10" step="10" placeholder="e.g. 300" value={f.guests} onChange={set('guests')} required /></label>
                  </>
                )}
                {step === 2 && (
                  <>
                    <label className="field"><span>Venue or town</span><input type="text" placeholder="e.g. Glasgow city centre" value={f.venue} onChange={set('venue')} /></label>
                    <label className="field"><span>Anything we should know?</span><textarea rows="3" placeholder="Dietary needs, live stations, number of events…" value={f.notes} onChange={set('notes')} /></label>
                    {picks.length > 0 && <p className="menu-attach">✦ Your menu selection ({picks.length} dishes) will be attached.</p>}
                  </>
                )}
                {step === 3 && (
                  <>
                    <label className="field"><span>Your name</span><input type="text" autoComplete="name" value={f.name} onChange={set('name')} required /></label>
                    <label className="field"><span>Phone</span><input type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} required /></label>
                    <label className="field"><span>Email (optional)</span><input type="email" autoComplete="email" value={f.email} onChange={set('email')} /></label>
                  </>
                )}
              </fieldset>
              <p className="wiz-error" role="alert">{err}</p>
              <div className="wiz-nav">
                <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => { setErr(''); setStep(step - 1); }}><span className="btn-label">Back</span></button>
                <Magnetic><button type="submit" className="btn btn-gold"><span className="btn-label">{step === 3 ? 'Prepare enquiry ✦' : 'Continue →'}</span></button></Magnetic>
              </div>
            </>
          ) : (
            <div className="wiz-done">
              <div className="tick" aria-hidden="true">✓</div>
              <h3>Thank you, {f.name.split(' ')[0]}.</h3>
              <p>Your enquiry is ready. Choose how you'd like to send it, and we'll reply within one working day.</p>
              <div className="send-row">
                <a className="btn btn-gold" id="sendWa" href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><span className="btn-label">Send on WhatsApp</span></a>
                <a className="btn btn-ghost" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Event enquiry')}&body=${encodeURIComponent(message)}`}><span className="btn-label">Send by email</span></a>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
