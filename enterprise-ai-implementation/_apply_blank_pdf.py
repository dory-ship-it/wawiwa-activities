# -*- coding: utf-8 -*-
"""A "blank PDF" button on every hand-built EAI practice page (M2, M3, M4).

WHY
---
NewTech Romania trainers, feedback meeting 22 Oct 2026: a button that
downloads the template as an empty PDF, before it is filled in with the AI.
Module 1 is Practice Studio output and got the button in the engine
(Practice Studio 4f2e0e0). M2, M3 and M4 are hand-built pages that live only
here, so this script adds it to them, next to each page's own PDF button.
The existing PDF button and everything the student wrote stay as they were.

HOW
---
Two families, two mechanisms, each page keeps its own:

  M3 + M4 (eai-m3*, eai-m4*)  the page writes its own PDF (WPDF + pdfBuild,
      no browser print). The script adds a PDF_BLANK switch to pdfBuild:
      field labels stay, every answer becomes an empty ruled block, ticks
      and Yes/No are unmarked, selects are a blank line, the personal path
      is left out, and the title gets a "Blank template" line. A new
      "Download blank PDF" button downloads it as
      "Wawiwa - EAI M4 L1 - Class Practice - Blank template.pdf".

  M2 (m2*)  the page's PDF is the browser's Save as PDF (window.print with
      the margin-0 print fix). The new "Print blank / Save as PDF" button
      sets every field back to its authored default, lets the page's own
      input/change listener recompute its derived parts (progress, print
      mirrors, ROI, checklist), shows a "Blank template" line, prints, and
      on afterprint puts every value back and recomputes again. M2 pages
      do not autosave, so nothing is ever written while the fields are
      blank.

Every insertion is fenced with BLANK PDF sentinels; a page that already has
them is left alone, so the script is idempotent. It asserts each anchor is
found exactly once before writing.

Run:  python3 _apply_blank_pdf.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = 'BLANK PDF'
A = '/* >>> BLANK PDF >>> */'
B = '/* <<< BLANK PDF <<< */'


def once(s, find, path):
    n = s.count(find)
    assert n == 1, '%s: anchor found %d times: %r' % (path, n, find[:70])


def sub(s, find, repl, path):
    once(s, find, path)
    return s.replace(find, repl)


# ---------------------------------------------------------------- M3 + M4 --

WPDF_BUTTON = '<button class="pdf" id="mkpdf">Save as PDF</button>'

WPDF_LISTENER_END = """  if(!started||pdfDownloadBlocked()) pdfStandalone();
});
"""

WPDF_BLANK_LISTENER = A + """
/* the blank template: the same file, built with PDF_BLANK on, so it carries
   no answer, no tick, no choice and no personal path. Works at any time. */
document.getElementById('mkblank').addEventListener('click', function(){
  var bytes;
  PDF_BLANK=true;
  try{ bytes=pdfBuild(); }
  catch(err){ PDF_BLANK=false; pdfStandalone(); return; }
  PDF_BLANK=false;
  var started=false;
  try{
    var url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    var a=document.createElement('a');
    a.href=url; a.download=pdfFileName().replace(/\\.pdf$/,' - Blank template.pdf'); a.rel='noopener';
    a.style.cssText='position:fixed;left:-9999px;top:0;width:1px;height:1px';
    document.body.appendChild(a);
    a.click();
    started=true;
    setTimeout(function(){
      try{ a.parentNode.removeChild(a); }catch(e){}
      try{ URL.revokeObjectURL(url); }catch(e){}
    },5000);
  }catch(err2){ started=false; }
  if(!started||pdfDownloadBlocked()) pdfStandalone();
});
""" + B + '\n'


def apply_wpdf(s, path):
    # the button, beside the page's own Save as PDF
    s = sub(s, WPDF_BUTTON, WPDF_BUTTON
            + '\n    <button class="pdf" id="mkblank">Download blank PDF</button>', path)
    # the switch
    s = sub(s, 'function pdfBuild(){\n',
            A + '\nvar PDF_BLANK=false;\n' + B + '\nfunction pdfBuild(){\n', path)
    # a "Blank template" line under the title
    h1 = "d.text(pdfText(h1)||M.title||'Practice',{size:19,bold:true,col:'navy',lead:24,after:12});\n"
    s = sub(s, h1, h1 + "  if(PDF_BLANK) d.text('Blank template',{size:9.5,bold:true,col:'tealtx',after:10}); "
            "/* BLANK PDF */\n", path)
    # answers: the label stays, the answer is an empty ruled block
    s = sub(s, '  function answer(ta){\n    d.reserve(40);\n',
            '  ' + A + '\n'
            '  function blankLines(ta){\n'
            "    var n=Math.max(4,Math.min(10,(parseInt(ta.getAttribute('rows'),10)||3)+1)),j;\n"
            '    for(j=0;j<n;j++){ d.room(22); d.y-=22; d.line(d.x0+12,d.y,d.cw-12,0.6,WPDF.COL.rule); }\n'
            '    d.y-=10;\n'
            '  }\n'
            '  ' + B + '\n'
            '  function answer(ta){\n    d.reserve(PDF_BLANK?130:40);\n', path)
    s = sub(s, "    var v=String(ta.value||'').replace(",
            '    if(PDF_BLANK){ blankLines(ta); return; }\n'
            "    var v=String(ta.value||'').replace(", path)
    # ticks, Yes/No, selects, personal path
    s = sub(s, "cb.checked?'[x] '", "(cb.checked&&!PDF_BLANK)?'[x] '", path)
    sel = "var extra=sel?('  —  '+sel.value):'';"
    if sel in s:
        s = sub(s, sel, "var extra=sel?('  —  '+(PDF_BLANK?'____________':sel.value)):'';", path)
    s = sub(s, "var st=r?(r.value==='yes'?'Yes':'No'):'not answered';",
            "var st=PDF_BLANK?'Yes / No':(r?(r.value==='yes'?'Yes':'No'):'not answered');", path)
    s = sub(s, 'if(!po||po.hidden||!pdfText(po)) return;',
            'if(PDF_BLANK||!po||po.hidden||!pdfText(po)) return;', path)
    # the listener
    s = sub(s, WPDF_LISTENER_END, WPDF_LISTENER_END + WPDF_BLANK_LISTENER, path)
    return s


# --------------------------------------------------------------------- M2 --

M2_CLASS_BUTTON = '<button class="ghost" onclick="window.print()">Print / Save as PDF</button>'
M2_HOME_BUTTON = '<button class="btn btn-print" onclick="savePDF()">⬇ Save as PDF / Submit</button>'

M2_SCRIPT = '<script>\n' + A + """
/* the blank template: every field back to its authored default, the page's
   own input/change listener recomputes what it derives from them, the
   browser prints, and on afterprint every value comes back. Nothing is
   saved anywhere in between (these pages do not autosave). */
