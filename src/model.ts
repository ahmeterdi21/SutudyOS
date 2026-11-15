export type Lesson={id:string;name:string;color:string;archived?:boolean};
export type Task={id:string;title:string;lesson:string;date:string;done:boolean;topic?:string;notes?:string;startTime?:string;durationMinutes?:number};
export type Session={id:string;lesson:string;seconds:number;date:string};
export type Timer={duration:number;remaining:number;deadline:number|null;lesson:string;mode:'focus'|'break'};
export type LibraryFolder={id:string;name:string;lesson:string;parentId?:string};
export type State={version:1;schools?:import('./school').SchoolSource[];theme:'dark'|'light';glass?:import('./glass').GlassSettings;sounds?:import('./sounds').SoundSettings;streak?:{lastCelebratedDay?:string;animations?:boolean};companion?:import('./companion').CompanionSettings;goal:number;folders?:LibraryFolder[];lessons:Lesson[];tasks:Task[];sessions:Session[];docs:{id:string;name:string;lesson:string;size:number;folderId?:string}[];timer:Timer};
export const day=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const initial=():State=>({version:1,theme:'dark',goal:180,lessons:[],tasks:[],sessions:[],docs:[],timer:{duration:2700,remaining:2700,deadline:null,lesson:'',mode:'focus'}});
export const remaining=(timer:Timer,now=Date.now())=>timer.deadline===null?timer.remaining:Math.max(0,Math.ceil((timer.deadline-now)/1000));
export function finish(s:State,now=Date.now()):State {
 if(s.timer.deadline===null||remaining(s.timer,now)>0)return s;
 const t=s.timer,deadline=s.timer.deadline;
 return {...s,sessions:t.mode==='focus'?[...s.sessions,{id:`timer-${deadline}`,lesson:t.lesson,seconds:t.duration,date:day(new Date(deadline))}]:s.sessions,timer:{...t,remaining:0,deadline:null}};
}
