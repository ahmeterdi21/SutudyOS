import {it,expect} from 'vitest';
import {chatContext,type ChatMessage} from './chat';
it('keeps recent complete exchanges and the new message',()=>{
 const history:ChatMessage[]=Array.from({length:12},(_,i)=>[{role:'user' as const,content:`u${i}`},{role:'assistant' as const,content:`a${i}`}]).flat();
 const context=chatContext(history,'  merhaba  ');expect(context).toHaveLength(19);expect(context[0].content).toBe('u3');expect(context.at(-1)).toEqual({role:'user',content:'merhaba'});
});
it('drops entire exchanges that exceed the byte budget',()=>{
 const context=chatContext([{role:'user',content:'x'},{role:'assistant',content:'ç'.repeat(50000)}],'merhaba');expect(context).toEqual([{role:'user',content:'merhaba'}]);
});
it('rejects empty and oversized messages',()=>{expect(()=>chatContext([],'   ')).toThrow();expect(()=>chatContext([],'x'.repeat(6001))).toThrow()});
