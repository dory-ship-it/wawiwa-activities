import { useState } from 'react';
import * as f1 from './snip/f1.jsx';
import * as f2 from './snip/f2.jsx';
import * as f3 from './snip/f3.jsx';
import * as f4 from './snip/f4.jsx';
import * as f5 from './snip/f5.jsx';
import * as r2 from './snip/r2.jsx';

const ALL = { ...f1, ...f2, ...f3, ...f4, ...f5, ...r2 };

export default function App() {
  const name = new URLSearchParams(location.search).get('c');
  const [mounted, setMounted] = useState(true);
  const C = ALL[name];
  if (!C) return <p>unknown: {name}</p>;
  return (
    <div>
      <button id="unmount" onClick={() => setMounted(!mounted)}>toggle</button>
      {mounted && <C />}
      {new URLSearchParams(location.search).get('tall') && <div style={{ height: 4000 }} />}
    </div>
  );
}
