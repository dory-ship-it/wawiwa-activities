/* React Hooks self-study practices: the fit to the Rise frame, moving between screens, and the
   screen types (choice, multi, order, steps, paste, value, solution, takeaway). Every word the
   learner sees is already in the page, written by shared/build.mjs from strings.<lang>.js.
   This file holds none. */
(function(){
  "use strict";
  var d=document, root=d.documentElement;
  var W=1000, H=560;
  var framed=true; try{ framed=window.self!==window.top; }catch(_){}

  /* Fit: the canvas keeps its design size and scales to the frame. Rise keeps the embed's
     width:height ratio, so inside Rise it fills the frame exactly. Opened on its own it is centred. */
  function fit(){
    var s=Math.min(innerWidth/W, innerHeight/H);
    if(!framed) s=Math.min(s,1.25);
    root.style.setProperty("--s", s.toFixed(4));
  }
  fit(); addEventListener("resize", fit);

  var all=function(sel,el){ return [].slice.call((el||d).querySelectorAll(sel)); };
  var screens=all(".screen"), N=screens.length, cur=-1;
  var steps=all(".steps li[data-step]"), live=d.getElementById("live");
  var pg=d.getElementById("pg"), bar=d.getElementById("bar"), main=d.getElementById("main");

  /* Screen-reader announcement: repeats text that is already on the page */
  function say(text){ live.textContent=""; setTimeout(function(){ live.textContent=text; },40); }

  function go(i, focus){
    if(i<0||i>=N) return;
    cur=i;
    screens.forEach(function(el,k){ el.hidden=k!==i; });
    var step=+screens[i].getAttribute("data-step");
    steps.forEach(function(li){
      var n=+li.getAttribute("data-step");
      li.className=n===step?"on":n<step?"done":"";
      if(n===step) li.setAttribute("aria-current","step"); else li.removeAttribute("aria-current");
    });
    pg.textContent=(i+1)+" / "+N;
    bar.style.width=Math.round(100*i/(N-1||1))+"%";
    main.scrollTop=0;
    if(focus){ var h=screens[i].querySelector(".ins"); if(h) h.focus({preventScroll:true}); }
  }

  /* Same rule for every typed answer: trimmed, lower case, accents ignored, closing dot ignored */
  function norm(s){
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim().replace(/[.!]+$/,"");
  }
  function list(v){ return (v||"").split("\n").map(norm); }
  function nums(v){ return (v||"").split(" ").filter(Boolean).map(Number); }
  function same(a,b){ return a.length===b.length && a.every(function(x,k){ return x===b[k]; }); }

  screens.forEach(function(el){
    var type=el.getAttribute("data-type");
    var next=el.querySelector("[data-next]");
    var fbs=all(".fb[hidden], .fb[data-fb], .fb[data-k], .reveal", el);
    function show(node){ fbs.forEach(function(f){ if(f.hasAttribute("data-k")||f.hasAttribute("data-fb")) f.hidden=f!==node; }); }

    if(next) next.addEventListener("click", function(){ go(cur+1,true); });

    if(type==="choice"){
      var opts=all(".opt", el), after=el.querySelector("[data-after]"), group=el.querySelector(".opts");
      /* The check-in shows its options in a new order on every visit */
      var shuffle=function(){
        if(!group.hasAttribute("data-shuffle")) return;
        for(var k=opts.length;k>0;k--) group.appendChild(group.children[Math.floor(Math.random()*k)]);
      };
      opts.forEach(function(b){
        b.addEventListener("click", function(){
          var ok=b.hasAttribute("data-ok"), box=el.querySelector('.fb[data-k="'+b.getAttribute("data-k")+'"]');
          opts.forEach(function(o){ o.classList.remove("is-no"); });
          b.classList.add(ok?"is-ok":"is-no");
          show(box);
          say(box.textContent);
          if(ok){
            opts.forEach(function(o){ o.disabled=true; });
            if(after) after.hidden=false;
            if(next){ next.disabled=false; next.focus(); }
          }
        });
      });
      el.reset=function(){
        opts.forEach(function(o){ o.disabled=false; o.classList.remove("is-ok","is-no"); });
        show(null); if(after) after.hidden=true; if(next) next.disabled=true; shuffle();
      };
      shuffle();
    }

    else if(type==="multi"){
      var boxes=all(".opt", el), check=el.querySelector("[data-check]");
      var okM=el.querySelector('[data-fb="ok"]'), noM=el.querySelector('[data-fb="no"]');
      var on=function(b){ return b.getAttribute("aria-pressed")==="true"; };
      boxes.forEach(function(b){
        b.addEventListener("click", function(){ b.setAttribute("aria-pressed", on(b)?"false":"true"); show(null); });
      });
      check.addEventListener("click", function(){
        var right=boxes.every(function(b){ return on(b)===b.hasAttribute("data-ok"); });
        show(right?okM:noM);
        say((right?okM:noM).textContent);
        if(right){
          boxes.forEach(function(b){ b.disabled=true; if(on(b)) b.classList.add("is-ok"); });
          check.disabled=true;
          if(next){ next.disabled=false; next.focus(); }
        }
      });
      el.reset=function(){
        boxes.forEach(function(b){ b.disabled=false; b.setAttribute("aria-pressed","false"); b.classList.remove("is-ok"); });
        check.disabled=false; show(null); if(next) next.disabled=true;
      };
    }

    else if(type==="order"){
      var pool=el.querySelector(".pool"), slots=all(".slot", el), picks=all(".pk", el);
      var answer=nums(el.querySelector("[data-answer]").getAttribute("data-answer"));
      var okO=el.querySelector('[data-fb="ok"]'), noO=el.querySelector('[data-fb="no"]');
      var placed=function(){ return slots.map(function(s){ return s.firstElementChild; }); };
      var home=function(b){
        /* Back to the pool, in its first position */
        var after=picks.filter(function(p){ return p.parentNode===pool && +p.getAttribute("data-i")>+b.getAttribute("data-i"); })[0];
        pool.insertBefore(b, after||null);
      };
      picks.forEach(function(b){
        b.addEventListener("click", function(){
          picks.forEach(function(p){ p.classList.remove("wrong"); });
          show(null);
          if(b.parentNode!==pool){ home(b); b.focus(); return; }
          var free=slots.filter(function(s){ return !s.firstElementChild; })[0];
          if(!free) return;
          free.appendChild(b);
          var now=placed();
          if(now.some(function(p){ return !p; })){
            say(b.querySelector("span").textContent);
            (pool.querySelector(".pk")||b).focus();
            return;
          }
          var got=now.map(function(p){ return +p.getAttribute("data-v"); }), right=same(got, answer);
          show(right?okO:noO);
          say((right?okO:noO).textContent);
          if(right){
            picks.forEach(function(p){ p.disabled=true; });
            if(next){ next.disabled=false; next.focus(); }
          }else{
            var bad=now.filter(function(p,k){ return got[k]!==answer[k]; })[0];
            bad.classList.add("wrong"); bad.focus();
          }
        });
      });
      el.reset=function(){
        picks.forEach(function(p){ p.disabled=false; p.classList.remove("wrong"); pool.appendChild(p); });
        show(null); if(next) next.disabled=true;
      };
    }

    else if(type==="paste"){
      var data=el.querySelector("[data-known]"), ta=el.querySelector("textarea");
      var known=list(data.getAttribute("data-known")), expected=nums(data.getAttribute("data-expected"));
      var cmp=el.querySelector(".cmp"), mine=el.querySelector(".mine"), note=el.querySelector("[data-note]");
      var okP=el.querySelector('[data-fb="ok"]'), otherP=el.querySelector('[data-fb="other"]'), noneP=el.querySelector('[data-fb="none"]');
      var missing=all('[data-fb="missing"]', el);
      /* Chrome prints a repeated line once, with a count in front. A count at the start of a line is
         read as that many lines; and in case the count is lost on the way, two lines in a row that are
         the same count as one when the pasted text is compared with the expected list. */
      var squash=function(a){ return a.filter(function(x,k){ return k===0||x!==a[k-1]; }); };
      var read=function(text){
        var out=[];
        text.split(/\r?\n/).forEach(function(line){
          var l=norm(line), best=-1;
          known.forEach(function(t,k){ if(l.indexOf(t)>-1 && (best<0||t.length>known[best].length)) best=k; });
          var n=/^\s*(\d{1,2})(?![\d:.,])/.exec(line); n=n?+n[1]:1; if(n<2||n>50) n=1;
          if(best>-1) while(n--) out.push(best);
        });
        return out;
      };
      el.querySelector("[data-compare]").addEventListener("click", function(){
        var lines=read(ta.value), got=squash(lines), box;
        mine.textContent="";
        lines.forEach(function(k){ mine.appendChild(el.querySelector('template[data-chip="'+k+'"]').content.firstElementChild.cloneNode(true)); });
        if(!got.length) box=noneP;
        else if(same(got, squash(expected))) box=okP;
        else{
          box=missing.filter(function(m){ return got.indexOf(+m.getAttribute("data-line"))<0; })[0]||otherP;
        }
        cmp.hidden=!got.length;
        if(note) note.hidden=!got.length;
        show(box);
        say(box.textContent);
        /* The next screen opens once the page found console lines it knows, matching or not */
        if(next && got.length) next.disabled=false;
      });
      el.reset=function(){ ta.value=""; mine.textContent=""; cmp.hidden=true; if(note) note.hidden=true; show(null); if(next) next.disabled=true; };
    }

    else if(type==="value"){
      var form=el.querySelector("form"), input=form.querySelector("input");
      var expectedV=list(form.getAttribute("data-expected"));
      var pattern=form.hasAttribute("data-pattern")?new RegExp(form.getAttribute("data-pattern")):null;
      var okBox=el.querySelector('[data-fb="ok"]'), other=el.querySelector('[data-fb="other"]');
      var hints=all('[data-fb="hint"]', el);
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var raw=input.value.trim(), v=norm(raw), box=null;
        if(v!==""){
          if(expectedV.indexOf(v)>-1 || (pattern && pattern.test(raw))) box=okBox;
          else hints.forEach(function(h){ if(!box && !h.hasAttribute("data-any") && list(h.getAttribute("data-when")).indexOf(v)>-1) box=h; });
          /* A hint marked "any" answers every other value the learner types */
          if(!box) box=hints.filter(function(h){ return h.hasAttribute("data-any"); })[0]||null;
        }
        var shown=box||other;
        show(shown);
        if(shown) say(shown.textContent);
        /* The next screen opens once the learner has given an answer the page knows, right or not */
        if(next && box) next.disabled=false;
      });
      el.reset=function(){ input.value=""; show(null); if(next) next.disabled=true; };
    }
  });

  /* A code card with more than one file: the file names are buttons in its title bar */
  all("[data-tabs]").forEach(function(box){
    var tabs=all("[data-tab]", box), panes=all("[data-pane]", box);
    tabs.forEach(function(t){
      t.addEventListener("click", function(){
        var k=t.getAttribute("data-tab");
        tabs.forEach(function(x){ x.setAttribute("aria-pressed", x===t?"true":"false"); });
        panes.forEach(function(p){ p.hidden=p.getAttribute("data-pane")!==k; });
      });
    });
  });

  /* Copy, with fallbacks for frames that block the clipboard */
  all("[data-copy]").forEach(function(b){
    var t;
    function done(){ b.textContent=b.getAttribute("data-done"); say(b.getAttribute("data-live"));
      clearTimeout(t); t=setTimeout(function(){ b.textContent=b.getAttribute("data-idle"); },1800); }
    function legacy(text){
      var ta=d.createElement("textarea"); ta.value=text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.top="0"; ta.style.left="-9999px";
      d.body.appendChild(ta); ta.select(); var ok=false; try{ ok=d.execCommand("copy"); }catch(_){} d.body.removeChild(ta); b.focus();
      if(ok){ done(); return; }
      var ol=b.closest(".codebox").querySelector("ol:not([hidden])"), r=d.createRange(); r.selectNodeContents(ol);
      var sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
      b.textContent=b.getAttribute("data-select"); say(b.getAttribute("data-select"));
    }
    b.addEventListener("click", function(){
      var text=b.getAttribute("data-copy");
      try{
        if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function(){ legacy(text); });
        else legacy(text);
      }catch(_){ legacy(text); }
    });
  });

  all("[data-restart]").forEach(function(b){
    b.addEventListener("click", function(){ screens.forEach(function(el){ if(el.reset) el.reset(); }); go(0,true); });
  });

  go(0,false);
})();
