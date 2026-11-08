import {day,type Task} from './model';
export type PlanInput={topic:string;goal:string;startDate:string;days:number;dailyMinutes:number};
export type SuggestedTask=Pick<Task,'title'|'topic'|'notes'|'date'|'durationMinutes'>;
export type SuggestedPlan={summary:string;tasks:SuggestedTask[]};
export function planDates(input:PlanInput){
 const start=new Date(`${input.startDate}T12:00:00`);
 if(!Number.isFinite(start.getTime())||day(start)!==input.startDate||!Number.isInteger(input.days)||input.days<1||input.days>14||!Number.isInteger(input.dailyMinutes)||input.dailyMinutes<15||input.dailyMinutes>480)throw Error('Tarih ve süreleri kontrol et.');
 return Array.from({length:input.days},(_,i)=>{const date=new Date(start);date.setDate(date.getDate()+i);return day(date)});
}
export function validatePlan(plan:unknown,input:PlanInput):SuggestedPlan{
 const dates=planDates(input),totals=new Map<string,number>();
 if(!plan||typeof plan!=='object')throw Error('Plan biçimi okunamadı.');
 const p=plan as Record<string,unknown>;
 if(typeof p.summary!=='string'||p.summary.length>2000||!Array.isArray(p.tasks)||!p.tasks.length||p.tasks.length>28)throw Error('Planın açıklaması veya görev sayısı uygun değil.');
 const tasks=p.tasks.map((value:unknown)=>{
  if(!value||typeof value!=='object')throw Error('Görev biçimi uygun değil.');
  const t=value as Record<string,unknown>;
  if(typeof t.title!=='string'||!t.title.trim()||t.title.length>160||typeof t.topic!=='string'||t.topic.length>160||typeof t.notes!=='string'||t.notes.length>5000||typeof t.date!=='string'||!dates.includes(t.date)||typeof t.durationMinutes!=='number'||!Number.isInteger(t.durationMinutes)||t.durationMinutes<1||t.durationMinutes>input.dailyMinutes)throw Error('Planın tarih, süre veya görev alanları uygun değil. Yeniden plan oluştur.');
  totals.set(t.date,(totals.get(t.date)||0)+t.durationMinutes);
  if(totals.get(t.date)!>input.dailyMinutes)throw Error('Plan günlük ayırdığın süreyi aşıyor. Yeniden plan oluştur.');
  return {title:t.title.trim(),topic:t.topic,notes:t.notes,date:t.date,durationMinutes:t.durationMinutes};
 });return {summary:p.summary,tasks};
}
export function parsePlan(text:string,input:PlanInput):SuggestedPlan{
 const plain=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 let parsed:unknown;try{parsed=JSON.parse(plain)}catch{throw Error('Yapay zekâ okunabilir bir plan döndürmedi. Yeniden dene.')}
 return validatePlan(parsed,input);
}
