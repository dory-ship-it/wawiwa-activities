import { useEffect, useState } from 'react';

// F2 near-miss: fetch with NO dependency array (runs after every render)
export function PartnerNoDeps() {
  const [partner, setPartner] = useState(null);
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/2')
      .then((res) => res.json())
      .then((data) => setPartner(data));
  });
  return <p id="out">{partner ? partner.name : 'Cargando...'}</p>;
}

// F2 film: fetch once, empty array
export function Partner() {
  const [partner, setPartner] = useState(null);
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/2')
      .then((res) => res.json())
      .then((data) => setPartner(data));
  }, []);
  return <p id="out">{partner ? `Compañero de hoy: ${partner.name}` : 'Cargando...'}</p>;
}

// F2 film: document title follows the counter
export function PomodoroTitle() {
  const [pomodoros, setPomodoros] = useState(0);
  useEffect(() => {
    document.title = `Pomodoros: ${pomodoros}`;
  }, [pomodoros]);
  return (
    <div>
      <p id="out">{pomodoros}</p>
      <button id="btn" onClick={() => setPomodoros(pomodoros + 1)}>+1</button>
    </div>
  );
}

// P-2: three effects, three dependency arrays
export function ThreeEffects() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  useEffect(() => { console.log('A: sin arreglo'); });
  useEffect(() => { console.log('B: arreglo vacío'); }, []);
  useEffect(() => { console.log('C: depende de count'); }, [count]);
  return (
    <div>
      <button id="btn" onClick={() => setCount(count + 1)}>+1</button>
      <input id="inp" value={name} onChange={(e) => setName(e.target.value)} />
      <p id="out">{count}</p>
    </div>
  );
}

// P-2 solution (task 2): first user's name
export function FirstUser() {
  const [users, setUsers] = useState(null);
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);
  return <p id="out">{users ? users[0].name : 'Cargando...'}</p>;
}

// Original video 5: post title
export function OrigPost() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);
  return <p id="out">{data ? data.title : 'Loading...'}</p>;
}
