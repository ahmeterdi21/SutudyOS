import {describe,it,expect} from 'vitest';
import {conflicts,endTime,sortTasks} from './planning';
import type {Task} from './model';
const task=(id:string,startTime?:string,durationMinutes?:number):Task=>({id,title:id,date:'2026-11-08',lesson:'',done:false,startTime,durationMinutes});
describe('task scheduling',()=>{
 it('supports existing tasks without schedule fields',()=>{expect(endTime(task('old'))).toBe('');expect(conflicts(task('old'),[task('new','09:00',60)])).toEqual([])});
 it('calculates end time and midnight boundary',()=>{expect(endTime(task('a','09:30',90))).toBe('11:00');expect(endTime(task('b','23:00',60))).toBe('24:00')});
 it('detects overlapping blocks but permits adjacent ones',()=>{const a=task('a','09:00',60),b=task('b','09:30',60),c=task('c','10:00',30);expect(conflicts(a,[a,b,c])).toEqual([b])});
 it('ignores other dates and completed tasks',()=>{const a=task('a','09:00',60),b={...task('b','09:00',60),done:true},c={...task('c','09:00',60),date:'2026-11-09'};expect(conflicts(a,[a,b,c])).toEqual([])});
 it('sorts dates and times with untimed tasks last without mutating',()=>{const input=[task('old'),task('b','12:00',60),task('a','08:00',60)];expect(sortTasks(input).map(t=>t.id)).toEqual(['a','b','old']);expect(input[0].id).toBe('old')});
});
