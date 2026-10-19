"""V1: lays the Kokoro clips on the timeline, two-pass loudnorm, muxes with video/v1/out/silent.mp4, and
writes the VTT and the cue file. No music, no effects.

With every image present it writes assets/video/v1.mp4, v1.en.vtt, v1.cues.json, v1-poster.jpg.
While any image is a placeholder (out/status.json draft) it writes review/p2/v1-draft.mp4 only.

Usage (from the module folder): py -3 -X utf8 video/v1/make.py
"""
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
MODULE = HERE.parents[1]
OUT = HERE / "out"
TL = json.loads((HERE / "timeline.json").read_text(encoding="utf-8"))
STATUS = json.loads((OUT / "status.json").read_text(encoding="utf-8"))
SR = 24000


def ts(x):
    ms = round(x * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}"


def main():
    lead = TL["rules"]["lead"]
    mix = np.zeros(int((TL["duration"] + 0.5) * SR), dtype=np.float32)
    problems = []
    for c in TL["captions"]:
        a, r = sf.read(HERE / "tts" / c["clip"], dtype="float32")
        if r != SR:
            raise SystemExit(f"{c['clip']}: sample rate {r}, expected {SR}")
        s = int((c["start"] + lead) * SR)
        mix[s:s + len(a)] += a
        if c["start"] + lead + len(a) / SR > c["end"] + 1e-3:
            problems.append(c["id"])
    print("timing:", "speech fits every caption slot" if not problems else f"OVERRUN in {problems}")
    raw, norm = OUT / "voice-raw.wav", OUT / "voice.wav"
    sf.write(raw, mix[: int(TL["duration"] * SR)], SR)
    r1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                         "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8").stderr
    m = json.loads(r1[r1.rindex("{"): r1.rindex("}") + 1])
    af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, "-ar", "48000", str(norm)], check=True)

    draft = STATUS["draft"]
    dest = MODULE / ("review/p2/v1-draft.mp4" if draft else "assets/video/v1.mp4")
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT / "silent.mp4"), "-i", str(norm), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(dest)], check=True)

    vtt = ["WEBVTT", ""]
    for c in TL["captions"]:
        vtt += [c["id"], f"{ts(c['start'])} --> {ts(c['end'])}", c["text"], ""]
    cues = {"id": "v1", "duration": TL["duration"], "fps": TL["fps"],
            "stops": [{"id": s["id"], "t": s["t"]} for s in TL["stops"]],
            "segments": [{"n": s["n"], "t": s["t"]} for s in TL["segments"]]}
    vdir = OUT if draft else MODULE / "assets/video"
    (vdir / "v1.en.vtt").write_text("\n".join(vtt), encoding="utf-8")
    (vdir / "v1.cues.json").write_text(json.dumps(cues, indent=1) + "\n", encoding="utf-8")
    if not draft:
        shutil.copy(OUT / "poster.jpg", vdir / "v1-poster.jpg")
    mb = dest.stat().st_size / 1e6
    print(f"{'DRAFT (placeholders: ' + ', '.join(STATUS['missing']) + ')' if draft else 'final'}: {dest.relative_to(MODULE)} "
          f"{mb:.1f} MB, {TL['duration']} s; stops {[(s['id'], s['t']) for s in TL['stops']]}")


if __name__ == "__main__":
    main()
