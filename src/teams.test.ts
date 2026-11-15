import {expect,it} from 'vitest';
import {localDateTime,normalizeTeamCode,teamSlotInput} from './teams';
it('normalizes pasted invite codes without accepting arbitrary strings',()=>{
 expect(normalizeTeamCode(' st-12345678-1234-4abc-8123-123456789abc ')).toBe('ST-1234567812344ABC8123123456789ABC');
 expect(()=>normalizeTeamCode('1234')).toThrow();expect(()=>normalizeTeamCode('ST-'+'Z'.repeat(32))).toThrow();
});
it('converts local study times to a shared instant and back',()=>{
 const form=new FormData();form.set('title','  Ortak tekrar  ');form.set('topic','Dişliler');form.set('starts_at','2026-11-20T19:30');form.set('duration','60');
 const result=teamSlotInput(form);expect(result.title).toBe('Ortak tekrar');expect(localDateTime(result.starts_at)).toBe('2026-11-20T19:30');expect(result.duration).toBe(60);
});
it('rejects invalid calendar dates and study durations before making a remote change',()=>{
 const form=new FormData();form.set('title','Plan');form.set('starts_at','2026-02-30T15:00');form.set('duration','60');expect(()=>teamSlotInput(form)).toThrow();
 form.set('starts_at','2026-11-20T19:30');form.set('duration','241');expect(()=>teamSlotInput(form)).toThrow();form.set('duration','12.5');expect(()=>teamSlotInput(form)).toThrow();
});
