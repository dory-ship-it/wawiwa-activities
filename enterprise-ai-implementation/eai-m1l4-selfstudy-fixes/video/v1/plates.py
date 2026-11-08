"""V1 photo plates: writes one prompt file per shot (assets/img/prompts/v1/) and generates the
24 images with tools/generate_image.py (Gemini) into assets/img/v1/.

Style: planning/IMAGE STYLE.md (business editorial photography). 1980s shots get the period
variant: warm faded colour and film grain. No logos, no company names, no readable text,
all people synthetic.

Usage (from the module folder):
  py -3 -X utf8 video/v1/plates.py            generate every missing image
  py -3 -X utf8 video/v1/plates.py 05 09      (re)generate these shots only
"""
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

MODULE = Path(__file__).resolve().parents[2]
PROMPTS = MODULE / "assets/img/prompts/v1"
OUT = MODULE / "assets/img/v1"
STYLE_REF = "assets/img/refs/style-office-team.jpg"

MODERN = (
    "Editorial business photograph, {subject}, natural daylight from large windows, shallow depth of "
    "field (85 mm lens, f/2), background softly blurred, subtle cool color grade with deep navy shadows "
    "and muted teal accents, natural skin tones, realistic texture, professional but not formal clothing "
    "in neutral or navy tones, photorealistic, high detail, {framing}."
)
EIGHTIES = (
    "Documentary editorial photograph taken in the early 1980s on 35 mm color film, {subject}, "
    "period-accurate clothing, hairstyles, furniture and office equipment of the early 1980s, warm faded "
    "colors with slightly lifted blacks and soft amber highlights, visible fine film grain, soft "
    "fluorescent and window light, natural skin tones, realistic texture, photorealistic, {framing}."
)
COMMON = (
    " Wide 16:9 frame. Keep the lower quarter of the frame calm and uncluttered (a caption will sit "
    "there). All people are fictional and AI-generated, not any real person. Every paper, screen, "
    "sign and cover carries no readable writing: text appears only as soft blur or abstract grey lines. "
    "No logos, no brand names, no company names, no watermark."
    "\n\nAvoid: illustration, cartoon, 3D render, neon, hologram, glowing icons, exaggerated smile, "
    "thumbs up, logos, readable text, letters, numbers, watermark, extra fingers, distorted hands."
)

