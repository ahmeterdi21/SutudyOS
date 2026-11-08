import {describe,it,expect} from 'vitest';
import {initial} from './model';
import {removeLesson,removeTask,removeDocument} from './deletions';
function fixture(){const s=initial();s.lessons=[{id:'l',name:'Matematik',color:'#aaa'}];s.tasks=[{id:'t',title:'Çalış',lesson:'l',date:'2026-11-08',done:false}];s.docs=[{id:'d',name:'Not.pdf',lesson:'l',size:100}];s.sessions=[{id:'x',lesson:'l',seconds:60,date:'2026-11-08'}];s.timer.lesson='l';return s}
describe('safe removal',()=>{
 it('removes unfinished tasks without requiring completion',()=>{const s=fixture();expect(removeTask(s,'t').tasks).toHaveLength(0);expect(s.tasks).toHaveLength(1)});
 it('removes completed tasks too',()=>{const s=fixture();s.tasks[0].done=true;expect(removeTask(s,'t').tasks).toHaveLength(0)});
 it('preserves linked tasks, files and session history when removing a lesson',()=>{const s=fixture(),next=removeLesson(s,'l');expect(next.lessons[0].archived).toBe(true);expect(next.tasks).toEqual(s.tasks);expect(next.docs).toEqual(s.docs);expect(next.sessions).toEqual(s.sessions);expect(next.timer.lesson).toBe('');expect(s.lessons[0].archived).toBeUndefined()});
 it('protects the running timer attribution',()=>{const s=fixture();s.timer.deadline=Date.now()+10000;expect(()=>removeLesson(s,'l')).toThrow('duraklat');expect(s.lessons[0].archived).toBeUndefined()});
 it('removes only the requested document metadata',()=>{const s=fixture(),next=removeDocument(s,'d');expect(next.docs).toHaveLength(0);expect(next.tasks).toEqual(s.tasks);expect(next.lessons).toEqual(s.lessons)});
});
