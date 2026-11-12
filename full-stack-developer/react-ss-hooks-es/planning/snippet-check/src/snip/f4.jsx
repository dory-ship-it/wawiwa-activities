import { useEffect, useRef, useState } from 'react';

// F4 film + P-4 solution (task 4): focus the input
export function FocusTask() {
  const inputRef = useRef(null);
  function handleFocus() {
    inputRef.current.focus();
  }
  return (
    <div>
      <input id="inp" ref={inputRef} type="text" placeholder="Nueva tarea" />
      <button id="btn" onClick={handleFocus}>Escribir tarea</button>
    </div>
  );
}

// F4 near-miss: plain variable for the previous value
export function PrevWithLet() {
  const [count, setCount] = useState(0);
  let prev;
  useEffect(() => {
    prev = count;
  }, [count]);
  return (
    <div>
      <p id="out">Ahora: {count}, antes: {String(prev)}</p>
      <button id="btn" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// F4 film + P-4 solution (task 5): previous value with useRef
export function PreviousValue() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(null);
  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);
  return (
    <div>
      <p id="out">Ahora: {count}, antes: {String(prevCountRef.current)}</p>
      <button id="btn" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// Original video 12, as shown: useRef() with no initial value
export function OrigPrevious() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();
  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);
  return (
    <div>
      <h1 id="out">Now: {count}, Before: {String(prevCountRef.current)}</h1>
      <button id="btn" onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// P-4: which change causes a re-render?
export function RefVsState() {
  const [stateClicks, setStateClicks] = useState(0);
  const refClicks = useRef(0);
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div>
      <p id="out">estado: {stateClicks} | ref: {refClicks.current}</p>
      <button id="btn" onClick={() => setStateClicks(stateClicks + 1)}>estado +1</button>
      <button id="btn2" onClick={() => { refClicks.current += 1; }}>ref +1</button>
    </div>
  );
}

// P-4: does focus() cause a render? count renders in a ref, log from an effect with no array
export function FocusRenders() {
  const inputRef = useRef(null);
  useEffect(() => { console.log('render'); });
  return (
    <div>
      <input id="inp" ref={inputRef} />
      <button id="btn" onClick={() => inputRef.current.focus()}>foco</button>
      <p id="out">x</p>
    </div>
  );
}
