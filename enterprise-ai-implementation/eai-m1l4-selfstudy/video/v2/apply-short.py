"""Writes the approved shorter V2 narration (video/v2/narration-short.md, approved by Noy on 19 Oct 2026)
into screen V2 of content/l4-slice.json. Only the 12 narration strings and the V2 word count / length
target change; the rest of the file keeps its exact formatting. The original narration stays in the
frozen copy planning/content/l4-slice.json. Stops, questions and on-screen keywords are not touched.

Usage (from the module folder): py -3 -X utf8 video/v2/apply-short.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content/l4-slice.json"
MD = Path(__file__).resolve().parent / "narration-short.md"

rows = {}
for line in MD.read_text(encoding="utf-8").splitlines():
    m = re.match(r"^\| (\d+) \| (.+?) \| \d+ \(\d+\) \|$", line)
    if m:
        rows[int(m.group(1))] = m.group(2).strip()

text = CONTENT.read_text(encoding="utf-8")
v2 = next(s for s in json.loads(text)["screens"] if s["id"] == "V2")
assert sorted(rows) == [s["n"] for s in v2["production"]["segments"]]


def enc(s):
    return json.dumps(s, ensure_ascii=False)


for s in v2["production"]["segments"]:
    old, new = enc(s["narration"]), enc(rows[s["n"]])
    if old == new:
        continue
    assert text.count(old) == 1, f"segment {s['n']}: narration not found exactly once"
    text = text.replace(old, new)

prod = v2["production"]
words = sum(len(t.split()) for t in rows.values())
for key, val in (("words", words), ("lengthTarget", "about 2:45 with title card and brand end, plus 3 stops (shorter narration approved 19 Oct 2026)")):
    old = f'"{key}": {enc(prod[key])}'
    if text.count(old) == 1:
        text = text.replace(old, f'"{key}": {enc(val)}')
CONTENT.write_text(text, encoding="utf-8")
print(f"V2 narration updated: {len(rows)} segments, {words} words")
