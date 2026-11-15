import { useEffect, useRef, useState } from 'react';
import { useLocalStorage, useDataApi } from './f5.jsx';

// P-3 wrong option: clear right after starting
export function TimerClearNow() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    clearInterval(id);
  }, []);
  return <p id="out">{seconds}</p>;
}
// P-3 wrong option: [seconds] in the array, no cleanup
export function TimerDepsNoCleanup() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [seconds]);
  return <p id="out">{seconds}</p>;
}
// P-3 new predict: resize listener
export function ResizeNoCleanup() {
  useEffect(() => {
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
  }, []);
  return <p id="out">r</p>;
}
export function ResizeWithCleanup() {
  useEffect(() => {
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return <p id="out">r</p>;
}
// P-4 hint for "3": writing the ref during render
export function PrevInRender() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(null);
  prevCountRef.current = count;
  return (
    <div>
      <p id="out">Ahora: {count}, antes: {String(prevCountRef.current)}</p>
      <button id="btn" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
// P-5: two components with the same key
function ThemeBox({ id }) {
  const [theme, setTheme] = useLocalStorage('tema', 'claro');
  return <div><span id={'t' + id}>{theme}</span><button id={'b' + id} onClick={() => setTheme('oscuro')}>oscuro</button></div>;
}
export function TwoThemes() { return <div><ThemeBox id="1" /><ThemeBox id="2" /><p id="out">x</p></div>; }
// P-5: url switch, with and without setError(null)
function useDataApiNoReset(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((res) => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
      .then((json) => setData(json))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [url]);
  return { data, isLoading, error };
}
function switcher(hook) {
  return function S() {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/users/999');
    const { data, isLoading, error } = hook(url);
    return <div><button id="btn" onClick={() => setUrl('https://jsonplaceholder.typicode.com/users/1')}>ok</button>
      <p id="out">{isLoading ? 'Cargando...' : error ? 'Error: ' + error.message : data ? data.name : 'sin datos'}</p></div>;
  };
}
export const SwitchReset = switcher(useDataApi);
export const SwitchNoReset = switcher(useDataApiNoReset);
