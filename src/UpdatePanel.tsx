import {useRef,useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {desktop} from './storage';
import type {Updates} from './useUpdates';
import './updates.css';
export function UpdatePanel({beforeInstall,timerRunning,updates,showStatus=false}:{beforeInstall:()=>Promise<void>;timerRunning:boolean;updates:Updates;showStatus?:boolean}){
 const {result,busy,version,check}=updates;
 const [installing,setInstalling]=useState(false),[installError,setInstallError]=useState('');
 const error=installError||updates.error;
 const dialog=useRef<HTMLDialogElement>(null);
 const lock=useRef(false);
 async function install(){if(timerRunning||lock.current||busy)return;lock.current=true;setInstalling(true);setInstallError('');dialog.current?.showModal();try{await beforeInstall();await invoke('install_update')}catch{setInstallError('Güncelleme yüklenemedi. Kayıt veya indirme işlemi başarısız oldu; mevcut sürümü kullanmaya devam edebilirsin.');void check()}finally{dialog.current?.close();setInstalling(false);lock.current=false}}
 if(!desktop||(!showStatus&&!error&&result?.status!=='available'))return null;
 const message=busy?'Yeni sürüm kontrol ediliyor…':result?.status==='available'?`Yeni sürüm hazır: ${result.version}`:result?.status==='current'?'En güncel sürümü kullanıyorsun.':result?.status==='development'?'Geliştirme sürümü · Değişiklikler proje klasöründen yüklenir.':result?.status==='unconfigured'?'Otomatik güncelleme için GitHub yayın bağlantısı henüz tanımlanmadı.':'Güncellemeleri kontrol edebilirsin.';
 return <><section className="update-panel" aria-label="Uygulama güncellemeleri"><div><strong>StudyOS {version&&`v${version}`}</strong><p role="status">{message}</p>{error&&<p role="alert" className="conflict">{error}</p>}{result?.status==='available'&&<small>{timerRunning?'Güncellemeden önce sayacı duraklat.':'Kayıtların kaydedilecek; kurulum sırasında uygulama kapanıp yeniden açılacak.'}</small>}</div><div>{result?.status==='available'&&<button className="primary" disabled={timerRunning||busy||installing} onClick={()=>void install()}>Güncelle</button>}<button disabled={busy||installing} onClick={()=>void check()}>Kontrol et</button></div></section><dialog ref={dialog} className="update-dialog" onCancel={e=>e.preventDefault()}><h2>StudyOS güncelleniyor</h2><p>Kayıtlar kaydediliyor ve yeni sürüm kuruluyor. Lütfen uygulamayı açık bırak.</p></dialog></>;
}
