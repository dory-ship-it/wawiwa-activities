import { useState } from 'react';

// F1 film: Valeria's pomodoro counter
export function PomodoroCounter() {
  const [pomodoros, setPomodoros] = useState(0);
  return (
    <div>
      <p id="out">Pomodoros: {pomodoros}</p>
      <button id="btn" onClick={() => setPomodoros(pomodoros + 1)}>+1</button>
    </div>
  );
}

// F1 film: toggle (different subject from the practice task)
export function DoneTasksToggle() {
  const [showDone, setShowDone] = useState(false);
  return (
    <div>
      <button id="btn" onClick={() => setShowDone(!showDone)}>
        {showDone ? 'Ocultar terminadas' : 'Mostrar terminadas'}
      </button>
      {showDone && <p id="out">Repasar arrays</p>}
    </div>
  );
}

// P-1 predict: two updates in one click, from the same snapshot
export function DoubleClickPredict() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p id="out">{count}</p>
      <button id="btn" onClick={() => { setCount(count + 1); setCount(count + 1); }}>+2?</button>
    </div>
  );
}

// P-1 predict, variant: functional updater
export function DoubleClickUpdater() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p id="out">{count}</p>
      <button id="btn" onClick={() => { setCount((c) => c + 1); setCount((c) => c + 1); }}>+2</button>
    </div>
  );
}

// P-1 solution (task 1): show and hide a message
export function ShowHideMessage() {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <div>
      <h1>Mostrar y ocultar</h1>
      <button id="btn" onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Ocultar' : 'Mostrar'}
      </button>
      {isVisible && <p id="out">Este es un mensaje.</p>}
    </div>
  );
}

// Original video 2 (counter), as shown
export function OrigCounter() {
  const [counter, setCounter] = useState(0);
  return (
    <div>
      <h1>Counter</h1>
      <p id="out">{counter}</p>
      <button id="btn" onClick={() => setCounter(counter + 1)}>Increment</button>
    </div>
  );
}

// F1 near-miss: a plain variable is not state
export function CounterWithLet() {
  let pomodoros = 0;
  return (
    <div>
      <p id="out">Pomodoros: {pomodoros}</p>
      <button id="btn" onClick={() => { pomodoros = pomodoros + 1; }}>+1</button>
    </div>
  );
}
