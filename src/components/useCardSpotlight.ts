import {useEffect,useRef} from 'react';
import './card-surfaces.css';

// Delegate pointer work to one listener and one animation frame for the workspace.
export function useCardSpotlight(){
 const root=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const host=root.current;if(!host)return;
  const media=matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
  let active:HTMLElement|null=null,frame:number|null=null;
  const reset=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null;if(active){active.removeAttribute('data-card-lit');for(const key of ['--surface-x','--surface-y','--surface-rx','--surface-ry'])active.style.removeProperty(key)}active=null};
  const move=(event:PointerEvent)=>{
   if(!media.matches||event.pointerType!=='mouse'){reset();return}
   const card=event.target instanceof Element?event.target.closest<HTMLElement>('.panel:not(.spotlight-card),.lesson-mini,.library-item,.update-panel'):null;
   if(!card||!host.contains(card)||card.closest('.spotlight-card')){reset();return}
   if(active!==card){reset();active=card}
   const rect=card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
   const editing=card.contains(document.activeElement)&&document.activeElement?.matches('input,textarea,select');
   // Limit pixel displacement on large panels; inputs remain steady while editing.
   const strength=editing?0:Math.min(3,800/Math.max(rect.width,rect.height));
   if(frame!==null)cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{frame=null;card.style.setProperty('--surface-x',x*100+'%');card.style.setProperty('--surface-y',y*100+'%');card.style.setProperty('--surface-rx',(0.5-y)*strength+'deg');card.style.setProperty('--surface-ry',(x-0.5)*strength+'deg');card.dataset.cardLit='true'});
  };
  host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',reset);host.addEventListener('pointercancel',reset);host.addEventListener('scroll',reset,true);window.addEventListener('blur',reset);media.addEventListener('change',reset);
  return()=>{reset();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',reset);host.removeEventListener('pointercancel',reset);host.removeEventListener('scroll',reset,true);window.removeEventListener('blur',reset);media.removeEventListener('change',reset)};
 },[]);
 return root;
}
