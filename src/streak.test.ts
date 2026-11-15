import {expect,it} from 'vitest';
import type {Session} from './model';
import {studyStreak} from './streak';
const session=(date:string,seconds=1800,id=date):Session=>({id,date,seconds,lesson:''});
it('combines completed sessions and requires the full thirty minutes',()=>{
 const sessions=[session('2026-11-15',900,'a'),session('2026-11-15',899,'b')];
 expect(studyStreak(sessions,'2026-11-15').achieved).toBe(false);
 const result=studyStreak([...sessions,session('2026-11-15',1,'c')],'2026-11-15');
 expect(result.achieved).toBe(true);expect(result.current).toBe(1);expect(result.todaySeconds).toBe(1800);
});
it('keeps yesterday’s streak until today ends and resets after a missed day',()=>{
 const sessions=[session('2026-11-12'),session('2026-11-13')];
 expect(studyStreak(sessions,'2026-11-14').current).toBe(2);
 const result=studyStreak(sessions,'2026-11-15');expect(result.current).toBe(0);expect(result.longest).toBe(2);
});
it('counts consecutive calendar days across leap days and year boundaries',()=>{
 expect(studyStreak([session('2024-02-28'),session('2024-02-29'),session('2024-03-01')],'2024-03-01').current).toBe(3);
 expect(studyStreak([session('2025-12-31'),session('2026-01-01')],'2026-01-01').current).toBe(2);
});
it('retains the longest chain and separate daily and single-session records',()=>{
 const sessions=[session('2026-11-01'),session('2026-11-02'),session('2026-11-03'),session('2026-11-15',2400,'a'),session('2026-11-15',1800,'b')];
 const result=studyStreak(sessions,'2026-11-15');
 expect(result.current).toBe(1);expect(result.longest).toBe(3);expect(result.bestDay).toBe(4200);expect(result.longestSession).toBe(2400);expect(result.totalSeconds).toBe(9600);expect(result.qualifiedDays).toBe(4);
 expect(sessions).toHaveLength(5);
});
it('ignores invalid, future, duplicate and nonpositive sessions',()=>{
 const result=studyStreak([session('2026-11-15'),session('2026-11-15'),session('2026-11-16'),session('2026-02-30'),session('bad'),session('2026-11-14',NaN),session('2026-11-13',-1)],'2026-11-15');
 expect(result.totalSeconds).toBe(1800);expect(result.qualifiedDays).toBe(1);expect(()=>studyStreak([],'bad')).toThrow();
});
it('provides seven dated days including today and supports empty history',()=>{
 const result=studyStreak([],'2026-01-03');expect(result.current).toBe(0);expect(result.longest).toBe(0);expect(result.bestDay).toBe(0);
 expect(result.week.map(d=>d.date)).toEqual(['2025-12-28','2025-12-29','2025-12-30','2025-12-31','2026-01-01','2026-01-02','2026-01-03']);
 expect(result.week.every(d=>!d.qualified)).toBe(true);
});
