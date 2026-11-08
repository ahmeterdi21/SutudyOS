import type {State} from './model';
export function removeTask(s:State,id:string):State{return {...s,tasks:s.tasks.filter(t=>t.id!==id)}}
export function removeDocument(s:State,id:string):State{return {...s,docs:s.docs.filter(d=>d.id!==id)}}
export function removeLesson(s:State,id:string):State{
 if(s.timer.lesson===id&&s.timer.deadline!==null)throw Error('Bu derse ait sayacı önce duraklat.');
 return {...s,lessons:s.lessons.map(l=>l.id===id?{...l,archived:true}:l),timer:s.timer.lesson===id?{...s.timer,lesson:''}:s.timer};
}
