import { useEffect, useState } from 'react';

// F3 near-miss: timer without cleanup
export function TimerNoCleanup() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setInterval(() => {
      console.log('tic');
      setSeconds((s) => s + 1);
    }, 1000);
  }, []);
  return <p id="out">{seconds}</p>;
}

// F3 trap: stale value inside the interval
export function TimerStale() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <p id="out">{seconds}</p>;
}

// F3 film + P-3 solution (task 3): timer with cleanup
export function Timer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    console.log('Temporizador iniciado');
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(id);
      console.log('Temporizador detenido');
    };
  }, []);
  return <p id="out">{seconds}</p>;
}

// F3 near-miss: scroll listener without cleanup
export function ScrollNoCleanup() {
  useEffect(() => {
    const handleScroll = () => console.log('scroll');
    window.addEventListener('scroll', handleScroll);
  }, []);
  return <div style={{ height: 3000 }}><p id="out">Desplázate</p></div>;
}

// F3 film: scroll listener with cleanup
export function ScrollWatcher() {
  useEffect(() => {
    const handleScroll = () => console.log('scroll');
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div style={{ height: 3000 }}><p id="out">Desplázate</p></div>;
}

// Original video 4 slide: cleanup example
export function OrigCleanupSlide() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Timer running...');
    }, 1000);
    return () => {
      clearInterval(timer);
      console.log('Timer stopped.');
    };
  }, []);
  return <p id="out">slide</p>;
}

// Original video 6, as shown (only an h1, page may not scroll)
export function OrigWindowScroll() {
  useEffect(() => {
    const handleScroll = () => { console.log('Window scrolled'); };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);
  return <div><h1 id="out">Window scroll log</h1></div>;
}
