import {expect,it} from 'vitest';
import {calendarDays,moveCalendar} from './calendar';
import {foxMood,studyStreak} from './streak';
import {schoolDue,schoolUrl,uniqueSchoolItems,SCHOOL_INTERVAL} from './school';
it('calendar includes Monday-first adjacent days and leap dates',()=>{
 const days=calendarDays('2024-02-15','month');expect(days).toHaveLength(42);expect(days[0]).toBe('2024-01-29');expect(days).toContain('2024-02-29');expect(new Set(days).size).toBe(42);
 expect(calendarDays('2026-11-15','week')).toEqual(['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15']);
});
it('calendar moves through short months and year boundaries without skipping',()=>{
 expect(moveCalendar('2026-01-31','month',1)).toBe('2026-02-01');expect(moveCalendar('2026-12-31','month',1)).toBe('2027-01-01');expect(moveCalendar('2026-12-28','week',1)).toBe('2027-01-04');
});
it('fox gets happier with streaks and gently sad only after an earned streak breaks',()=>{
 const sessions=Array.from({length:14},(_,i)=>({id:String(i),date:'2026-11-'+String(i+1).padStart(2,'0'),lesson:'',seconds:1800}));
 expect(foxMood(studyStreak([],'2026-11-15'))).toBe('welcome');
 expect(foxMood(studyStreak([],'2026-11-15'),4)).toBe('sad');
 expect(foxMood(studyStreak(sessions.slice(0,1),'2026-11-02'))).toBe('happy');
 expect(foxMood(studyStreak(sessions.slice(0,7),'2026-11-08'))).toBe('proud');
 expect(foxMood(studyStreak(sessions,'2026-11-15'))).toBe('radiant');
 expect(foxMood(studyStreak(sessions,'2026-11-16'))).toBe('sad');
 expect(foxMood(studyStreak([...sessions,{id:'restart',date:'2026-11-17',lesson:'',seconds:1800}],'2026-11-17'))).toBe('happy');
});
it('school poll respects twelve hours, failure backoff, disabled sources and clock rollback',()=>{
 const s={id:'a',name:'School',url:'https://school.edu/',items:[],enabled:true,lastChecked:1000000};
 expect(schoolDue(s,1000000+SCHOOL_INTERVAL-1)).toBe(false);expect(schoolDue(s,1000000+SCHOOL_INTERVAL)).toBe(true);
 expect(schoolDue({...s,lastAttempt:1000000+SCHOOL_INTERVAL},1000000+SCHOOL_INTERVAL+1000)).toBe(false);
 expect(schoolDue({...s,enabled:false},1000000+2*SCHOOL_INTERVAL)).toBe(false);expect(schoolDue(s,500000)).toBe(true);
});
it('school links reject active schemes and credentials; deduplicate source results',()=>{
 for(const url of ['javascript:alert(1)','file:///C:/test','https://user:pass@school.edu/','http://school.edu','https://localhost/'])expect(()=>schoolUrl(url)).toThrow();
 expect(schoolUrl('/news/1#top','https://school.edu/announcements')).toBe('https://school.edu/news/1');
 expect(uniqueSchoolItems([{title:'First',url:'https://school.edu/1'},{title:'Duplicate',url:'https://school.edu/1'}])).toHaveLength(1);
});
