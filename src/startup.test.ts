import {describe,it,expect} from 'vitest';
import {startupCanLeave,startupMessage,STARTUP_MIN,STARTUP_MAX} from './startupFlow';
describe('startup flow',()=>{
 it('keeps the intended minimum presentation time',()=>{expect(startupCanLeave(true,false,STARTUP_MIN-1,false)).toBe(false);expect(startupCanLeave(true,false,STARTUP_MIN,false)).toBe(true)});
 it('does not wait indefinitely for the network',()=>{expect(startupCanLeave(true,false,STARTUP_MAX-1,true)).toBe(false);expect(startupCanLeave(true,false,STARTUP_MAX,true)).toBe(true)});
 it('never enters the app with unloaded or failed local data',()=>{expect(startupCanLeave(false,false,30000,false)).toBe(false);expect(startupCanLeave(false,true,30000,false)).toBe(false);expect(startupCanLeave(true,true,30000,false)).toBe(false)});
 it('allows an offline launch after the minimum',()=>{expect(startupMessage(true,false,false,undefined,'offline',false)).toContain('tekrar denenebilir');expect(startupCanLeave(true,false,STARTUP_MIN,false)).toBe(true)});
 it('announces available updates without installing or blocking startup',()=>{expect(startupMessage(true,false,false,'available','',false)).toContain('Yeni bir sürüm');expect(startupCanLeave(true,false,STARTUP_MIN,false)).toBe(true)});
 it('distinguishes preview and configured release checks',()=>{expect(startupMessage(true,false,false,undefined,'',true)).toBe('Çalışma alanın hazır.');expect(startupMessage(true,false,false,'current','',false)).toContain('güncel');expect(startupMessage(true,false,true,undefined,'',false)).toContain('kontrol ediliyor')});
});
