/* Final project Day pages: navigation, Rules and Map sheets, Copy, and the fit to the Rise frame.
   Every word the learner sees is in the page (built from strings.<lang>.js); this file holds none. */
(function(){
  var d=document, root=d.documentElement;
  var W=880, H=640;
  var framed=true; try{ framed=window.self!==window.top; }catch(_){}

  /* Fit: the canvas keeps its design size and scales to the frame. Rise keeps the embed's
     width:height ratio, so inside Rise it fills the frame exactly. Opened on its own it is centred. */
  function fit(){
    var s=Math.min(innerWidth/W, innerHeight/H);
    if(!framed) s=Math.min(s,1.25);
    root.style.setProperty("--s", s.toFixed(4));
  }
  fit(); addEventListener("resize", fit);

  var screens=[].slice.call(d.querySelectorAll(".screen")), N=screens.length, cur=-1;
  var dashes=[].slice.call(d.querySelectorAll(".prog i"));
  var back=d.getElementById("backBtn"), cta=d.getElementById("ctaBtn"), live=d.getElementById("live");
  var key="fp."+location.pathname.replace(/\/(index[^/]*)?$/,"").split("/").pop()+".screen";
  var reduce=function(){ return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  /* Shrinks a screen only if its content would not fit (it should not happen at the design size) */
  function shrink(el){
    var inner=el.firstElementChild; inner.style.zoom=1;
    var cs=getComputedStyle(el), avail=el.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    var need=inner.getBoundingClientRect().height/(parseFloat(root.style.getPropertyValue("--s"))||1);
    if(need>avail) inner.style.zoom=Math.max(.8, avail/need);
  }

  function go(i, focus){
    if(i<0||i>=N||i===cur) return;
    cur=i;
    screens.forEach(function(el,k){ var on=k===i; el.classList.toggle("is-active",on); el.inert=!on; });
    dashes.forEach(function(x,k){ x.className=k<i?"done":k===i?"now":""; });
    cta.textContent=screens[i].getAttribute("data-cta");
    back.classList.toggle("is-off", i===0); back.disabled=i===0;
    d.querySelectorAll("[data-go]").forEach(function(b){ if(+b.getAttribute("data-go")===i) b.setAttribute("aria-current","step"); else b.removeAttribute("aria-current"); });
    shrink(screens[i]);
    try{ history.replaceState(null,"","#"+(i+1)); }catch(_){}
    try{ localStorage.setItem(key,String(i)); }catch(_){}
    if(focus){ var h=screens[i].querySelector(".title"); setTimeout(function(){ h.focus({preventScroll:true}); },40); }
  }
  function start(){
    var h=parseInt(location.hash.slice(1),10); if(h>=1&&h<=N) return h-1;
    try{ var v=parseInt(localStorage.getItem(key),10); if(v>=0&&v<N) return v; }catch(_){}
    return 0;
  }

  /* The last screen hands over to Rise: it scrolls the page that holds this frame so the
     Continue button under the embed comes into view. */
  function finish(){
    var end=d.getElementById("end");
    try{ end.scrollIntoView({block:"center", behavior:reduce()?"auto":"smooth"}); }catch(_){ end.scrollIntoView(false); }
  }
  cta.addEventListener("click",function(){ if(cur<N-1) go(cur+1,true); else finish(); });
  back.addEventListener("click",function(){ go(cur-1,true); });

  /* Sheets: open in the page without JavaScript; with it, they are modal dialogs */
  var sheets=[].slice.call(d.querySelectorAll("dialog.sheet"));
  sheets.forEach(function(dlg){
    dlg.removeAttribute("open");
    dlg.querySelectorAll("[data-close]").forEach(function(b){ b.addEventListener("click",function(){ dlg.close(); }); });
  });
  d.querySelectorAll("[data-open]").forEach(function(b){
    b.addEventListener("click",function(){ var dlg=d.getElementById(b.getAttribute("data-open")); dlg.showModal(); var c=dlg.querySelector('[aria-current="step"]')||dlg.querySelector("[data-close]"); c.focus(); });
  });
  d.querySelectorAll("[data-go]").forEach(function(b){
    b.addEventListener("click",function(){ var dlg=b.closest("dialog"); dlg.close(); go(+b.getAttribute("data-go"),true); });
  });

  /* Copy a path */
  d.querySelectorAll("[data-copy]").forEach(function(b){
    var lbl=b.querySelector(".copy-lbl"), idle=lbl.textContent, t;
    function done(){ lbl.textContent=b.getAttribute("data-done"); b.classList.add("is-done"); live.textContent=b.getAttribute("data-done");
      clearTimeout(t); t=setTimeout(function(){ lbl.textContent=idle; b.classList.remove("is-done"); live.textContent=""; },1800); }
    function legacy(text){ var ta=d.createElement("textarea"); ta.value=text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.opacity="0"; d.body.appendChild(ta); ta.select();
      var ok=false; try{ ok=d.execCommand("copy"); }catch(_){} d.body.removeChild(ta); b.focus(); return ok; }
    b.addEventListener("click",function(){
      var text=b.getAttribute("data-copy");
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,function(){ if(legacy(text)) done(); }); }
      else if(legacy(text)) done();
    });
  });

  d.addEventListener("keydown",function(e){
    if(e.altKey||e.ctrlKey||e.metaKey||sheets.some(function(s){return s.open;})) return;
    if(e.key==="ArrowRight"||e.key==="PageDown"){ e.preventDefault(); go(cur+1,true); }
    else if(e.key==="ArrowLeft"||e.key==="PageUp"){ e.preventDefault(); go(cur-1,true); }
  });

  go(start(),false);
  addEventListener("resize",function(){ if(cur>=0) shrink(screens[cur]); });
})();
