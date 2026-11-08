import {invoke,isTauri} from '@tauri-apps/api/core';
import {initial,type State} from './model';
export const desktop=isTauri();
export async function load():Promise<State>{const raw=desktop?await invoke<string|null>('load_state'):localStorage.getItem('studyos-v1'); if(!raw)return initial(); const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.sessions)||!s.timer)throw Error('Veri biçimi desteklenmiyor.');return s;}
export async function save(s:State){const json=JSON.stringify(s);if(desktop)await invoke('save_state',{json});else localStorage.setItem('studyos-v1',json);}
function pdfDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('studyos-pdfs',1);r.onupgradeneeded=()=>r.result.createObjectStore('pdfs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function putPDF(id:string,bytes:Uint8Array){if(desktop)return invoke('put_pdf',{id,bytes:Array.from(bytes)});const db=await pdfDB();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').put(bytes,id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};});}
export async function getPDF(id:string):Promise<Uint8Array>{if(desktop)return new Uint8Array(await invoke<number[]>('get_pdf',{id}));const db=await pdfDB();return new Promise((resolve,reject)=>{const r=db.transaction('pdfs').objectStore('pdfs').get(id);r.onsuccess=()=>{db.close();r.result?resolve(r.result):reject(Error('PDF bulunamadı'))};r.onerror=()=>{db.close();reject(r.error)};});}
