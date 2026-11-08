import {useEffect,useRef,useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {getVersion} from '@tauri-apps/api/app';
import {desktop} from './storage';
import './updates.css';
type Status={status:'development'|'unconfigured'|'available'|'current';version:string|null};
export function UpdatePanel({beforeInstall,timerRunning}:{beforeInstall:()=>Promise<void>;timerRunning:boolean}){
 const [result,setResult]=useState<Status|null>(null),[busy,setBusy]=useState(false),[installing,setInstalling]=useState(false),[error,setError]=useState(''),[version,setVersion]=useState('');
 const dialog=useRef<HTMLDialogElement>(null);
 const lock=useRef(false);
 async function check(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{setResult(await invoke<Status>('check_update'))}catch{setError('Güncellemeler kontrol edilemedi. İnternet bağlantısını kontrol edip tekrar dene.')}finally{lock.current=false;setBusy(false)}}
 useEffect(()=>{if(!desktop)return;void getVersion().then(setVersion).catch(()=>{});const id=setTimeout(()=>void check(),1500);return()=>clearTimeout(id)},[]);
 async function install(){if(timerRunning||lock.current)return;lock.current=true;setInstalling(true);setError('');dialog.current?.showModal();try{await beforeInstall();await invoke('install_update')}catch{setError('Güncelleme yüklenemedi. Kayıt veya indirme işlemi başarısız oldu; mevcut sürümü kullanmaya devam edebilirsin.');setResult(null)}finally{dialog.current?.close();setInstalling(false);lock.current=false}}
 if(!desktop)return null;
 const message=busy?'Yeni sürüm kontrol ediliyor…':result?.status==='available'?`Yeni sürüm hazır: ${result.version}`:result?.status==='current'?'En güncel sürümü kullanıyorsun.':result?.status==='development'?'Geliştirme sürümü · Değişiklikler proje klasöründen yüklenir.':result?.status==='unconfigured'?'Otomatik güncelleme için GitHub yayın bağlantısı henüz tanımlanmadı.':'Güncellemeleri kontrol edebilirsin.';
 return <><section className="update-panel" aria-label="Uygulama güncellemeleri"><div><strong>StudyOS {version&&`v${version}`}</strong><p role="status">{message}</p>{error&&<p role="alert" className="conflict">{error}</p>}{result?.status==='available'&&<small>{timerRunning?'Güncellemeden önce sayacı duraklat.':'Kayıtların kaydedilecek; kurulum sırasında uygulama kapanıp yeniden açılacak.'}</small>}</div><div>{result?.status==='available'&&<button className="primary" disabled={timerRunning||busy||installing} onClick={()=>void install()}>Güncelle</button>}<button disabled={busy||installing} onClick={()=>void check()}>Kontrol et</button></div></section><dialog ref={dialog} className="update-dialog" onCancel={e=>e.preventDefault()}><h2>StudyOS güncelleniyor</h2><p>Kayıtlar kaydediliyor ve yeni sürüm kuruluyor. Lütfen uygulamayı açık bırak.</p></dialog></>;
}
