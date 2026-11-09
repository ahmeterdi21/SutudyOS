import {useEffect,useRef,useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {Send,Plus,Sparkles,BookOpen,PenLine,Lightbulb,Copy,Check,Link} from 'lucide-react';
import {desktop} from '../storage';
import {chatContext,type ChatMessage} from '../chat';
import './animated-ai-chat.css';

// StudyOS adaptation of the user-supplied jatin-yadav05 / 21st.dev Animated AI Chat.
// Composer animation and prompt chips use CSS; responses come from the native service.
export function AnimatedAIChat({provider,model,connected,disabled,onConnections,onBusy}:{provider:'chatgpt'|'gemini';model:string;connected:boolean;disabled:boolean;onConnections:()=>void;onBusy:(busy:boolean)=>void}){
 const [messages,setMessages]=useState<ChatMessage[]>([]),[value,setValue]=useState(''),[consent,setConsent]=useState(false),[pending,setPending]=useState(''),[error,setError]=useState('');
 const [copied,setCopied]=useState<number|null>(null);
 const textarea=useRef<HTMLTextAreaElement>(null),bottom=useRef<HTMLDivElement>(null),lock=useRef(false),live=useRef(true),copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const ready=desktop&&connected&&(provider==='gemini'||!!model),busy=!!pending;
 useEffect(()=>{live.current=true;return()=>{live.current=false;if(copyTimer.current)clearTimeout(copyTimer.current)}},[]);
 useEffect(()=>{const el=textarea.current;if(el){el.style.height='100px';el.style.height=`${Math.min(240,Math.max(100,el.scrollHeight))}px`}},[value]);
 useEffect(()=>{if(messages.length||pending)bottom.current?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})},[messages.length,pending]);
 const prompts=[{icon:BookOpen,label:'Bir konuyu açıkla',text:'Şu konuyu örneklerle ve adım adım açıklar mısın: '},{icon:PenLine,label:'Bir metni düzenle',text:'Aşağıdaki metni daha açık ve akıcı hâle getir: '},{icon:Lightbulb,label:'Fikir geliştir',text:'Şu konuda birlikte fikir geliştirelim: '},{icon:Sparkles,label:'Kendimi sınayayım',text:'Şu konuda beni kısa sorularla sına; her cevabımdan sonra geri bildirim ver: '}];
 async function send(){
  if(lock.current||disabled||!ready||!consent||!value.trim())return;
  let context:ChatMessage[];try{context=chatContext(messages,value)}catch(e){setError(String(e));return}
  const text=value.trim();lock.current=true;setPending(text);setError('');onBusy(true);
  try{const reply=await invoke<string>('ai_chat',{request:{provider,model,messages:context}});if(!reply.trim())throw Error('Hizmet boş yanıt döndürdü.');if(live.current){setMessages(v=>[...v,{role:'user',content:text},{role:'assistant',content:reply}].slice(-80) as ChatMessage[]);setValue('')}}
  catch(e){if(live.current)setError(String(e))}
  finally{lock.current=false;if(live.current){setPending('');onBusy(false)}}
 }
 async function copy(text:string,index:number){try{await navigator.clipboard.writeText(text);setCopied(index);if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(null),1800)}catch{setError('Metin kopyalanamadı. Yanıtı seçip kopyalayabilirsin.')}}
 return <section className="animated-chat" aria-label="StudyOS yapay zekâ sohbeti">
  <div className="chat-heading"><span className="chat-badge"><Sparkles size={14}/> STUDYOS ASİSTAN</span><h2>{messages.length?'Birlikte devam edelim.':'Bugün nasıl yardımcı olabilirim?'}</h2><p>Bir soru sor, bir konuyu öğren veya aklındaki fikri birlikte geliştirelim.</p></div>
  <div className="chat-service"><span className={ready?'chat-connected':''}>{provider==='chatgpt'?'ChatGPT planın':'Gemini · kişisel anahtar'}{ready?' · hazır':' · bağlantı / model gerekli'}</span><button className="text-button" disabled={disabled||busy} onClick={onConnections}><Link size={14}/> Bağlantı ve model</button>{!!messages.length&&<button className="text-button" disabled={disabled||busy} onClick={()=>{setMessages([]);setError('');setConsent(false)}}><Plus size={15}/> Yeni sohbet</button>}</div>
  {!!messages.length&&<div className="chat-messages" role="log" aria-label="Sohbet mesajları" aria-live="polite">{messages.map((message,i)=><article key={i} className={`chat-message chat-message-${message.role}`}><div className="chat-message-meta"><strong>{message.role==='user'?'Sen':'StudyOS Asistan'}</strong><button aria-label={`${i+1}. mesajı kopyala`} onClick={()=>void copy(message.content,i)}>{copied===i?<Check size={14}/>:<Copy size={14}/>}</button></div><MessageText text={message.content}/></article>)}</div>}
  {pending&&<div className="chat-pending" role="status"><p>{pending}</p><span><i/><i/><i/> Yanıt bekleniyor…</span></div>}<div ref={bottom}/>
  <form className="chat-composer" aria-busy={busy} onSubmit={e=>{e.preventDefault();void send()}}><label className="sr-only" htmlFor="studyos-chat-message">Mesajın</label><textarea id="studyos-chat-message" ref={textarea} value={value} disabled={disabled||busy} maxLength={6000} placeholder="Aklındaki soruyu yaz…" onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send()}}}/><div className="chat-composer-footer"><small>Enter gönderir · Shift+Enter yeni satır</small><button className="primary" type="submit" disabled={disabled||busy||!ready||!consent||!value.trim()}><Send size={16}/>{busy?'Bekleniyor…':'Gönder'}</button></div></form>
  <label className="chat-consent"><input type="checkbox" checked={consent} disabled={disabled||busy} onChange={e=>setConsent(e.target.checked)}/> Mesajlarım ve bu sohbetin yakın geçmişi {provider==='chatgpt'?'OpenAI’a':'Google’a'} gönderilsin; hesabımın kotası kullanılsın.</label>
  {error&&<p role="alert" className="chat-error">{error}</p>}
  {!messages.length&&<div className="chat-prompts">{prompts.map(({icon:Icon,label,text})=><button key={label} disabled={disabled||busy} onClick={()=>{setValue(text);textarea.current?.focus()}}><Icon size={17}/>{label}</button>)}</div>}
  <p className="chat-privacy">Sohbet bu oturumda tutulur; uygulama kapanınca silinir. Bağlam için en fazla son 19 mesaj gönderilir. Derslerin ve PDF’lerin otomatik paylaşılmaz. Yanıtlar hata içerebilir.</p>
 </section>;
}
function MessageText({text}:{text:string}){
 // Render generated text safely, including fenced code, without accepting HTML.
 return <div className="chat-message-text">{text.split(/(```[\s\S]*?```)/g).map((block,i)=>block.startsWith('```')?<pre key={i}><code>{block.slice(3,-3).replace(/^[\w+-]*\r?\n/,'')}</code></pre>:<div key={i}>{block}</div>)}</div>;
}
