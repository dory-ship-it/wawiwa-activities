# -*- coding: utf-8 -*-
"""One Wawiwa logo, the same one, on every EAI practice page.

WHY
---
Dor, 23 Sep 2026: "Home practice in module 2 has a weird logo. The class
practice doesn't have a logo at all. Either take it off or make all of them
align with the same correct, good-looking logo."

He was right on both counts. Before this script the programme had three
different answers:

  the 6 M2 homework pages   <div class="logo">wawiwa</div>, a red rectangle
                            with the word typed into it. No speech-bubble
                            tail, wrong weight, wrong letterforms.
  the 24 M1 pages           a hand-drawn SVG in the Practice Studio runtime:
                            the right idea - box, tail, wordmark - but the
                            wordmark is Roboto 800, not the real typeface.
  M2 class, M3, M4          nothing at all.

Now all of them show the real mark, from
Template + Logo 2023/JustWawiwa-Logo-1000x425px-trans.png, trimmed of its
transparent margin and reduced to a 64-colour palette PNG at 271x102 - 2.6 KB,
3.5 KB as base64, small enough to inline in every page without thinking about
it. It is displayed at 34 CSS px tall, so 102px is a 3x asset and stays crisp
on a retina screen.

HOW
---
CSS only. Not one byte of any page's markup changes: the block hides whatever
logo the page already had and paints the real one as a background image on the
element that was already there, or on a ::before where there was none. Each
family needs a different hook, so the script picks the selector by looking at
the page:

  .masthead present     -> restyle .logo            (M2 homework)
  .m-topbar present     -> restyle .m-logo          (M1 mission shell)
  <header> present      -> header::before           (M2 class family)
  .head present         -> .head::before            (M4 family)
  otherwise             -> .wrap::before            (M3 family)

The block goes in just before the page's first </style>, fenced by sentinels,
so the script is idempotent and so the M1 clean-sheet script can keep
rewriting its own fenced block independently.

Run:  python3 _apply_logo.py

Run it AFTER _apply_m1_clean_sheet.py, not before: both write their block
in front of the first </style>, so whichever runs last sits last and wins.
Nothing in the two blocks actually collides today, but the logo should be
the one with the final say about the logo.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MARK_A = '/* >>> WAWIWA LOGO >>> */'
MARK_B = '/* <<< WAWIWA LOGO <<< */'

DATA = 'data:image/png;base64,' + open(
    os.path.join(HERE, '_wawiwa-logo.b64'), encoding='utf-8').read().strip()

# 271 x 102 in the file; shown at 34px tall, so 90.3px wide.
COMMON = """
  --w-logo: url("%s");
  --w-logo-h: 34px;
  --w-logo-w: 90px;
""" % DATA


def _mark(selector, extra=''):
    """A logo painted on `selector`, whatever that element used to hold."""
    return (
        '%s{\n'
        '  background-image: var(--w-logo);\n'
        '  background-repeat: no-repeat;\n'
        '  background-position: left center;\n'
        '  background-size: contain;\n'
        '  background-color: transparent;\n'
        '  width: var(--w-logo-w);\n'
        '  height: var(--w-logo-h);\n'
        '  flex: 0 0 auto;\n'
        '  border: none;\n'
        '  border-radius: 0;\n'
        '  padding: 0;\n'
        '  box-shadow: none;\n'
        '  filter: none;\n'
        '%s}\n' % (selector, extra))


def block_for(body):
    """Which element carries the logo on this page."""
    if 'class="masthead"' in body:
        # the old red box with the word typed inside it: keep the element,
        # drop the text, paint the real mark on it
        return (':root{%s}\n' % COMMON
                + _mark('.masthead .logo',
                        '  font-size: 0;\n  color: transparent;\n  line-height: 0;\n')
                + '.masthead{ align-items: center; }\n')
    if 'm-topbar' in body:
        # the runtime draws an <svg> inside span.m-logo; hide it and paint over
        return (':root{%s}\n' % COMMON
                + _mark('.m-topbar .m-logo')
                + '.m-topbar .m-logo svg{ display: none; }\n')
    if re.search(r'<header[\s>]', body):
        return (':root{%s}\n' % COMMON
                + _mark('header::before', '  content: "";\n  display: block;\n'
                                          '  margin: 0 0 14px;\n'))
    if 'class="head"' in body:
        return (':root{%s}\n' % COMMON
                + _mark('.head::before', '  content: "";\n  display: block;\n'
                                         '  margin: 0 0 16px;\n'))
    return (':root{%s}\n' % COMMON
            + _mark('.wrap::before', '  content: "";\n  display: block;\n'
                                     '  margin: 0 0 16px;\n'))


def apply_to(path):
    s = open(path, encoding='utf-8').read()
    body_before = s[s.index('<body'):]
    s = re.sub(re.escape(MARK_A) + r'.*?' + re.escape(MARK_B), '', s, flags=re.S)
    block = '\n' + MARK_A + '\n' + block_for(s[s.index('<body'):]) + MARK_B + '\n'
    en = s.index('</style>')
    out = s[:en] + block + s[en:]
    assert out[out.index('<body'):] == body_before, 'BODY CHANGED: ' + path
    open(path, 'w', encoding='utf-8').write(out)
    return re.search(r'^([.\w-]+(?:::before)?|\.masthead \.logo|\.m-topbar \.m-logo)\{',
                     block_for(body_before), re.M).group(1)


def strip(path):
    """Take the block back out of a page that should not carry it."""
    s = open(path, encoding='utf-8').read()
    if MARK_A not in s:
        return False
    out = re.sub(r'\n?' + re.escape(MARK_A) + r'.*?' + re.escape(MARK_B) + r'\n?',
                 '', s, flags=re.S)
    open(path, 'w', encoding='utf-8').write(out)
    return True


def is_live(name):
    """The pages a student actually reaches.

    The bare m1* folders are the superseded first generation - the registry
    lists them under "Superseded / archive (do not embed)". They keep whatever
    logo they were built with; two of them carry their own logo element that
    this block would not hide, and re-skinning a page nobody opens is risk for
    no return."""
    return (name.startswith('eai-m1') or name.startswith('eai-m3')
            or name.startswith('eai-m4') or name.startswith('m2'))


def main():
    names = sorted(d for d in os.listdir(HERE)
                   if os.path.isfile(os.path.join(HERE, d, 'index.html')))
    done, skipped, stripped = {}, [], []
    for n in names:
        p = os.path.join(HERE, n, 'index.html')
        if not is_live(n):
            skipped.append(n)
            if strip(p):
                stripped.append(n)
            continue
        sel = apply_to(p)
        done.setdefault(sel, []).append(n)
        print('  %-34s %s' % (n, sel))
    total = sum(len(v) for v in done.values())
    print('\n%d live pages, one logo:' % total)
    for sel, pages in sorted(done.items()):
        print('  %-24s %d pages' % (sel, len(pages)))
    print('  skipped (superseded/archive): %d%s' % (
        len(skipped), '  (block removed from %d)' % len(stripped) if stripped else ''))


if __name__ == '__main__':
    main()
