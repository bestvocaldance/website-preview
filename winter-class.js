window.initWinterClass=function(root){

const section=root.querySelector('.class-showcase');
const track=section.querySelector('.slide-track');
const slides=Array.from(track.children);
const dots=Array.from(section.querySelectorAll('.slide-dot'));
const pause=section.querySelector('.pause-slide');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let current=-1, timer=null, visible=false, paused=false, hovered=false, keyboardFocus=false;
const heldPointers=new Set();
function show(index) {
 const next=(index+slides.length)%slides.length;
 if(next===current)return;
 const previous=current;
 current=next;
 slides.forEach((slide,i)=>{
  slide.classList.toggle('is-active',i===current);
  slide.classList.toggle('is-entering',i===current&&previous>=0);
  slide.classList.toggle('is-leaving',i===previous);
  slide.inert=i!==current;
  slide.setAttribute('aria-hidden',String(i!==current));
 });
 if(previous>=0&&!reduced.matches){
  section.classList.remove('is-changing');
  void section.offsetWidth;
  section.classList.add('is-changing');
 }
 dots.forEach((dot,i)=>{dot.classList.toggle('active',i===current);dot.setAttribute('aria-pressed',String(i===current));});
}
function stop(){clearInterval(timer);timer=null;section.classList.add("is-frozen");}
function start(){
 stop();
 if(visible&&!paused&&!hovered&&!keyboardFocus&&heldPointers.size===0&&!reduced.matches&&!document.hidden){
  section.classList.remove('is-frozen');
  timer=setInterval(()=>show(current+1),5000);
 }
}
function select(index){show(index);start();}
section.querySelector('.previous').addEventListener('click',()=>select(current-1));
section.querySelector('.next-slide').addEventListener('click',()=>select(current+1));
dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'자동 전환 시작':'자동 전환 멈추기');start();});
section.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;stop();}});
section.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=false;start();}});
section.addEventListener('pointerdown',e=>{heldPointers.add(e.pointerId);stop();});
function releasePointer(e){if(heldPointers.delete(e.pointerId))start();}
document.addEventListener('pointerup',releasePointer);
document.addEventListener('pointercancel',releasePointer);
section.addEventListener('focusin',e=>{keyboardFocus=e.target.matches(':focus-visible');if(keyboardFocus)stop();});
section.addEventListener('focusout',e=>{if(!section.contains(e.relatedTarget)){keyboardFocus=false;start();}});
addEventListener('blur',()=>{heldPointers.clear();hovered=false;stop();});
addEventListener('focus',start);
root.querySelectorAll('[data-show-slide]').forEach(link=>link.addEventListener('click',()=>{ if(window.bvdSettleHero)window.bvdSettleHero(); select(Number(link.dataset.showSlide)); }));
new IntersectionObserver(entries=>{const active=entries[0].isIntersecting;if(active&&!visible){visible=true;show(0);start();}else if(!active){visible=false;stop();}},{threshold:.15}).observe(section);
document.addEventListener('visibilitychange',start);
reduced.addEventListener('change',start);
let pending=false;
function reveal(){const top=section.getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,(innerHeight-top)/(innerHeight*.7)));section.style.setProperty('--reveal-scale',String(.96+.04*progress));pending=false;}
addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(reveal);}},{passive:true});
addEventListener('resize',reveal);
show(0);reveal();

};