import {useRef,useState} from 'react';
import {Trash2} from 'lucide-react';
import HoldButton from './HoldButton';
import './delete.css';
export function DeleteAction({name,description,onDelete,disabled=false}:{name:string;description?:string;onDelete:()=>Promise<void>;disabled?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),lock=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 function open(){setError('');dialog.current?.showModal()}
 async function execute(){if(lock.current||disabled)return;lock.current=true;setBusy(true);setError('');if(!dialog.current?.open)dialog.current?.showModal();try{await onDelete();dialog.current?.close()}catch(e){setError(`Silinemedi. Kayıt korundu. ${String(e)}`);setAttempt(n=>n+1)}finally{lock.current=false;setBusy(false)}}
 return <div className="delete-action"><HoldButton key={attempt} label={`${name}: silmek için 2 saniye basılı tut`} size="sm" radius={12} backgroundColor="var(--delete-bg)" fillColor="var(--delete-fill)" textColor="var(--delete-text)" fillTextColor="#fff" doneLabel="İşleniyor…" icon={<Trash2 size={14}/>} holdTime={2000} releaseTime={200} pressScale={.98} wave glow={false} disabled={disabled||busy} onHold={()=>void execute()} onTap={open}>Basılı tut · Sil</HoldButton><dialog ref={dialog} className="delete-dialog" aria-label={`${name} silme onayı`} onCancel={e=>{if(busy)e.preventDefault()}}><Trash2 size={25}/><h2>{busy?'Kayıt güncelleniyor…':'Bu öğe kaldırılsın mı?'}</h2><strong>{name}</strong><p>{description||'Bu öğe kaldırılacak. Bu işlem geri alınamaz.'}</p>{error&&<p className="conflict" role="alert">{error}</p>}<div className="delete-dialog-actions"><button autoFocus disabled={busy} onClick={()=>dialog.current?.close()}>Vazgeç</button><button className="danger-button" disabled={busy} onClick={()=>void execute()}>{busy?'İşleniyor…':'Evet, sil'}</button></div></dialog></div>;
}
