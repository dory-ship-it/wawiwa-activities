"""V2 re-cut (19 Oct 2026, Noy: images should not repeat): every still at most twice (wide + one crop),
each Veo clip split into three different pieces, and chart-only scenes (bg) where a field is explained.
Rewrites the shots of video/v2/motion.json; graphics stay, except the amber note moves onto the clip.

Usage (from the module folder): py -3 -X utf8 video/v2/recut.py
"""
import json
from pathlib import Path

F = Path(__file__).resolve().parent / "motion.json"
M = json.loads(F.read_text(encoding="utf-8"))
I = "assets/img/v2/"
C = "assets/video/clips/v2/"


def clip(name, still, at, off, **kw):
    return {"img": I + still, "video": C + name, "offset": off, "at": at, "cut": True, **kw}


def still(name, at, cam, **kw):
    return {"img": I + name, "at": at, "cut": True, "cam": cam, **kw}


def chart(at):
    return {"bg": True, "at": at, "cut": True, "width": 768, "cam": [[1.0, 0, 0], [1.0, 0, 0]]}


W = {"width": 768}
CAM = [[1.0, 0, 0], [1.06, 0, 0]]
shots = [
    # 1 situation (full screen)
    clip("C01-dana-phone.mp4", "v2-01-dana-phone.jpg", "0", 0, cam=CAM),
    still("v2-03-inbox-phone.jpg", "c01@0.5", [[1.05, 0, 0], [1.22, -4, 0]], dim=0.2),
    clip("C06-three-channels.mp4", "v2-04-three-channels.jpg", "c02", 0, cam=CAM, dim=0.2),
    clip("C06-three-channels.mp4", "v2-04-three-channels.jpg", "c02@0.5", 3.3, cam=[[1.15, 6, 0], [1.2, 6, 0]], dim=0.2),
    clip("C01-dana-phone.mp4", "v2-01-dana-phone.jpg", "c03", 3.3, cam=[[1.1, 8, 0], [1.14, 8, 0]], dim=0.15),
    clip("C01-dana-phone.mp4", "v2-01-dana-phone.jpg", "c04", 6.6, cam=CAM, dim=0.1),
    # 2 not yet; the picture narrows to 60% at "First we map"
    clip("C04-laptop-close.mp4", "v2-02-laptop-closed.jpg", "c05", 0, cam=CAM, dim=0.15),
    clip("C04-laptop-close.mp4", "v2-02-laptop-closed.jpg", "c06", 3.3, cam=[[1.08, 0, 0], [1.12, 0, 0]], dim=0.15, width=768, narrowAt="c06@0.4"),
    clip("C04-laptop-close.mp4", "v2-02-laptop-closed.jpg", "c07", 6.6, cam=[[1.12, 4, 0], [1.16, 4, 0]], dim=0.15, **W),
    # 3 fields 1 and 2, stop 1
    still("v2-01-dana-phone.jpg", "c08", [[1.45, 12, -6], [1.6, 14, -7]], dim=0.2, **W),
    still("v2-03-inbox-phone.jpg", "c08@0.6", [[1.4, -8, 2], [1.55, -10, 2]], dim=0.2, **W),
    still("v2-04-three-channels.jpg", "c09", [[1.0, 4, 0], [1.14, 6, 0]], dim=0.2, **W),
    clip("C06-three-channels.mp4", "v2-04-three-channels.jpg", "c10", 6.6, cam=[[1.12, 8, 0], [1.16, 8, 0]], dim=0.2, **W),
    # 4 channels, boundaries
    still("v2-04-three-channels.jpg", "c11", [[1.45, 14, -2], [1.3, 12, -2]], dim=0.2, **W),
    still("v2-06-lanes-office.jpg", "c12", [[1.0, 0, 0], [1.18, 0, 2]], dim=0.25, **W),
    still("v2-06-lanes-office.jpg", "c13", [[1.5, -10, 4], [1.25, -6, 2]], dim=0.25, **W),
    # 5 steps: photo, chart, photo
    still("v2-05-policy-binder.jpg", "c14", [[1.0, 6, 0], [1.18, 8, 0]], dim=0.2, **W),
    chart("c15@0.4"),
    still("v2-05-policy-binder.jpg", "c16", [[1.5, -4, 6], [1.32, -2, 4]], dim=0.25, **W),
    # 6 lanes on the chart background, stop 2; 7 gateway, the handoff on video, checklist
    chart("c17"),
    clip("C09-handoff.mp4", "v2-07-handoff.jpg", "c20", 0, cam=[[1.05, 6, 0], [1.1, 6, 0]], dim=0.05, **W),
    clip("C09-handoff.mp4", "v2-07-handoff.jpg", "c20@0.55", 3.3, cam=[[1.2, 12, 0], [1.25, 12, 0]], dim=0.05, **W),
    chart("c21"),
    clip("C09-handoff.mp4", "v2-07-handoff.jpg", "c22", 6.6, cam=[[1.25, 14, 0], [1.3, 14, 0]], dim=0.1, **W),
    # 8 knowledge sources: photo, crop, scale chart, then the manager at his desk
    still("v2-08-manager-binder.jpg", "c23", [[1.2, -10, 0], [1.05, -10, 0]], dim=0.15, **W),
    still("v2-08-manager-binder.jpg", "c23@0.55", [[1.5, -16, 4], [1.62, -18, 4]], dim=0.2, **W),
    chart("c24@0.2"),
    still("v2-07-handoff.jpg", "c25@0.4", [[1.4, -20, 2], [1.5, -22, 2]], dim=0.35, **W),
    # 9 controls, stop 3
    still("v2-09-sent-alone.jpg", "c26", [[1.0, 0, 0], [1.16, 2, 0]], dim=0.15, **W),
    still("v2-09-sent-alone.jpg", "c27", [[1.55, -10, 2], [1.7, -12, 2]], dim=0.15, **W),
    still("v2-10-sent-message.jpg", "c28", [[1.0, 0, 0], [1.08, 0, 0]], dim=0.2, **W),
    # 10 no formal control
    still("v2-10-sent-message.jpg", "c29", [[1.4, -8, 0], [1.25, -6, 0]], dim=0.2, **W),
    still("v2-01-dana-phone.jpg", "c30", [[1.05, 4, 0], [1.16, 6, 0]], dim=0.2, **W),
    # 11 gaps
    still("v2-11-old-messages.jpg", "c31", [[1.0, 6, 0], [1.16, 8, 0]], dim=0.15, **W),
    still("v2-11-old-messages.jpg", "c32@0.4", [[1.6, -6, 10], [1.75, -8, 11]], dim=0.15, **W),
    still("v2-02-laptop-closed.jpg", "c33", [[1.4, 12, -4], [1.55, 14, -5]], dim=0.2, **W),
    # 12 success metric: photo, bar chart, Dana close
    still("v2-12-dana-board.jpg", "c34", [[1.0, 8, 0], [1.14, 10, 0]], dim=0.1, **W),
    chart("c35"),
    still("v2-12-dana-board.jpg", "c37", [[1.45, 20, -4], [1.3, 18, -3]], dim=0.1, **W),
]
M["shots"] = shots

# the amber "no single channel" now sits on the handoff clip instead of the second lanes chart
G = M["graphics"]
lanesB = [g for g in G if g["type"] == "lanes"][1]
lanesB["to"] = "c21.end+0.2"
lanesB.pop("amberAt", None)
if not any(g.get("tag") == "amber-on-clip" for g in G):
    G.insert(G.index(lanesB) + 1, {"type": "pills", "tag": "amber-on-clip", "area": "left", "from": "c22", "to": "c22.end+0.3", "y": 560, "size": 34, "items": [{"text": "no single channel", "style": "amber", "at": "c22@0.1"}]})
F.write_text(json.dumps(M, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

uses = {}
for s in shots:
    if not s.get("video") and s.get("img"):
        uses[s["img"].split("/")[-1]] = uses.get(s["img"].split("/")[-1], 0) + 1
print(len(shots), "shots;", sum(1 for s in shots if s.get("video")), "clip pieces;", sum(1 for s in shots if s.get("bg")), "chart scenes")
print("still uses:", uses, "max", max(uses.values()))
