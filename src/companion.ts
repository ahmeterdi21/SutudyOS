import {day,type State,type Task} from './model';
import {sortTasks,startMinutes} from './planning';
import {studyStreak} from './streak';

export type CompanionSettings={notifications?:boolean;showOnEntry?:boolean;lessonSince?:Record<string,string>;lastVisit?:string;sent?:Record<string,string>};
export type Reminder={key:string;title:string;body:string;taskId?:string;lessonId?:string};
const numberDay=(date:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return NaN;const stamp=Date.parse(date+'T00:00:00Z');return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===date?stamp/86400000:NaN};
const elapsed=(from:string,to:string)=>Math.max(0,numberDay(to)-numberDay(from));

// Old lessons have no creation date: start tracking them when this feature is first opened.
export function trackCompanionVisit(state:State,today:string):State{
 const before=state.companion||{},lessonSince={...before.lessonSince};let changed=before.lastVisit!==today;
 for(const lesson of state.lessons){if(!lesson.archived&&!Number.isFinite(numberDay(lessonSince[lesson.id]||''))){lessonSince[lesson.id]=today;changed=true}}
 const sent=Object.fromEntries(Object.entries(before.sent||{}).filter(([,date])=>Number.isFinite(numberDay(date))&&elapsed(date,today)<=8));
 if(Object.keys(sent).length!==Object.keys(before.sent||{}).length)changed=true;
 return changed?{...state,companion:{...before,lessonSince,sent,lastVisit:today}}:state;
}
export function companionBriefing(state:State,today:string){
 const tasks=sortTasks(state.tasks.filter(t=>!t.done&&t.date===today));
 const overdue=sortTasks(state.tasks.filter(t=>!t.done&&t.date<today&&Number.isFinite(numberDay(t.date))));
 const inactive:Reminder[]=[];
 for(const lesson of state.lessons){
  if(lesson.archived)continue;
  const studies=state.sessions.filter(s=>s.lesson===lesson.id&&Number.isFinite(s.seconds)&&s.seconds>0&&Number.isFinite(numberDay(s.date))&&s.date<=today).map(s=>s.date).sort();
  const last=studies.at(-1),baseline=last||state.companion?.lessonSince?.[lesson.id];
  if(!baseline)continue;const days=elapsed(baseline,today);
  if(days>=4)inactive.push({key:'lesson:'+lesson.id,title:lesson.name,lessonId:lesson.id,body:last?`${lesson.name} dersine ${days} gündür ara verdin. Bugün kısa bir tekrar yapalım mı?`:`${lesson.name} için henüz tamamlanmış bir çalışma yok. ${days} gündür seni bekliyor; küçük bir adımla başlayabiliriz.`});
 }
 const streak=studyStreak(state.sessions,today);
 const totals=new Map<string,number>(),seen=new Set<string>();
 for(const session of state.sessions){if(!seen.has(session.id)&&Number.isFinite(session.seconds)&&session.seconds>0&&Number.isFinite(numberDay(session.date))&&session.date<today){seen.add(session.id);totals.set(session.date,(totals.get(session.date)||0)+session.seconds)}}
 const lastQualified=[...totals.entries()].filter(([,seconds])=>seconds>=1800).map(([date])=>date).sort().at(-1);
 // A new run today should never trigger a lost-streak warning for an older run.
 const lostStreak=streak.current===0&&!!lastQualified&&elapsed(lastQualified,today)>=2;
 const awayDays=state.companion?.lastVisit?elapsed(state.companion.lastVisit,today):0;
 return {tasks,overdue,inactive,lostStreak,awayDays,streak};
}
export type Briefing=ReturnType<typeof companionBriefing>;
const short=(text:string,length=90)=>text.length>length?text.slice(0,length-1)+'…':text;
export function taskReminderKey(task:Task){return JSON.stringify(['task',task.id,task.date,task.startTime])}
export function dueCompanionNotifications(state:State,now:Date):Reminder[]{
 if(!state.companion?.notifications)return [];
 const today=day(now),briefing=companionBriefing(state,today),sent=state.companion.sent||{},dailyKey='daily:'+today;
 const result:Reminder[]=[];
 if(sent[dailyKey]!==today&&(briefing.tasks.length||briefing.inactive.length||briefing.lostStreak)){
  const parts=[];
  if(briefing.tasks.length)parts.push(`Bugün ${briefing.tasks.length} görevin var: ${briefing.tasks.slice(0,2).map(t=>short(t.title,55)+(t.startTime?' · '+t.startTime:'')).join(', ')}.`);
  if(briefing.inactive.length)parts.push(short(briefing.inactive[0].body,130));
  if(briefing.lostStreak)parts.push('Serine ara vermiş olabilirsin; bugün birlikte yeniden başlayabiliriz.');
  result.push({key:dailyKey,title:'Kıvılcım · Günlük çalışma planın',body:parts.join(' ').slice(0,480)});
 }
 const minute=now.getHours()*60+now.getMinutes();
 for(const task of briefing.tasks){const start=startMinutes(task),key=taskReminderKey(task);if(start===null||sent[key]===today||minute<start-10||minute>start+15)continue;
  result.push({key,title:'Kıvılcım · Çalışma vaktin',body:`${short(task.title,100)} · ${task.startTime}${task.topic?' — '+short(task.topic,120):''}. ${minute<start?'Az sonra başlayacaksın.':'Hazırsan başlayalım.'}`,taskId:task.id,lessonId:task.lesson});
 }
 return result;
}
export function markCompanionNotification(state:State,key:string,today:string):State{
 return {...state,companion:{...state.companion,sent:{...state.companion?.sent,[key]:today}}};
}
