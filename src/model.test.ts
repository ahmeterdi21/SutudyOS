import {describe,it,expect} from 'vitest';
import {initial,finish,remaining,day} from './model';
describe('durable timer',()=>{
 it('uses deadline after suspension rather than interval ticks',()=>{const s=initial();s.timer.deadline=100000;expect(remaining(s.timer,85000)).toBe(15);expect(remaining(s.timer,110000)).toBe(0)});
 it('records completion once after reopening',()=>{const s=initial();s.timer.deadline=Date.now()-5000;const done=finish(s);expect(done.sessions).toHaveLength(1);expect(finish(done).sessions).toHaveLength(1);expect(done.sessions[0].seconds).toBe(2700);expect(done.timer.deadline).toBeNull()});
 it('does not count breaks as study',()=>{const s=initial();s.timer.mode='break';s.timer.deadline=1;expect(finish(s).sessions).toHaveLength(0)});
 it('retains paused time across serialization',()=>{const s=initial();s.timer.remaining=231;expect(remaining(JSON.parse(JSON.stringify(s)).timer)).toBe(231);expect(finish(s)).toBe(s)});
 it('attributes completed work to its local completion date',()=>{const s=initial();s.timer.deadline=new Date(2026,9,10,23,55).getTime();expect(finish(s,new Date(2026,9,11,8).getTime()).sessions[0].date).toBe(day(new Date(2026,9,10)))});
});
