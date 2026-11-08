import type {Task} from './model';
export function startMinutes(task:Task):number|null {
 if(!task.startTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(task.startTime))return null;
 const [h,m]=task.startTime.split(':').map(Number);return h*60+m;
}
export function endTime(task:Task):string {
 const start=startMinutes(task);if(start===null||!task.durationMinutes)return '';
 const end=start+task.durationMinutes;return `${String(Math.floor(end/60)).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`;
}
export function conflicts(task:Task,tasks:Task[]):Task[]{
 const start=startMinutes(task);if(start===null||!task.durationMinutes||task.done)return [];
 return tasks.filter(other=>{const next=startMinutes(other);return other.id!==task.id&&!other.done&&other.date===task.date&&next!==null&&!!other.durationMinutes&&start<next+other.durationMinutes&&next<start+task.durationMinutes!});
}
export function sortTasks(tasks:Task[]):Task[]{return [...tasks].sort((a,b)=>a.date.localeCompare(b.date)||(startMinutes(a)??1441)-(startMinutes(b)??1441)||a.title.localeCompare(b.title,'tr'));}
