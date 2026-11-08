"""V1 music bed, composed in code (no licence to clear): soft pad chords, a gentle plucked arpeggio and a
light pulse at 96 BPM, in A minor (Am, F, C, G). Deterministic: the same file on every run.

Usage (from the module folder): py -3 -X utf8 video/v1/music.py [seconds]   writes video/v1/out/music.wav
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
BPM = 96
BEAT = 60 / BPM
OUT = Path(__file__).resolve().parent / "out" / "music.wav"
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G (MIDI)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)  # gentle 2nd-order style roll-off
    return np.fft.irfft(X, len(x))


def env(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return e


def main():
    dur = float(sys.argv[1]) if len(sys.argv) > 1 else 180.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    mix = np.zeros(n)
    bar = 4 * BEAT
    rng = np.random.default_rng(7)

    # pad: detuned saws softened, one chord per bar, long crossfades
    pad = np.zeros(n)
    for k in range(int(dur / bar) + 1):
        s, e = int(k * bar * SR), min(n, int((k + 1) * bar * SR + 1.0 * SR))
        if s >= n:
            break
        tt = t[s:e] - t[s]
        chord = CHORDS[k % 4]
        seg = np.zeros(e - s)
        for m in chord + [chord[0] - 12]:
            for det in (-0.08, 0.08):
                f = hz(m) * 2 ** (det / 12)
                seg += 2 * ((tt * f) % 1) - 1
        pad[s:e] += seg * env(e - s, 0.9, 1.2)
    mix += lowpass(pad, 900) * 0.035

    # arpeggio: plucked sine with soft decay on eighth notes
    step = BEAT / 2
    for k in range(int(dur / step)):
        s = int(k * step * SR)
        chord = CHORDS[int(k * step / bar) % 4]
        m = (chord + [chord[0] + 12])[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]] + 12
        L = min(n - s, int(0.6 * SR))
        if L <= 0:
            break
        tt = np.arange(L) / SR
        mix[s:s + L] += np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 7) * 0.05

    # pulse: soft kick on beats 1 and 3, shaker on off-beats
    for k in range(int(dur / BEAT)):
        s = int(k * BEAT * SR)
        L = min(n - s, int(0.25 * SR))
        if L <= 0:
            break
        tt = np.arange(L) / SR
        if k % 2 == 0:
            mix[s:s + L] += np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14) * 0.12
        so = s + int(BEAT / 2 * SR)
        Ls = min(n - so, int(0.05 * SR))
        if Ls > 0:
            mix[so:so + Ls] += rng.standard_normal(Ls) * np.exp(-np.arange(Ls) / SR * 90) * 0.012

    mix *= env(n, 2.0, 3.0)
    mix /= np.max(np.abs(mix)) + 1e-9
    OUT.parent.mkdir(exist_ok=True)
    sf.write(OUT, np.stack([mix, mix], 1).astype(np.float32) * 0.8, SR)
    print(f"{OUT} {dur:.1f} s")


if __name__ == "__main__":
    main()
