import {afterEach,expect,it,vi} from 'vitest';
import {completedDeadline,soundSettings,StudyAudio} from './sounds';
afterEach(()=>vi.unstubAllGlobals());
it('supports old saves and preserves independent mute preferences',()=>{
 expect(soundSettings()).toEqual({effects:true,alarm:true,volume:.45});
 expect(soundSettings({effects:false,alarm:true,volume:2})).toEqual({effects:false,alarm:true,volume:1});
 expect(soundSettings({volume:NaN}).volume).toBe(.45);
});
it('announces only a newly expired running deadline',()=>{
 expect(completedDeadline({deadline:100},99,null)).toBeNull();
 expect(completedDeadline({deadline:100},100,null)).toBe(100);
 expect(completedDeadline({deadline:100},200,100)).toBeNull();
 expect(completedDeadline({deadline:null},200,null)).toBeNull();
});
it('schedules the alarm independently of JavaScript ticks and cancels it when paused',async()=>{
 const starts:number[]=[],stops=vi.fn();
 class FakeContext{
  state='running';currentTime=10;destination={};resume=vi.fn(async()=>{});close=vi.fn(async()=>{});
  createOscillator(){return {type:'',frequency:{value:0},connect:vi.fn(),disconnect:vi.fn(),start:(at:number)=>starts.push(at),stop:stops,onended:null}}
  createGain(){return {gain:{setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),disconnect:vi.fn()}}
 }
 vi.stubGlobal('AudioContext',FakeContext);const audio=new StudyAudio();await audio.unlock();
 const deadline=Date.now()+60000;expect(audio.scheduleAlarm(deadline,.5)).toBe(true);expect(starts).toHaveLength(6);expect(starts[0]).toBeGreaterThan(69);
 audio.scheduleAlarm(deadline,.5);expect(starts).toHaveLength(6);
 audio.scheduleAlarm(null,.5);expect(audio.scheduled).toBeNull();expect(stops.mock.calls.length).toBeGreaterThanOrEqual(12);audio.dispose();
});
it('does not start audio for muted playback',async()=>{
 const create=vi.fn();vi.stubGlobal('AudioContext',create);expect(await new StudyAudio().play('alarm',0)).toBe(false);expect(create).not.toHaveBeenCalled();
});
