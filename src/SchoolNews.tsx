import {useEffect,useRef,useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {desktop} from './storage';
import type {State} from './model';
import {parseSchoolPage,schoolDue,schoolUrl,schoolFetchUrl,type SchoolSource} from './school';
import './school.css';

type Persist=(change:(s:State)=>State)=>Promise<void>;
type Page={body:string;url:string;content_type:string};
export function useSchoolNews(state:State,ready:boolean,persist:Persist){
 const current=useRef(state);current.current=state;
 const saveRef=useRef(persist);saveRef.current=persist;
 const active=useRef(false),nextTry=useRef(0);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [online,setOnline]=useState(navigator.onLine);
 async function refresh(id?:string){
  if(active.current||!ready)return;
  if(!desktop){if(id)setError('Duyuru indirme Windows uygulamasında kullanılabilir.');return}
  if(!navigator.onLine){if(id)setError('Çevrimdışısın. Son kaydedilen duyurular gösteriliyor.');return}
  const sources=(current.current.schools||[]).filter(s=>id?s.id===id:schoolDue(s));
  if(!sources.length)return;
  active.current=true;setBusy(true);setError('');nextTry.current=Date.now()+60000;
  try{for(const source of sources){
   const started=Date.now();
   // Save the attempt before networking, so restarts cannot hammer a failing school site.
   await saveRef.current(v=>({...v,schools:(v.schools||[]).map(s=>s.id===source.id?{...s,lastAttempt:started}:s)}));
   let result:Partial<SchoolSource>;
   try{
    const page=await invoke<Page>('school_fetch',{url:schoolFetchUrl(source.url)});
    let parsed=parseSchoolPage(page.body,page.url,page.content_type);
    if(parsed.feed){try{const feed=await invoke<Page>('school_fetch',{url:parsed.feed});const fromFeed=parseSchoolPage(feed.body,feed.url,feed.content_type);if(fromFeed.items.length)parsed=fromFeed}catch{/* Keep usable HTML results if the optional feed is unavailable. */}}
    if(!parsed.items.length)throw Error('Duyuru bağlantısı bulunamadı. Site JavaScript veya oturum açma gerektiriyor olabilir; varsa RSS adresini ekle.');
    result={items:parsed.items,lastChecked:Date.now(),lastAttempt:started,error:undefined,kind:parsed.kind};
   }catch(e){result={error:String(e).replace(/^Error: /,''),lastAttempt:started}}
   await saveRef.current(v=>({...v,schools:(v.schools||[]).map(s=>s.id===source.id&&s.url===source.url?{...s,...result}:s)}));
  }}catch(e){setError('Duyurular kaydedilemedi: '+String(e))}finally{active.current=false;setBusy(false)}
 }
 const refreshRef=useRef(refresh);refreshRef.current=refresh;
 useEffect(()=>{
  if(!ready)return;
  const check=()=>{setOnline(navigator.onLine);if(document.visibilityState==='visible'&&Date.now()>=nextTry.current)void refreshRef.current()};
  check();const timer=setInterval(check,60000);
  window.addEventListener('online',check);window.addEventListener('offline',check);document.addEventListener('visibilitychange',check);
  return()=>{clearInterval(timer);window.removeEventListener('online',check);window.removeEventListener('offline',check);document.removeEventListener('visibilitychange',check)};
 },[ready,state.schools?.length]);
 return {busy,error,online,refresh};
}
export function SchoolNews({sources,persist,news}:{sources:SchoolSource[];persist:Persist;news:ReturnType<typeof useSchoolNews>}){
 const [editing,setEditing]=useState(false),[error,setError]=useState(''),[saving,setSaving]=useState(false),[selected,setSelected]=useState('');
 const source=sources.find(s=>s.id===selected)||sources[0];
 async function change(fn:(s:State)=>State){setSaving(true);setError('');try{await persist(fn)}catch(e){setError(String(e))}finally{setSaving(false)}}
 async function open(url:string){try{const safe=schoolUrl(url);if(desktop)await invoke('school_open',{url:safe});else window.open(safe,'_blank','noopener,noreferrer')}catch(e){setError(String(e))}}
 return <section className="panel school-news"><div className="section-heading"><div><div className="eyebrow accent">KAMPÜSTEN HABERLER</div><h3>Okul duyuruların</h3></div><button onClick={()=>setEditing(!editing)} aria-expanded={editing}>{editing?'Kapat':sources.length?'Kaynakları düzenle':'Okul ekle'}</button></div>
 {editing&&<div className="school-config"><form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const data=new FormData(form);try{const url=schoolUrl(String(data.get('url'))),name=String(data.get('name')).trim();if(!name)throw Error('Okul veya bölüm adını gir.');if(sources.some(s=>s.url===url))throw Error('Bu adres zaten ekli.');if(sources.length>=3)throw Error('En fazla üç kaynak ekleyebilirsin.');const id=crypto.randomUUID();setSaving(true);await persist(v=>({...v,schools:[...(v.schools||[]),{id,name,url,items:[],enabled:true}]}));setSelected(id);form.reset();setError('')}catch(e){setError(String(e))}finally{setSaving(false)}}}><label>Okul / bölüm adı<input name="name" required maxLength={80} placeholder="Makine Mühendisliği"/></label><label>Duyuru sayfası veya RSS adresi<input name="url" type="url" required maxLength={2048} placeholder="https://okul.edu.tr/duyurular"/></label><button disabled={saving||news.busy} className="primary">Kaynağı kaydet</button></form><p>Eklediğin herkese açık adres uygulama açıkken 12 saatte bir kontrol edilir. Derslerin ve görevlerin okula gönderilmez. İnternet yoksa son kayıtlar kalır. Şifreli veya yalnızca JavaScript ile açılan sayfalar desteklenmeyebilir.</p>{sources.map(s=><div className="school-source" key={s.id}><strong>{s.name}</strong><label><input type="checkbox" checked={s.enabled} disabled={saving||news.busy} onChange={e=>{const enabled=e.target.checked;void change(v=>({...v,schools:(v.schools||[]).map(x=>x.id===s.id?{...x,enabled}:x)}))}}/> Otomatik kontrol</label><button disabled={saving||news.busy} onClick={()=>void change(v=>({...v,schools:(v.schools||[]).filter(x=>x.id!==s.id)}))}>Kaynağı kaldır</button></div>)}</div>}
 {(error||news.error)&&<p role="alert" className="conflict">{error||news.error}</p>}
 {!sources.length?<p>Okulunun duyuru bağlantısını ekle; sınav programı ve diğer haberleri burada takip et.</p>:<><div className="school-toolbar"><select aria-label="Duyuru kaynağı" value={source.id} onChange={e=>setSelected(e.target.value)}>{sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button disabled={news.busy||saving||!news.online} onClick={()=>void news.refresh(source.id)}>{news.busy?'Kontrol ediliyor…':'Şimdi yenile'}</button><button onClick={()=>void open(source.url)}>Kaynak sayfa ↗</button></div><small className="school-status">{!news.online?'Çevrimdışı · ':''}{source.lastChecked?'Son başarılı kontrol: '+new Date(source.lastChecked).toLocaleString('tr-TR'):'Henüz kontrol edilmedi.'}{!source.enabled?' · Otomatik kontrol kapalı':''}</small>{source.error&&<p role="status" className="conflict">{source.error} {source.items.length>0?'Önceki kayıtlar gösteriliyor.':''}</p>}{source.kind==='page'&&<p className="school-hint">Sayfadan bulunan bağlantılar gösteriliyor; duyurunun kapsamını ve tarihini kaynak sayfadan doğrula.</p>}<div className="school-items">{source.items.map(item=><button key={item.url} onClick={()=>void open(item.url)}><span><strong>{item.title}</strong>{item.date&&<small>{item.date}</small>}</span><span aria-hidden="true">↗</span></button>)}</div>{!source.items.length&&<p>Henüz kayıtlı duyuru yok. İnternet bağlıyken “Şimdi yenile”yi kullanabilirsin.</p>}</>}
 </section>;
}
