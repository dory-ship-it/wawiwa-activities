// Film and audio speeds (Noy, 23 Nov 2026; standard 1.7): 0.5, 0.75, Normal, 1.25, 1.5, 2, the same in the
// film player's speed menu and the podcast's speed chip. The learner's last choice is kept for the session
// (every film and audio plays at it; sessionStorage when allowed, else this page's memory).
import { localKey } from './config.js?v=c6cd176a';

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let sessionRate = null;

export function readRate() {
  if (sessionRate) return sessionRate;
  try { const r = Number(sessionStorage.getItem(localKey('speed'))); if (SPEEDS.includes(r)) return r; } catch { /* storage blocked */ }
  return 1;
}

export function keepRate(r) {
  sessionRate = r;
  try { sessionStorage.setItem(localKey('speed'), String(r)); } catch { /* storage blocked */ }
}
