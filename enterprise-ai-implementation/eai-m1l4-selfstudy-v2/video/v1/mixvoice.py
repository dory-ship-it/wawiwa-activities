"""Lays a film's Kokoro clips on its timeline and normalises loudness (two-pass loudnorm), writing
video/<film>/out/voice.wav for render2.mjs. No music here: render2.mjs mixes the bed in.

Usage (from the module folder): py -3 -X utf8 video/v1/mixvoice.py v2
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

FD = Path(__file__).resolve().parent.parent / (sys.argv[1] if len(sys.argv) > 1 else "v1")
TL = json.loads((FD / "timeline.json").read_text(encoding="utf-8"))
OUT = FD / "out"
SR = 24000


def main():
    OUT.mkdir(exist_ok=True)
    lead = TL["rules"]["lead"]
    mix = np.zeros(int((TL["duration"] + 0.5) * SR), dtype=np.float32)
    over = []
    for c in TL["captions"]:
        a, r = sf.read(FD / "tts" / c["clip"], dtype="float32")
        s = int((c["start"] + lead) * SR)
        mix[s:s + len(a)] += a
        if c["start"] + lead + len(a) / SR > c["end"] + 1e-3:
            over.append(c["id"])
    print("timing:", "speech fits every caption slot" if not over else f"OVERRUN in {over}")
    raw, norm = OUT / "voice-raw.wav", OUT / "voice.wav"
    sf.write(raw, mix[: int(TL["duration"] * SR)], SR)
    r1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                         "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8").stderr
    m = json.loads(r1[r1.rindex("{"): r1.rindex("}") + 1])
    af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, "-ar", "48000", str(norm)], check=True)
    print(f"{norm} {TL['duration']} s")


if __name__ == "__main__":
    main()
