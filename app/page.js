'use client';

import { useEffect, useRef, useState } from 'react';
import CONFIG from './config';
import { playMusic } from './music';

const COLORS = ['#f2b300', '#0719d4', '#d14d39', '#8fad00', '#8377e4', '#99c96a', '#20cfb4', '#e8467c'];
const BULBS = ['#ffd400', '#ff3b3b', '#3b8bff', '#35d04a', '#ff5cc8', '#ff8c1a'];
const ROWS = CONFIG.balloonText.trim().split(/\s+/);
const LETTERS = [...ROWS.join('')];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const place = (b, x, y) => (b.style.transform = `translate(${x}px, ${y}px)`);

export default function Birthday() {
  const [classes, setClasses] = useState([]);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', show: false });
  const [zoomed, setZoomed] = useState('');
  const balloons = useRef([]);
  const layer = useRef(null);
  const banner = useRef(null);
  const lightbox = useRef(null);
  const wished = useRef(false);

  const add = (...c) => setClasses(prev => [...prev, ...c]);

  function drift(b) {
    if (wished.current) return;
    place(b, Math.random() * (innerWidth - b.offsetWidth), Math.random() * innerHeight * .75);
  }

  function releaseBalloons() {
    balloons.current.forEach(b => {
      b.style.transition = 'none';
      place(b, Math.random() * (innerWidth - b.offsetWidth), innerHeight + 20);
      b.offsetWidth; // flush so the next move animates
      b.style.transition = '';
      setTimeout(() => drift(b), Math.random() * 1500);
    });
  }

  function lineUp() {
    const gap = 6;
    const longest = Math.max(...ROWS.map(r => r.length));
    const w = Math.min(80, innerHeight * .085, (innerWidth - 24) / longest - gap);
    layer.current.style.setProperty('--w', w + 'px');
    const h = w * 1.2 + 14;
    const top = banner.current.offsetTop + banner.current.offsetHeight + 8; // layout box, ignores the drop-in transform
    let i = 0;
    ROWS.forEach((row, r) => {
      const left = (innerWidth - row.length * (w + gap) + gap) / 2;
      [...row].forEach((_, c) => place(balloons.current[i++], left + c * (w + gap), top + r * h));
    });
  }

  useEffect(() => {
    const onResize = () => wished.current && lineUp();
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);

  async function showMessages() {
    setClasses(prev => prev.filter(c => c !== 'cake-in'));
    await sleep(800);
    for (const [i, text] of CONFIG.messages.entries()) {
      setMessage({ text, show: true });
      if (i === CONFIG.messages.length - 1) break;
      await sleep(2200);
      setMessage({ text, show: false });
      await sleep(800);
    }
    add('finale', 'cake-in');
  }

  const steps = [
    ['Turn on the lights 💡', () => add('lit')],
    ['Play the music 🎵', () => { playMusic(CONFIG.music); add('party'); }],
    ["Let's decorate 🎀", () => add('decorated')],
    ['I got you some balloons 🎈', releaseBalloons],
    ['Cake? Of course! 🎂', () => add('cake-in')],
    ["Don't forget the candle 🕯️", () => add('candle-lit')],
    ['Happy Birthday! 🎉', () => { wished.current = true; add('wished'); lineUp(); }],
    ['A message for you 💌', showMessages],
  ];

  async function next() {
    setBusy(true);
    steps[step][1]();
    if (!steps[step + 1]) return;
    await sleep(2500);
    setStep(step + 1);
    setBusy(false);
  }

  function zoom(src) {
    setZoomed(src);
    lightbox.current.showModal();
  }

  return (
    <div className={`app ${classes.join(' ')}`}>
      <div className="bulbs" aria-hidden="true">
        {BULBS.map(c => <i key={c} className="bulb" style={{ '--c': c }} />)}
      </div>

      <header className="banner" ref={banner}>
        <div className="flags" aria-hidden="true">
          {Array.from({ length: 11 }, (_, i) => <span key={i} style={{ '--c': COLORS[i % COLORS.length] }} />)}
        </div>
        <h1>Happy Birthday{CONFIG.name && `, ${CONFIG.name}`}</h1>
      </header>

      <section className="photos">
        {CONFIG.photos.map((src, i) => (
          <img key={i} src={src} alt={`Photo ${i + 1}`} style={{ '--r': `${i % 2 ? 3 : -3}deg` }} onClick={() => zoom(src)} />
        ))}
      </section>

      <main className="stage">
        <div className="cake">
          <img className="profile" src={CONFIG.profile} alt="" />
          <div className="candle"><div className="flame" /></div>
          <div className="tier top" />
          <div className="tier bottom" />
          <div className="plate" />
        </div>
        <p className={`message${message.show ? ' show' : ''}`} aria-live="polite">{message.text}</p>
      </main>

      <footer className="controls">
        <button id="next" type="button" disabled={busy} onClick={next}>{steps[step][0]}</button>
      </footer>

      <div className="balloons" ref={layer} aria-hidden="true">
        {LETTERS.map((ch, i) => (
          <div
            key={i}
            className="balloon"
            ref={el => (balloons.current[i] = el)}
            style={{ '--c': COLORS[i % COLORS.length] }}
            onTransitionEnd={e => e.propertyName === 'transform' && drift(e.currentTarget)}
          >
            <span>{ch}</span>
          </div>
        ))}
      </div>

      <dialog id="lightbox" ref={lightbox} onClick={() => lightbox.current.close()}>
        {zoomed && <img src={zoomed} alt="" />}
      </dialog>
    </div>
  );
}
