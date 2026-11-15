import {useEffect,useRef,useState} from 'react';
import type {State} from './model';
import {completedDeadline,soundSettings,StudyAudio} from './sounds';

export function useStudySounds(state:State,ready:boolean,now:number){
 const audio=useRef<StudyAudio|null>(null),last=useRef<number|null>(null),pending=useRef<number|null>(null),playing=useRef(false);
 const current=useRef({state,ready});current.current={state,ready};
 const [notice,setNotice]=useState<{mode:'focus'|'break';needsGesture:boolean}|null>(null);
 function engine(){return audio.current??(audio.current=new StudyAudio())}
 async function alarm(){
  const deadline=pending.current,settings=soundSettings(current.current.state.sounds);
  if(deadline===null||playing.current||!settings.alarm||!settings.volume)return;
  playing.current=true;try{const played=await engine().play('alarm',settings.volume);if(pending.current===deadline){if(played)pending.current=null;setNotice(n=>n?{...n,needsGesture:!played}:null)}}finally{playing.current=false}
 }
 function schedule(){
  const {state,ready}=current.current,settings=soundSettings(state.sounds);if(!ready)return;
  if(!settings.alarm||!settings.volume){audio.current?.stopAlarm();return}
  if(state.timer.deadline===null){if(audio.current?.scheduled!=null&&audio.current.scheduled!==last.current)audio.current.stopAlarm();return}
  if(state.timer.deadline>Date.now())engine().scheduleAlarm(state.timer.deadline,settings.volume);
 }
 function dismiss(){pending.current=null;audio.current?.stop();setNotice(null)}
 useEffect(()=>{
  const gesture=()=>{const {state,ready}=current.current,settings=soundSettings(state.sounds);if(!ready||(!settings.effects&&!settings.alarm))return;void engine().unlock().then(()=>{schedule();if(pending.current!==null)void alarm()})};
  const click=(event:MouseEvent)=>{
   const {state,ready}=current.current,settings=soundSettings(state.sounds);
   if(!ready||!settings.effects||!settings.volume||!event.isTrusted||pending.current!==null)return;
   const target=event.target instanceof Element?event.target.closest('button,summary'):null;
   if(!target||target.matches(':disabled')||target.closest('[inert],.startup-screen')||target.hasAttribute('data-sound-preview'))return;
   void engine().play(target.closest('nav')||target.classList.contains('settings-shortcut')?'navigate':'click',settings.volume);
  };
  document.addEventListener('pointerdown',gesture,{capture:true});document.addEventListener('keydown',gesture,{capture:true});document.addEventListener('click',click);
  return()=>{document.removeEventListener('pointerdown',gesture,true);document.removeEventListener('keydown',gesture,true);document.removeEventListener('click',click);audio.current?.dispose();audio.current=null};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const deadline=completedDeadline(state.timer,now,last.current);if(deadline===null)return;
  last.current=deadline;setNotice({mode:state.timer.mode,needsGesture:false});
  const settings=soundSettings(state.sounds);if(settings.alarm&&settings.volume>0&&!audio.current?.wasScheduled(deadline)){audio.current?.stopAlarm();pending.current=deadline;void alarm()}
 },[ready,state.timer.deadline,now]);
 useEffect(()=>{schedule()},[ready,state.timer.deadline,state.sounds]);
 useEffect(()=>{const settings=soundSettings(state.sounds);if(!settings.alarm||settings.volume===0){pending.current=null;audio.current?.stop();setNotice(n=>n?{...n,needsGesture:false}:n)}},[state.sounds]);
 async function preview(kind:'click'|'alarm'){
  const settings=soundSettings(current.current.state.sounds);
  if(!settings[kind==='click'?'effects':'alarm']||!settings.volume)return;
  const played=await engine().play(kind,settings.volume);if(!played)setNotice(n=>n?{...n,needsGesture:true}:n);
 }
 return {notice,dismiss,preview};
}
