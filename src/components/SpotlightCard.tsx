import {useEffect,useRef,type CSSProperties,type PointerEvent,type ReactNode} from 'react';
import './spotlight-card.css';

// Adapted from the user-supplied kavikatiyar / 21st.dev 3D card reference.
// Keep StudyOS content and actions local, with restrained tilt for readable text.
export function SpotlightCard({children,color,className=''}:{children:ReactNode;color:string;className?:string}){
 const frame=useRef<number|null>(null),element=useRef<HTMLElement|null>(null);
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current)},[]);
 function reset(){
  if(frame.current!==null)cancelAnimationFrame(frame.current);
  frame.current=null;
  const el=element.current;if(!el)return;
  el.style.removeProperty('--tilt-x');el.style.removeProperty('--tilt-y');
  el.removeAttribute('data-lit');
 }
 function move(e:PointerEvent<HTMLElement>){
  if(e.pointerType!=='mouse'||!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches)return;
  const el=e.currentTarget,rect=el.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));
  if(frame.current!==null)cancelAnimationFrame(frame.current);
  frame.current=requestAnimationFrame(()=>{
   frame.current=null;el.style.setProperty('--spot-x',`${x*100}%`);el.style.setProperty('--spot-y',`${y*100}%`);
   el.style.setProperty('--tilt-x',`${(0.5-y)*5}deg`);el.style.setProperty('--tilt-y',`${(x-0.5)*5}deg`);el.dataset.lit='true';
  });
 }
 return <section ref={element} className={`panel spotlight-card ${className}`} style={{'--card-color':color} as CSSProperties} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
  <div className="spotlight-content">{children}</div>
 </section>;
}
