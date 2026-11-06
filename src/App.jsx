import { useCallback, useEffect, useState } from 'react';
import { useSmoothScroll, ScrollTrigger } from './hooks.js';
import { Preloader, Cursor, Nav, MobileBar, Footer } from './components/Chrome.jsx';
import { GrowHero, Heritage } from './components/Intro.jsx';
import { Traditions, Menus, GallerySection, Builder, Experiences, Occasions, Featured } from './components/Middle.jsx';
import { Stories, Process, Enquire } from './components/Closing.jsx';

export default function App() {
  const velocity = useSmoothScroll();
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [picks, setPicks] = useState([]);
  const [guests, setGuests] = useState(250);
  const [occasion, setOccasion] = useState('');

  const done = useCallback(() => {
    setReady(true);
    setTimeout(() => setLoaderGone(true), 50);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    const onLoad = () => ScrollTrigger.refresh();
    addEventListener('load', onLoad);
    return () => { clearTimeout(t); removeEventListener('load', onLoad); };
  }, [ready]);

  return (
    <>
      {!loaderGone && <Preloader onDone={done} />}
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <GrowHero ready={ready} />
        <Heritage />
        <Occasions onOccasion={setOccasion} />
        <Traditions onOccasion={setOccasion} />
        <Menus />
        <GallerySection velocity={velocity} />
        <Builder picks={picks} setPicks={setPicks} guests={guests} setGuests={setGuests} />
        <Experiences />
        <Featured />
        <Stories />
        <Process />
        <Enquire picks={picks} guests={guests} occasion={occasion} setOccasion={setOccasion} />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
