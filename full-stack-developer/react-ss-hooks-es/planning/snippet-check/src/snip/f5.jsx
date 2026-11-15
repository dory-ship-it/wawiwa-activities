import { useEffect, useState } from 'react';

// F5 film: the first custom hook
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function TitleWithHook() {
  const [pomodoros, setPomodoros] = useState(0);
  useDocumentTitle(`Pomodoros: ${pomodoros}`);
  return (
    <div>
      <p id="out">{pomodoros}</p>
      <button id="btn" onClick={() => setPomodoros(pomodoros + 1)}>+1</button>
    </div>
  );
}

// F5 film + P-5 solution (task 6): same as video 14, which runs correctly
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);
  return [storedValue, setStoredValue];
}

export function Greeting() {
  const [name, setName] = useLocalStorage('userName', '');
  return (
    <div>
      <h1 id="out">Hola, {name || 'invitado'}</h1>
      <input id="inp" value={name} onChange={(e) => setName(e.target.value)} />
      <button id="btn" onClick={() => setName('')}>Borrar nombre</button>
    </div>
  );
}

// Original video 16, as shown on screen (no response.ok check)
export function useDataApiOrig(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [url]);
  return { data, isLoading, error };
}

// What the narration of video 16 literally describes: setIsLoading(false) after the chain
export function useDataApiNarrated(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setError(error));
    setIsLoading(false);
  }, [url]);
  return { data, isLoading, error };
}

// F5 film + P-5 solution (task 7): corrected, checks response.ok
export function useDataApi(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [url]);
  return { data, isLoading, error };
}

function makeView(hook) {
  return function View() {
    const url = new URLSearchParams(location.search).get('url');
    const { data, isLoading, error } = hook(url);
    window.__states = window.__states || [];
    window.__states.push(isLoading ? 'loading' : error ? 'error' : data ? 'data' : 'empty');
    if (isLoading) return <p id="out">Cargando...</p>;
    if (error) return <p id="out">Error: {error.message}</p>;
    return <p id="out">{data ? JSON.stringify(data).slice(0, 60) : 'sin datos'}</p>;
  };
}
export const ApiOrig = makeView(useDataApiOrig);
export const ApiNarrated = makeView(useDataApiNarrated);
export const ApiFixed = makeView(useDataApi);
