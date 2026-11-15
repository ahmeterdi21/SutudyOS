import {expect,it} from 'vitest';
import {initial,type State} from './model';
import {companionBriefing,dueCompanionNotifications,markCompanionNotification,taskReminderKey,trackCompanionVisit} from './companion';
function fixture():State{
 return {...initial(),lessons:[{id:'a',name:'Isı Transferi',color:'#fff'},{id:'b',name:'Mekanik',color:'#fff'},{id:'c',name:'Eski ders',color:'#fff',archived:true}],companion:{notifications:true,lessonSince:{a:'2026-11-01',b:'2026-11-11',c:'2026-11-01'}},tasks:[{id:'t',title:'Dişli çalış',lesson:'b',date:'2026-11-15',done:false,startTime:'15:00',topic:'Dişli hesabı'}]};
}
it('uses the last completed lesson session and the four-day boundary',()=>{
 const s=fixture();s.sessions=[{id:'1',lesson:'a',date:'2026-11-12',seconds:300}];
 const result=companionBriefing(s,'2026-11-15');expect(result.inactive.map(r=>r.lessonId)).toEqual(['b']);expect(result.inactive[0].body).toContain('4 gündür');
 expect(companionBriefing(s,'2026-11-16').inactive.map(r=>r.lessonId)).toEqual(['a','b']);
});
it('starts undated lessons at first observation without pretending they are overdue',()=>{
 const s=fixture();delete s.companion;
 const tracked=trackCompanionVisit(s,'2026-11-15');expect(companionBriefing(tracked,'2026-11-15').inactive).toEqual([]);
 expect(companionBriefing(tracked,'2026-11-19').inactive).toHaveLength(2);
 expect(s.companion).toBeUndefined();expect(trackCompanionVisit(tracked,'2026-11-15')).toBe(tracked);
});
it('excludes finished and future tasks and sorts today by start time',()=>{
 const s=fixture();s.tasks.push({...s.tasks[0],id:'done',done:true},{...s.tasks[0],id:'future',date:'2026-11-16'},{...s.tasks[0],id:'past',date:'2026-11-14'},{...s.tasks[0],id:'early',startTime:'08:00'});
 const result=companionBriefing(s,'2026-11-15');expect(result.tasks.map(t=>t.id)).toEqual(['early','t']);expect(result.overdue.map(t=>t.id)).toEqual(['past']);
});
it('welcomes after absence and warns about a missed streak but never an active new run',()=>{
 const s=fixture();s.companion!.lastVisit='2026-11-10';s.sessions=[{id:'1',lesson:'a',date:'2026-11-12',seconds:1800}];
 expect(companionBriefing(s,'2026-11-13').lostStreak).toBe(false);
 const result=companionBriefing(s,'2026-11-15');expect(result.lostStreak).toBe(true);expect(result.awayDays).toBe(5);
 s.sessions.push({id:'2',lesson:'a',date:'2026-11-15',seconds:1800});expect(companionBriefing(s,'2026-11-15').lostStreak).toBe(false);
});
it('requires explicit notification opt-in and persists a once-per-day digest',()=>{
 const s=fixture();s.companion!.notifications=false;expect(dueCompanionNotifications(s,new Date(2026,10,15,9))).toEqual([]);
 s.companion!.notifications=true;const due=dueCompanionNotifications(s,new Date(2026,10,15,9));expect(due).toHaveLength(1);
 const marked=markCompanionNotification(s,due[0].key,'2026-11-15');expect(dueCompanionNotifications(JSON.parse(JSON.stringify(marked)),new Date(2026,10,15,10))).toEqual([]);
 expect(dueCompanionNotifications(marked,new Date(2026,10,16,10))).toHaveLength(1);
});
it('reminds within ten minutes before and fifteen minutes after, once per task schedule',()=>{
 let s=markCompanionNotification(fixture(),'daily:2026-11-15','2026-11-15');
 expect(dueCompanionNotifications(s,new Date(2026,10,15,14,49))).toHaveLength(0);
 const due=dueCompanionNotifications(s,new Date(2026,10,15,14,50));expect(due).toHaveLength(1);expect(due[0].taskId).toBe('t');
 expect(dueCompanionNotifications(s,new Date(2026,10,15,15,15))).toHaveLength(1);expect(dueCompanionNotifications(s,new Date(2026,10,15,15,16))).toHaveLength(0);
 s=markCompanionNotification(s,taskReminderKey(s.tasks[0]),'2026-11-15');expect(dueCompanionNotifications(s,new Date(2026,10,15,15))).toEqual([]);
 s.tasks=[{...s.tasks[0],startTime:'15:05'}];expect(dueCompanionNotifications(s,new Date(2026,10,15,15))).toHaveLength(1);
});
it('does not notify completed tasks, unscheduled tasks or excessively old entries',()=>{
 const s=markCompanionNotification(fixture(),'daily:2026-11-15','2026-11-15');s.tasks=[{...s.tasks[0],done:true},{...s.tasks[0],id:'invalid',startTime:'27:00'}];
 expect(dueCompanionNotifications(s,new Date(2026,10,15,15))).toEqual([]);
 s.companion!.sent!['old']='2026-10-01';expect(trackCompanionVisit(s,'2026-11-15').companion!.sent).not.toHaveProperty('old');
});
