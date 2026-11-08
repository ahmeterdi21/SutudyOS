import {useEffect,useRef,useState} from 'react';
import {RevealLogo} from './components/RevealLogo';
import {desktop} from './storage';
import type {Updates} from './useUpdates';
import {STARTUP_MIN,STARTUP_MAX,startupCanLeave,startupMessage} from './startupFlow';
import './startup.css';
export function Startup({ready,fatal,error,updates,onComplete,theme}:{theme:'dark'|'light';ready:boolean;fatal:boolean;error:string;updates:Updates;onComplete:()=>void}){
 const [elapsed,setElapsed]=useState(0),[leaving,setLeaving]=useState(false);
 const mark=useRef<HTMLDivElement>(null),overlay=useRef<HTMLDivElement>(null),complete=useRef(onComplete);
 const started=useRef(performance.now());
 complete.current=onComplete;
 useEffect(()=>{const timers=[STARTUP_MIN,STARTUP_MAX].map(ms=>setTimeout(()=>setElapsed(Math.max(ms,performance.now()-started.current)),Math.max(0,ms-(performance.now()-started.current))));return()=>timers.forEach(clearTimeout)},[]);
 const canLeave=startupCanLeave(ready,fatal,elapsed,updates.busy);
 useEffect(()=>{
  if(!canLeave)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from=mark.current?.getBoundingClientRect(),to=document.querySelector('[data-brand-mark]')?.getBoundingClientRect();
  setLeaving(true);
  const duration=reduced?120:680;
  let flying:Animation|undefined;
  if(from&&to&&from.width>0&&to.width>0&&!reduced)flying=mark.current?.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width})`}],{duration,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'});
  const fade=overlay.current?.animate([{backgroundColor:'var(--bg)'},{backgroundColor:'transparent'}],{duration,fill:'forwards'});
  const timeout=setTimeout(()=>complete.current(),duration);
  return()=>{clearTimeout(timeout);flying?.cancel();fade?.cancel()};
 },[canLeave]);
 const message=startupMessage(ready,fatal,updates.busy,updates.result?.status,updates.error,!desktop);
 return <div ref={overlay} className={'startup '+(leaving?'startup-leaving':'')} role="dialog" aria-modal="true" aria-label="StudyOS açılıyor"><div className="startup-grid"/><div className="startup-glow"/><div className="startup-center"><div ref={mark} className="startup-emblem"><RevealLogo theme={theme} leaving={leaving}/></div><div className="startup-copy"><div className="startup-kicker">KENDİ RİTMİNDE İLERLE</div><h1>Study<span>OS</span></h1><p>Odaklan. Planla. Bir adım ileri.</p></div><div className="startup-status"><div className={'startup-track '+(fatal?'startup-failed':'')}><span/></div><p role="status" aria-live="polite">{message}</p>{fatal&&<div role="alert"><p>{error}</p><small>Kayıtların değiştirilmedi. Uygulamayı yeniden açmayı deneyebilirsin.</small></div>}</div></div><footer className="startup-footer"><span>KİŞİSEL ÇALIŞMA ALANIN</span><span>{updates.version?`v${updates.version}`:'STUDYOS DESKTOP'}</span></footer></div>;
}
