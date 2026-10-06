// Robust loader: evaluates the Storyline globalProvideData call as JS.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
export function load(path) {
  const src = readFileSync(path, 'utf8').replace(/^﻿/, '');
  let out = null;
  const ctx = { window: { globalProvideData: (k, v) => { out = JSON.parse(v); } } };
  vm.runInNewContext(src, ctx);
  return out;
}
