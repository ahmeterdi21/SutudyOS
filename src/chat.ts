export type ChatMessage={role:'user'|'assistant';content:string};
const bytes=(text:string)=>new TextEncoder().encode(text).length;
/** Send whole recent exchanges, preserving order and the service's request budget. */
export function chatContext(history:ChatMessage[],text:string):ChatMessage[]{
 const content=text.trim();if(!content||content.length>6000)throw Error('1–6000 karakter arasında bir mesaj yaz.');
 let size=bytes(content);const selected:ChatMessage[]=[];
 for(let i=history.length-2;i>=0&&selected.length<18;i-=2){
  const user=history[i],assistant=history[i+1];
  if(user.role!=='user'||assistant.role!=='assistant')throw Error('Sohbet sırası okunamadı. Yeni sohbet başlat.');
  const next=bytes(user.content)+bytes(assistant.content);
  if(size+next>96*1024)break;
  selected.unshift(user,assistant);size+=next;
 }
 return [...selected,{role:'user',content}];
}
