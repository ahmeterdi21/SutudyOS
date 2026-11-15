import {useEffect,useRef,useState} from 'react';
import {day,type State} from './model';
import {companionBriefing,dueCompanionNotifications,markCompanionNotification,trackCompanionVisit} from './companion';
import {allowDesktopNotifications,desktopNotificationsAllowed,notifyCompanion} from './desktopNotifications';
import {desktop} from './storage';

type Props={state:State;ready:boolean;today:string;persist:(change:(state:State)=>State)=>Promise<void>};
export function useCompanion(props:Props){
 const live=useRef(props);live.current=props;
 const busy=useRef(false),visitBusy=useRef(false),announced=useRef('');
 const [entry,setEntry]=useState({date:'',awayDays:0}),[error,setError]=useState(''),[configuring,setConfiguring]=useState(false);
 const sessionSent=useRef(new Set<string>()),halted=useRef(false);
 useEffect(()=>{
  if(!props.ready||visitBusy.current)return;
  if(announced.current!==props.today){announced.current=props.today;setEntry({date:props.today,awayDays:companionBriefing(props.state,props.today).awayDays})}
  if(trackCompanionVisit(props.state,props.today)===props.state)return;
  visitBusy.current=true;
  void props.persist(state=>trackCompanionVisit(state,props.today)).catch(e=>setError(`Hatırlatma kaydı tamamlanamadı. ${String(e)}`)).finally(()=>{visitBusy.current=false});
 },[props.ready,props.today,props.state.lessons,props.state.companion?.lastVisit]);
 useEffect(()=>{
  let stopped=false;
  async function check(){
   const p=live.current;
   if(stopped||visitBusy.current||busy.current||halted.current||!desktop||!p.ready||!p.state.companion?.notifications)return;
   const due=dueCompanionNotifications(p.state,new Date()).filter(item=>!sessionSent.current.has(item.key));
   if(!due.length)return;
   busy.current=true;
   try{
    if(!await desktopNotificationsAllowed()){halted.current=true;setError('Bildirim izni kapalı. Ayarlardan yeniden izin verebilirsin.');return}
    if(stopped||visitBusy.current||!live.current.ready||!live.current.state.companion?.notifications)return;
    const current=dueCompanionNotifications(live.current.state,new Date()).filter(item=>!sessionSent.current.has(item.key));
    if(!current.length)return;
    // One toast per poll, even when multiple task reminders become due together.
    const daily=current.find(item=>item.key.startsWith('daily:')),timed=current.filter(item=>item.taskId);
    // Time-sensitive tasks go first; the daily digest can wait for the next poll.
    const delivered=timed.length?timed:daily?[daily]:[];
    const title=timed.length?(timed.length===1?timed[0].title:`Kıvılcım · ${timed.length} yaklaşan çalışman var`):daily!.title;
    const body=timed.length?(timed.slice(0,2).map(item=>item.body).join(' ').slice(0,400)+(timed.length>2?` Ayrıca ${timed.length-2} çalışma daha var; planlayıcına göz at.`:'')):daily!.body;
    await notifyCompanion(title,body);
    delivered.forEach(item=>sessionSent.current.add(item.key));
    const today=day();await live.current.persist(state=>delivered.reduce((next,item)=>markCompanionNotification(next,item.key,today),state));
    setError('');
   }catch(e){halted.current=true;setError(`Masaüstü bildirimi gönderilemedi. ${String(e)}`)}finally{busy.current=false}
  }
  void check();const timer=setInterval(()=>void check(),30000);
  const wake=()=>void check();window.addEventListener('focus',wake);window.addEventListener('studyos:reminders-check',wake);document.addEventListener('visibilitychange',wake);
  return()=>{stopped=true;clearInterval(timer);window.removeEventListener('focus',wake);window.removeEventListener('studyos:reminders-check',wake);document.removeEventListener('visibilitychange',wake)};
 },[]);
 // Data can load after the first effect; this lightweight event also checks newly added tasks.
 useEffect(()=>{window.dispatchEvent(new Event('studyos:reminders-check'))},[props.ready,props.state.tasks,props.state.companion?.notifications]);
 async function setNotifications(enabled:boolean){
  if(configuring)return;setConfiguring(true);setError('');
  try{
   if(enabled&&!await allowDesktopNotifications())throw Error('Bildirim izni verilmedi. Hatırlatmalar uygulamanın içinde görünmeye devam eder.');
   halted.current=false;await live.current.persist(state=>({...state,companion:{...state.companion,notifications:enabled}}));
  }catch(e){setError(String(e))}finally{setConfiguring(false)}
 }
 return {entry,error,configuring,setNotifications};
}
