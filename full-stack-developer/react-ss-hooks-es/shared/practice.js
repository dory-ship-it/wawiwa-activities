/* React Hooks self-study practices: the fit to the Rise frame, moving between screens, and the
   screen types (choice, steps, value, solution, takeaway). Every word the learner sees is already in
   the page, written by shared/build.mjs from strings.<lang>.js. This file holds none. */
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
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim().replace(/[.!]+$/,"");
  }
  function list(v){ return (v||"").split("\n").map(norm); }

  screens.forEach(function(el){
    var type=el.getAttribute("data-type");
    var next=el.querySelector("[data-next]");
    var fbs=all(".fb[hidden], .fb[data-fb], .fb[data-k], .reveal", el);
    function show(node){ fbs.forEach(function(f){ if(f.hasAttribute("data-k")||f.hasAttribute("data-fb")) f.hidden=f!==node; }); }

    if(next) next.addEventListener("click", function(){ go(cur+1,true); });

    if(type==="choice"){
      var opts=all(".opt", el), after=el.querySelector("[data-after]");
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
        show(null); if(after) after.hidden=true; if(next) next.disabled=true;
      };
    }

    else if(type==="value"){
      var form=el.querySelector("form"), input=form.querySelector("input");
      var expected=list(form.getAttribute("data-expected"));
      var okBox=el.querySelector('[data-fb="ok"]'), other=el.querySelector('[data-fb="other"]');
      var hints=all('[data-fb="hint"]', el);
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var v=norm(input.value), box=null;
        if(expected.indexOf(v)>-1) box=okBox;
        else hints.forEach(function(h){ if(!box && list(h.getAttribute("data-when")).indexOf(v)>-1) box=h; });
        var known=!!box;
        show(box||other);
        say((box||other).textContent);
        /* The next screen opens once the learner has given an answer the page knows, right or not */
        if(next && known) next.disabled=false;
      });
      el.reset=function(){ input.value=""; show(null); if(next) next.disabled=true; };
    }
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
      var ol=b.closest(".codebox").querySelector("ol"), r=d.createRange(); r.selectNodeContents(ol);
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
