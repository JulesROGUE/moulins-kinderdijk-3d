import { useEffect, useRef, useState } from 'react';
import { World } from './scene/World.js';
import { VIEW_ORDER, viewFromHash } from './viewpoints.js';
import Overlay from './ui/Overlay.jsx';
import './ui/overlay.css';

const isDarkTheme = () => document.documentElement.dataset.theme === 'dark';

export default function App() {
  const hostRef = useRef(null);
  const worldRef = useRef(null);
  const [view, setView] = useState(() => viewFromHash(window.location.hash));
  const [night, setNight] = useState(isDarkTheme);
  const [sails, setSails] = useState(false);
  const [tour, setTour] = useState(false);

  const actions = useRef({});
  actions.current = {
    goTo(id) {
      setView(id);
      worldRef.current?.goTo(id, true);
      if (window.location.hash !== `#${id}`) window.history.replaceState(null, '', `#${id}`);
    },
    toggleNight() {
      const next = !night;
      setNight(next);
      worldRef.current?.setNight(next);
    },
    toggleSails() {
      const next = !sails;
      setSails(next);
      worldRef.current?.setSails(next);
    },
    toggleTour() {
      const next = !tour;
      setTour(next);
      worldRef.current?.setTour(next);
    },
  };

  useEffect(() => {
    const world = new World(hostRef.current, { view: viewFromHash(window.location.hash), night: isDarkTheme() });
    worldRef.current = world;
    world.onTourStop = () => setTour(false);

    const onHash = () => {
      const id = viewFromHash(window.location.hash);
      setView(id);
      world.goTo(id, true);
    };
    const onKey = (event) => {
      const tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const index = ['1', '2', '3', '4'].indexOf(event.key);
      if (index >= 0) actions.current.goTo(VIEW_ORDER[index]);
      else if (event.key === 'n' || event.key === 'N') actions.current.toggleNight();
    };
    const observer = new MutationObserver(() => {
      const dark = isDarkTheme();
      setNight(dark);
      world.setNight(dark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onKey);
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  return (
    <div className="kd-root">
      <div className="kd-canvas" ref={hostRef} />
      <Overlay
        view={view}
        night={night}
        sails={sails}
        tour={tour}
        onView={(id) => actions.current.goTo(id)}
        onNight={() => actions.current.toggleNight()}
        onSails={() => actions.current.toggleSails()}
        onTour={() => actions.current.toggleTour()}
      />
    </div>
  );
}
