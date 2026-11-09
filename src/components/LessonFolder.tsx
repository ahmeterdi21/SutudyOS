import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,BookOpen,FileText,ChevronRight} from 'lucide-react';
import GlassFolder,{hashString,type ArtRecipe,type FolderFile} from './ui/glass-folder-cards';
import {DeleteAction} from './DeleteAction';
import type {Lesson,Task,State} from '../model';
import './lesson-folder.css';

type Entry=FolderFile&{id:string;kind:'task'|'pdf'};
export function LessonFolder({lesson,tasks,docs,minutes,theme,timerRunning,deletingDisabled,onFocus,onTask,onPDF,onPlanner,onLibrary,onDelete}:{
 lesson:Lesson;tasks:Task[];docs:State['docs'];minutes:number;theme:State['theme'];timerRunning:boolean;deletingDisabled:boolean;
 onFocus:()=>void;onTask:(id:string)=>void;onPDF:(id:string)=>void;onPlanner:()=>void;onLibrary:()=>void;onDelete:()=>Promise<void>;
}){
 const [open,setOpen]=useState(false),[width,setWidth]=useState(300);
 const measure=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null),detailsId=useId();
 const pending=useMemo(()=>tasks.filter(t=>t.lesson===lesson.id&&!t.done),[tasks,lesson.id]);
 const documents=useMemo(()=>docs.filter(d=>d.lesson===lesson.id),[docs,lesson.id]);
 const entries=useMemo<Entry[]>(()=>[
  ...pending.map(t=>({id:t.id,kind:'task' as const,name:t.title,meta:`Görev · ${t.date}${t.durationMinutes?` · ${t.durationMinutes} dk`:''}`})),
  ...documents.map(d=>({id:d.id,kind:'pdf' as const,name:d.name,meta:`PDF · ${(d.size/1024/1024).toLocaleString('tr-TR',{maximumFractionDigits:1})} MB`})),
 ],[pending,documents]);
 const art=useMemo<ArtRecipe>(()=>({style:'marble',colors:['#0b1020',lesson.color,'#e6e9ff','#202a40',lesson.color],scale:.7,warp:3.2,gloss:.45,veins:.4}),[lesson.color]);
 useEffect(()=>{
  const el=measure.current;if(!el)return;
  const update=()=>setWidth(Math.min(340,Math.max(180,Math.floor(el.getBoundingClientRect().width))));
  update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect();
 },[]);
 function select(entry:Entry){if(entry.kind==='pdf')onPDF(entry.id);else onTask(entry.id)}
 return <article className="lesson-folder-shell" data-open={open} aria-label={`${lesson.name} ders klasörü`}>
  <div className="lesson-folder-visual" ref={measure}>
   <GlassFolder label={lesson.name} meta={`${pending.length} görev · ${documents.length} PDF`} tone={theme} art={art} seed={hashString(lesson.id)%997} width={width} files={entries} controlledFiles action="more" open={open} onOpenChange={setOpen} appear={false} menu={[{label:'Planlayıcıya git',onSelect:onPlanner},{label:'PDF kütüphanesine git',onSelect:onLibrary}]} onFileSelect={(_,index)=>{const entry=entries[index];if(entry)select(entry)}}/>
  </div>
  <div className="lesson-folder-caption"><span><BookOpen size={14} style={{color:lesson.color}}/> {minutes} dk çalışma</span><button ref={toggle} className="text-button" aria-expanded={open} aria-controls={detailsId} onClick={()=>setOpen(v=>!v)}>{open?'İçeriği gizle':'İçeriği göster'} <ChevronRight size={14}/></button></div>
  <div id={detailsId} hidden={!open} className="lesson-folder-contents" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);toggle.current?.focus()}}}>
   <h3>{lesson.name}</h3><p>Derse bağlı görevler ve PDF’ler</p>
   {entries.length?<ul>{entries.map(entry=><li key={`${entry.kind}-${entry.id}`}><button onClick={()=>select(entry)}>{entry.kind==='pdf'?<FileText size={16}/>:<BookOpen size={16}/>}<span><strong>{entry.name}</strong><small>{entry.meta}</small></span><ArrowUpRight size={14}/></button></li>)}</ul>:<p className="empty">Bu klasör henüz boş. Planlayıcıdan bu derse görev ekleyebilir veya kütüphanede derse bağlı PDF’lerini görebilirsin.</p>}
   <div className="lesson-folder-links"><button className="text-button" onClick={onPlanner}>Planlayıcı <ArrowUpRight size={14}/></button><button className="text-button" onClick={onLibrary}>Kütüphane <ArrowUpRight size={14}/></button></div>
  </div>
  <div className="lesson-folder-actions"><button disabled={timerRunning} onClick={onFocus}>Bu derse odaklan <ArrowUpRight size={16}/></button><DeleteAction name={lesson.name} disabled={deletingDisabled} description="Ders listeden kaldırılır. Bu derse bağlı görevler, PDF’ler ve çalışma geçmişi korunur." onDelete={onDelete}/></div>
 </article>;
}
