import {day} from './model';
export function calendarDays(selected:string,view:'month'|'week'){
 const date=new Date(selected+'T12:00:00');
 const start=view==='month'?new Date(date.getFullYear(),date.getMonth(),1,12):date;
 start.setDate(start.getDate()-(start.getDay()+6)%7);
 return Array.from({length:view==='month'?42:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return day(d)});
}
export function moveCalendar(selected:string,view:'month'|'week',direction:number){
 const date=new Date(selected+'T12:00:00');
 if(view==='week')date.setDate(date.getDate()+7*direction);
 else {date.setDate(1);date.setMonth(date.getMonth()+direction)}
 return day(date);
}