# id, name, era, subject, framing, refs (shot ids generated earlier, for continuity)
SHOTS = [
    ("00", "title-quiet-office", "modern",
     "an empty modern meeting room in the early evening, a long table, a whiteboard on the wall with a "
     "faint hand-drawn process flow of boxes and arrows, no people",
     "wide establishing shot, darker tones overall so white title text stays readable over it", []),
    # Scene 1: the problem
    ("01", "s1-tired-team-paperwork", "modern",
     "a tired team of four office workers at a shared desk buried in paperwork, piles of folders and "
     "printed forms, one rubbing her eyes, one leaning on his hand, late afternoon light",
     "medium wide shot at desk height", []),
    ("02", "s1-new-computer-same-mess", "modern",
     "a brand-new sleek computer monitor and keyboard just placed on the same cluttered desk, still "
     "surrounded by the same piles of folders and printed forms, nothing else has changed, no people in "
     "focus",
     "medium shot, the new monitor slightly left of center, paper piles framing it", ["01"]),
    # Scene 2: HBR 1990
    ("03", "s2-old-journal", "modern",
     "a hand opening an old printed business journal from around 1990 on a wooden desk, yellowed "
     "paper, columns of text that are completely unreadable, a warm desk lamp beside it",
     "close-up from slightly above, the open pages fill the middle of the frame", []),
    ("04", "s2-taking-process-apart", "modern",
     "a woman in her 30s pulling paper sticky notes off a wall-mounted process board, taking the "
     "process apart, several notes already in her hand, empty spaces on the board",
     "medium shot from the side, the board on the right, her hands in focus", []),
    ("05", "s2-old-and-new-computers", "modern",
     "an old beige early 1990s desktop computer with a bulky monitor standing next to a slim modern "
     "laptop on the same desk, both screens showing soft abstract unreadable content, a quiet office",
     "medium shot at desk height, the two machines side by side", []),
    # Scene 3: case one, early 1980s
    ("06", "s3-us-ap-hall-1980s", "eighties",
     "a huge open accounts payable office hall of an American company, long rows of metal desks, "
     "dozens of clerks, tall stacks of paper invoices and carbon forms, rotary phones, adding machines, "
     "filing cabinets along the walls, busy and crowded",
     "wide shot from a raised angle looking down the rows", []),
    ("07", "s3-small-japanese-office-1980s", "eighties",
     "a small, quiet and orderly Japanese accounts office doing the same kind of work with only a "
     "handful of calm Japanese clerks, neat desks, very little paper, tidy shelves",
     "medium wide shot at eye level, plenty of calm empty space", []),
    ("08", "s3-manager-overlooking-hall-1980s", "eighties",
     "a manager in a 1980s suit standing at the glass window of an upper office, looking down at the "
     "crowded accounts payable hall full of desks and paper, thoughtful, seen from behind at an angle",
     "medium shot, the manager on the left third, the busy hall blurred below on the right", ["06"]),
    # Scene 4: what the mapping found
    ("09", "s4-three-documents", "eighties",
     "close-up of three different paper business forms side by side on a desk, a purchase order, a "
     "receiving slip and an invoice, each a different color and layout, two hands comparing them line "
     "by line with a pencil, all writing unreadable",
     "close-up from above at a slight angle", []),
    ("10", "s4-warehouse-receipt-terminal", "eighties",
     "a warehouse clerk in a work jacket typing a goods receipt into an old beige computer terminal with "
     "a green monochrome screen, cardboard boxes and pallets behind him, screen content unreadable",
     "medium shot from the side, the terminal in the foreground", []),
    ("11", "s4-calm-department-1980s", "eighties",
     "the same accounts payable office hall, now calm and spacious, far fewer clerks, most desks "
     "removed, small neat piles of paper, people working at an easy pace",
     "wide shot from a raised angle looking down the room", ["06"]),
    # Scene 5: case two, 2024 to 2025
    ("12", "s5-modern-service-center", "modern",
     "a busy modern customer service center, rows of service reps with headsets in front of monitors, "
     "large wall screens with abstract charts",
     "wide shot along the rows", [STYLE_REF]),
    ("13", "s5-phone-chat", "modern",
     "a hand holding a smartphone showing a customer service chat conversation, chat bubbles with "
     "unreadable blurred text, a softly blurred living room behind",
     "close-up, the phone screen angled slightly", []),
    ("14", "s5-quieter-center", "modern",
     "the same modern customer service center, now quieter, only a few service reps with headsets, many "
     "empty chairs and dark monitors",
     "wide shot along the rows", ["12"]),
    # Scene 6: the fall
    ("15", "s6-rep-headset", "modern",
     "a service rep in his 30s wearing a headset at his desk, listening attentively, serious face",
     "medium close-up, subject in the upper two thirds of the frame", [STYLE_REF]),
    ("16", "s6-new-reps-training", "modern",
     "a group of six newly hired service reps in a training room, sitting with notebooks and headsets, "
     "a trainer standing and explaining",
     "medium wide shot from the back corner of the room", [STYLE_REF]),
    ("17", "s6-simple-request-done", "modern",
     "a relaxed young woman on a sofa glancing at her smartphone with mild satisfaction, a simple "
     "request just sorted out, a cup of coffee beside her, screen not visible",
     "medium shot at eye level, bright calm home interior", []),
    ("18", "s6-frustrated-customer", "modern",
     "a frustrated middle-aged customer at a kitchen table on the phone, papers and bills spread in "
     "front of him, hand on forehead, a complex personal problem",
     "medium shot at eye level, warm home interior", []),
    # Scene 7: the fix
    ("19", "s7-leadership-review", "modern",
     "a small leadership meeting in a glass-walled room, three executives around a table looking at a "
     "printed chart, sober and reflective mood, one with arms crossed",
     "medium wide shot through the glass, slightly from the side", []),
    ("20", "s7-hybrid-split", "modern",
     "a split screen diptych divided by a thin clean vertical line in the middle: on the left half a "
     "computer workstation quietly handling a simple customer request on its own, no person; on the "
     "right half a woman service rep with a headset speaking with warmth and care to a customer on a call",
     "two equal halves, the same color grade on both sides", [STYLE_REF]),
    # Scene 8: the lesson
    ("21", "s8-two-eras-side-by-side", "mixed",
     "a split screen diptych divided by a thin clean vertical line in the middle: on the left half a "
     "crowded early 1980s accounts payable office with rows of desks and paper invoices, warm faded film "
     "colors and grain; on the right half a modern customer service center with headsets and monitors, "
     "cool navy and teal grade",
     "two equal halves", ["06", "12"]),
    ("22", "s8-drawing-process-map", "modern",
     "a woman in her 40s drawing a process map on a whiteboard with a marker, boxes connected by "
     "arrows, all labels unreadable scribbles, a colleague watching",
     "medium shot from behind her shoulder, the whiteboard filling most of the frame", []),
    ("23", "s8-reviewing-the-numbers", "modern",
     "a professional at a desk reviewing a printed report with simple bar charts, pen in hand, a laptop "
     "beside it, figures and labels unreadable, focused calm expression",
     "medium close-up from the side, the report in sharp focus", []),
]