(function(){
  'use strict';
  function fields(){
    return [].slice.call(document.querySelectorAll('input,textarea,select')).filter(function(e){
      return !/^(button|submit|reset|hidden|file|image)$/.test(e.type||'');
    });
  }
  function nudge(list){
    list.forEach(function(e){
      e.dispatchEvent(new Event('input',{bubbles:true}));
      e.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }
  function blankPrint(){
    var list=fields();
    var saved=list.map(function(e){
      if(e.tagName==='SELECT') return [].map.call(e.options,function(o){ return o.selected; });
      if(e.type==='checkbox'||e.type==='radio') return e.checked;
      return e.value;
    });
    list.forEach(function(e){
      if(e.tagName==='SELECT') [].forEach.call(e.options,function(o){ o.selected=o.defaultSelected; });
      else if(e.type==='checkbox'||e.type==='radio') e.checked=e.defaultChecked;
      else e.value=e.defaultValue;
    });
    nudge(list);
    var tag=document.createElement('p');
    tag.className='w-blank-tag';
    tag.textContent='Blank template';
    var head=document.querySelector('header, .masthead');
    if(head&&head.parentNode) head.parentNode.insertBefore(tag, head.nextSibling);
    else document.body.insertBefore(tag, document.body.firstChild);
    var done=false;
    function restore(){
      if(done) return; done=true;
      list.forEach(function(e,i){
        if(e.tagName==='SELECT') [].forEach.call(e.options,function(o,k){ o.selected=saved[i][k]; });
        else if(e.type==='checkbox'||e.type==='radio') e.checked=saved[i];
        else e.value=saved[i];
      });
      nudge(list);
      if(tag.parentNode) tag.parentNode.removeChild(tag);
      window.removeEventListener('afterprint',restore);
      ['pointerdown','keydown','focusin'].forEach(function(t){ document.removeEventListener(t,restore,true); });
    }
    window.addEventListener('afterprint',restore);
    /* a browser that never fires afterprint: the first touch afterwards restores */
    setTimeout(function(){
      ['pointerdown','keydown','focusin'].forEach(function(t){ document.addEventListener(t,restore,true); });
    },0);
    window.print();
  }
  var b=document.getElementById('mkblank');
  if(b) b.addEventListener('click', blankPrint);
})();
""" + B + '\n</script>\n'

M2_STYLE = ('<style>' + A + '\n'
            '.w-blank-tag{display:none}\n'
            '@media print{.w-blank-tag{display:block;margin:0 0 10px;font:600 12px/1.4 sans-serif;'
            'letter-spacing:.08em;text-transform:uppercase;color:#2E6E76}}\n'
            + B + '</style>\n')


def apply_m2(s, path):
    if M2_CLASS_BUTTON in s:
        s = sub(s, M2_CLASS_BUTTON, M2_CLASS_BUTTON
                + '\n    <button class="ghost" id="mkblank" type="button">Print blank / Save as PDF</button>', path)
    else:
        s = sub(s, M2_HOME_BUTTON, M2_HOME_BUTTON
                + '\n  <button class="btn btn-clear" id="mkblank" type="button">Print blank / Save as PDF</button>', path)
    s = sub(s, '</head>', M2_STYLE + '</head>', path)
    s = sub(s, '</body>', M2_SCRIPT + '</body>', path)
    return s


# ------------------------------------------------------------------- main --

def family(name):
    if name.startswith('eai-m3') or name.startswith('eai-m4'):
        return 'wpdf'
    if name.startswith('m2'):
        return 'm2'
    return None


def main():
    names = sorted(d for d in os.listdir(HERE)
                   if os.path.isfile(os.path.join(HERE, d, 'index.html')))
    done, already = [], []
    for n in names:
        fam = family(n)
        if not fam:
            continue
        p = os.path.join(HERE, n, 'index.html')
        s = open(p, encoding='utf-8').read()
        if MARK in s:
            already.append(n)
            continue
        body_before = s.count('<button')
        out = apply_wpdf(s, p) if fam == 'wpdf' else apply_m2(s, p)
        assert out.count('<button') == body_before + 1, 'BUTTON COUNT: ' + p
        open(p, 'w', encoding='utf-8').write(out)
        done.append((n, fam))
        print('  %-36s %s' % (n, fam))
    print('\n%d pages got the blank PDF button; %d already had it.' % (len(done), len(already)))


if __name__ == '__main__':
    sys.exit(main())
