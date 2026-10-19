"""V2 script builder: reads screen V2 of content/l4-slice.json and writes video/v2/film.json in the same
shape as video/v1/film.json (captions with shown `text` and spoken `say`, holds after the stop segments,
voice settings). Captions are the narration's sentences, verbatim; sentences under 5 words join the next
one in the same segment. Narration comes from the content only.

Usage (from the module folder): py -3 -X utf8 video/v2/script.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
content = json.loads((ROOT / "content/l4-slice.json").read_text(encoding="utf-8"))
V2 = next(s for s in content["screens"] if s["id"] == "V2")
SEGS = V2["production"]["segments"]

# spoken-only fixes: shown text stays verbatim
SAY_FIXES = {"AS-IS": "as is"}


def sentences(text):
    parts = re.split(r"(?<=[.?!])\s+", text.strip())
    out = []
    for p in parts:
        if out and len(out[-1].split()) < 5:
            out[-1] = out[-1] + " " + p
        else:
            out.append(p)
    if len(out) > 1 and len(out[-1].split()) < 4:
        out[-2] = out[-2] + " " + out.pop()
    return out


def say(t):
    for k, v in SAY_FIXES.items():
        t = t.replace(k, v)
    return t


captions, holds, k = [], [], 0
for seg in SEGS:
    for s in sentences(seg["narration"]):
        k += 1
        captions.append({"id": f"c{k:02d}", "seg": seg["n"], "text": s, "say": say(s)})
    if seg.get("stopAfter"):
        holds.append({"id": seg["stopAfter"], "after": captions[-1]["id"]})

words = sum(len(s["narration"].split()) for s in SEGS)
joined = " ".join(c["text"] for c in captions)
assert joined.split() == " ".join(s["narration"] for s in SEGS).split(), "captions differ from the narration"
film = {
    "id": "v2", "fps": 25, "size": [1280, 720],
    "voice": {"engine": "kokoro-onnx", "voice": "af_heart", "speed": 1.1, "lang": "en-us", "lead": 0.15},
    "timing": {"tail": 0.15, "gap": 0.22, "segGap": 0.55},
    "title": V2["title"], "captions": captions, "holds": holds,
}
(HERE / "film.json").write_text(json.dumps(film, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{len(captions)} captions, {words} words, holds after {[h['after'] for h in holds]}")
