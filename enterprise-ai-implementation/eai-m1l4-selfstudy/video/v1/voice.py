"""V1 narration: voices every caption of film.json with Kokoro (af_heart) and lays the captions out on
the timeline from the real speech lengths. Writes video/v1/timeline.json (generated, never by hand).

Rules: title card 0 to 4.0 s; caption slot = lead + speech + tail; gap 0.35 s inside a segment,
0.8 s between segments; a 1.2 s silent hold after the segments with a stop, the stop 0.4 s into the
hold; brand end 0.3 s after the last caption, held 4.0 s.

Usage (from the module folder): py -3 -X utf8 video/v1/voice.py
"""
import hashlib
import json
import sys
from pathlib import Path

import soundfile as sf

# film folder: video/v1 by default, or the one named on the command line (voice.py v2)
HERE = Path(__file__).resolve().parent.parent / sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent
TTS = HERE / "tts"
MODEL_DIRS = [TTS, Path(__file__).resolve().parent / "tts", Path.home() / "Desktop/Wawiwa/Self- Study/Full Stack/Node/film-src/tts"]
FILM = json.loads((HERE / "film.json").read_text(encoding="utf-8"))
V = FILM["voice"]
T = dict(titleEnd=4.0, lead=V.get("lead", 0.15), tail=0.2, gap=0.3, segGap=0.7, hold=1.2, stopInHold=0.4,
         brandGap=0.3, brandHold=4.0)
T.update(FILM.get("timing", {}))

_k = None


def model_path(name):
    for d in MODEL_DIRS:
        if (d / name).exists():
            return str(d / name)
    raise SystemExit(f"Kokoro model file {name} not found in {[str(d) for d in MODEL_DIRS]}")


def clip(say):
    global _k
    h = hashlib.sha1(f"{V['voice']}|{V['speed']}|{say}".encode()).hexdigest()[:16]
    p = TTS / f"{h}.wav"
    if not p.exists():
        if _k is None:
            from kokoro_onnx import Kokoro
            _k = Kokoro(model_path("kokoro-v1.0.onnx"), model_path("voices-v1.0.bin"))
        a, r = _k.create(say, voice=V["voice"], speed=V["speed"], lang=V["lang"])
        sf.write(p, a, r)
    info = sf.info(p)
    return p.name, info.frames / info.samplerate


def main():
    TTS.mkdir(exist_ok=True)
    r3 = lambda x: round(x, 3)
    stopAfter = {h["after"]: h["id"] for h in FILM["holds"]}
    caps, holds, stops, segs = [], [], [], {}
    t, prevSeg = T["titleEnd"], None
    for c in FILM["captions"]:
        name, d = clip(c["say"])
        if prevSeg is not None:
            t += T["gap"] if c["seg"] == prevSeg else T["segGap"]
        start, end = t, t + T["lead"] + d + T["tail"]
        caps.append(dict(id=c["id"], seg=c["seg"], text=c["text"], say=c["say"], clip=name, speech=r3(d),
                         start=r3(start), end=r3(end)))
        segs.setdefault(c["seg"], r3(start))
        print(f"{c['id']} s{c['seg']} {start:7.2f} {end:7.2f}  speech {d:5.2f}  {c['text'][:58]}")
        t, prevSeg = end, c["seg"]
        if c["id"] in stopAfter:
            sid = stopAfter[c["id"]]
            holds.append(dict(id=sid, after=c["id"], start=r3(t), end=r3(t + T["hold"])))
            stops.append(dict(id=sid, t=r3(t + T["stopInHold"])))
            t += T["hold"]
    brandAt = r3(caps[-1]["end"] + T["brandGap"])
    out = dict(
        id=FILM["id"], fps=FILM["fps"], size=FILM["size"], generatedFrom="film.json + Kokoro speech lengths (voice.py)",
        rules=T, titleEnd=T["titleEnd"], captions=caps, holds=holds, stops=stops,
        segments=[dict(n=n, t=v) for n, v in sorted(segs.items())],
        brandAt=brandAt, duration=r3(brandAt + T["brandHold"]),
    )
    (HERE / "timeline.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    d = out["duration"]
    print(f"\nstops {[(s['id'], s['t']) for s in stops]}; brand end {brandAt}; duration {d} s ({int(d // 60)}:{round(d % 60):02d})")


if __name__ == "__main__":
    main()
