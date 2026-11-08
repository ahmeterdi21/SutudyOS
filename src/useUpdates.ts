import {useCallback,useEffect,useRef,useState} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {getVersion} from '@tauri-apps/api/app';
import {desktop} from './storage';
export type UpdateStatus={status:'development'|'unconfigured'|'available'|'current';version:string|null};
export function useUpdates(){
 const [result,setResult]=useState<UpdateStatus|null>(null),[busy,setBusy]=useState(desktop),[error,setError]=useState(''),[detail,setDetail]=useState(''),[version,setVersion]=useState('');
 const pending=useRef<Promise<void>|null>(null);
 const check=useCallback(()=>{
  if(pending.current)return pending.current;
  setBusy(true);setError('');setDetail('');
  const request=(async()=>{try{setResult(await invoke<UpdateStatus>('check_update'))}catch(e){setError('Güncelleme kontrolü tamamlanamadı. Mevcut sürümle devam edebilirsin.');setDetail(String(e))}finally{setBusy(false);pending.current=null}})();
  pending.current=request;return request;
 },[]);
 useEffect(()=>{if(!desktop){setBusy(false);return}void getVersion().then(setVersion).catch(()=>{});void check()},[check]);
 return {result,busy,error,detail,version,check};
}
export type Updates=ReturnType<typeof useUpdates>;