def prompt_for(era, subject, framing):
    if era == "eighties":
        base = EIGHTIES
    elif era == "mixed":
        base = ("Editorial photograph, {subject}, natural skin tones, realistic texture, shallow depth of "
                "field, photorealistic, high detail, {framing}.")
    else:
        base = MODERN
    return base.format(subject=subject, framing=framing) + COMMON


def run(shot):
    sid, name, era, subject, framing, refs = shot
    PROMPTS.mkdir(parents=True, exist_ok=True)
    pfile = PROMPTS / f"{sid}-{name}.md"
    pfile.write_text(f"# V1 {sid} {name}\n\n## Prompt\n{prompt_for(era, subject, framing)}\n", encoding="utf-8")
    out = OUT / f"{sid}-{name}.jpg"
    cmd = [sys.executable, "-X", "utf8", "tools/generate_image.py", "--prompt-file", str(pfile.relative_to(MODULE)),
           "--out", str(out.relative_to(MODULE)), "--aspect", "16:9", "--size", "2K"]
    for r in refs:
        path = r if "/" in r else next(str(p.relative_to(MODULE)) for p in OUT.glob(f"{r}-*.jpg"))
        cmd += ["--ref", path]
    for attempt in (1, 2):
        res = subprocess.run(cmd, cwd=MODULE, capture_output=True, text=True, encoding="utf-8")
        if res.returncode == 0:
            print(f"{sid} ok  {res.stdout.strip()}", flush=True)
            return True
        print(f"{sid} FAIL (try {attempt}) {res.stderr.strip()[:300]}", flush=True)
    return False


def main():
    only = set(sys.argv[1:])
    if only:
        todo = [s for s in SHOTS if s[0] in only]
    else:
        todo = [s for s in SHOTS if not list(OUT.glob(f"{s[0]}-*.jpg"))]
    ids = {s[0] for s in SHOTS}
    first = [s for s in todo if not any(r in ids for r in s[5])]
    second = [s for s in todo if s not in first]
    ok = True
    for wave in (first, second):
        with ThreadPoolExecutor(max_workers=4) as ex:
            ok = all(ex.map(run, wave)) and ok
    print("done" if ok else "some shots failed")


if __name__ == "__main__":
    main()
