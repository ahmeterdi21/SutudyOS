import type {Session} from './model';
const DAY=86400000;
export const STREAK_SECONDS=30*60;
function ordinal(date:string):number|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 const time=Date.parse(date+'T00:00:00Z');return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===date?time/DAY:null;
}
const key=(n:number)=>new Date(n*DAY).toISOString().slice(0,10);
export function studyStreak(sessions:Session[],today:string){
 const end=ordinal(today);if(end===null)throw Error('Seri tarihi geçerli değil.');
 const totals=new Map<number,number>(),seen=new Set<string>();let longestSession=0;
 for(const session of sessions){const n=ordinal(session.date);if(seen.has(session.id)||n===null||n>end||!Number.isFinite(session.seconds)||session.seconds<=0)continue;seen.add(session.id);totals.set(n,(totals.get(n)||0)+session.seconds);longestSession=Math.max(longestSession,session.seconds)}
 const qualified=[...totals.keys()].filter(n=>totals.get(n)!>=STREAK_SECONDS).sort((a,b)=>a-b);
 let longest=0,run=0,previous=-Infinity;
 for(const n of qualified){run=n===previous+1?run+1:1;longest=Math.max(longest,run);previous=n}
 const achieved=(totals.get(end)||0)>=STREAK_SECONDS;let cursor=achieved?end:end-1,current=0;
 while((totals.get(cursor)||0)>=STREAK_SECONDS){current++;cursor--}
 const todaySeconds=totals.get(end)||0,bestDay=[...totals.values()].reduce((best,value)=>Math.max(best,value),0);
 return {current,longest,todaySeconds,achieved,bestDay,longestSession,qualifiedDays:qualified.length,totalSeconds:[...totals.values()].reduce((a,b)=>a+b,0),week:Array.from({length:7},(_,i)=>{const n=end-6+i;return {date:key(n),seconds:totals.get(n)||0,qualified:(totals.get(n)||0)>=STREAK_SECONDS}})};
}
export type StreakSummary=ReturnType<typeof studyStreak>;

export type FoxMood='welcome'|'happy'|'proud'|'radiant'|'sad';
export function foxMood(summary:StreakSummary,awayDays=0):FoxMood {
 if(summary.current>=14)return 'radiant';
 if(summary.current>=7)return 'proud';
 if(summary.current>0)return 'happy';
 return summary.qualifiedDays>0||awayDays>=4?'sad':'welcome';
}
