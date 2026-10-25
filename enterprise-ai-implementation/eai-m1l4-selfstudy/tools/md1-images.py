# MD1-W (25 Oct 2026): the MD1 chapter photos for the module. Never overwrites an existing file.
#   1. the six MD1 originals (2752 x 1536) move from assets/img/l4/md1/ to assets/img/_originals/md1/
#   2. web versions written back to assets/img/l4/md1/ (same names): max 1600 px on the long side,
#      JPG quality 82, optimized, progressive
#   3. two reused V2 images copied (not moved) the same way: ch1-intro.jpg, ch3-toolkit.jpg
# Usage: py -I tools/md1-images.py
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
MD1, ORIG = IMG / 'l4' / 'md1', IMG / '_originals' / 'md1'
NEW = ['o1-lanes-office.jpg', 'ch2-why-map.jpg', 'ch4-hr-demo.jpg', 'ch5-critical-eye.jpg', 'ch6-build-yours.jpg', 'ch7-wrap-up.jpg']
REUSE = {'ch1-intro.jpg': IMG / 'v2' / 'v2-01-dana-phone.jpg', 'ch3-toolkit.jpg': IMG / 'v2' / 'v2-04-three-channels.jpg'}


def web(src: Path, dst: Path):
    if dst.exists():
        raise SystemExit(f'exists, not overwritten: {dst}')
    with Image.open(src) as im:
        im = im.convert('RGB')
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
        print(f'{dst.relative_to(ROOT)}: {im.size[0]} x {im.size[1]}, {dst.stat().st_size // 1024} KB (from {src.relative_to(ROOT)})')


ORIG.mkdir(parents=True, exist_ok=True)
for name in NEW:
    o = ORIG / name
    if not o.exists():
        if (ORIG / name).exists():
            raise SystemExit(f'exists, not overwritten: {o}')
        shutil.move(str(MD1 / name), str(o))
        print(f'moved {name} -> {o.relative_to(ROOT)}')
    web(o, MD1 / name)
for name, src in REUSE.items():
    web(src, MD1 / name)
