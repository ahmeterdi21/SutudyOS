import {useEffect,useRef,useState,type ReactNode} from 'react';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {Minus,Square,Copy,X} from 'lucide-react';
import {desktop} from '../storage';
import {createCloseCoordinator} from '../windowLifecycle';
import './window-chrome.css';

export function WindowChrome({children,beforeClose,onError}:{children:ReactNode;beforeClose:()=>Promise<void>;onError:(message:string)=>void}){
 const [maximized,setMaximized]=useState(false),[focused,setFocused]=useState(true),[closing,setClosing]=useState(false);
 const callbacks=useRef({beforeClose,onError});callbacks.current={beforeClose,onError};
 const closeLock=useRef(false);
 useEffect(()=>{
  if(!desktop)return;
  const win=getCurrentWindow();let disposed=false;const stops:(()=>void)[]=[];
  const fail=(e:unknown)=>{if(!disposed)callbacks.current.onError(`Pencere işlemi tamamlanamadı. ${String(e)}`)};
  const track=(job:Promise<()=>void>)=>{void job.then(stop=>{if(disposed)stop();else stops.push(stop)}).catch(fail)};
  const refresh=()=>{void win.isMaximized().then(v=>{if(!disposed)setMaximized(v)}).catch(fail)};
  refresh();void win.isFocused().then(v=>{if(!disposed)setFocused(v)}).catch(fail);
  track(win.onResized(refresh));
  track(win.onFocusChanged(({payload})=>{if(!disposed)setFocused(payload)}));
  track(win.onCloseRequested(createCloseCoordinator(
   ()=>callbacks.current.beforeClose(),
   async()=>{if(!disposed)await win.close()},
   busy=>{closeLock.current=busy;if(!disposed)setClosing(busy)},
   e=>{if(!disposed)callbacks.current.onError(`Kayıtlar kaydedilemediği için pencere açık bırakıldı. ${String(e)}`)},
  )));
  return()=>{disposed=true;stops.forEach(stop=>stop())};
 },[]);
 async function action(kind:'minimize'|'maximize'|'close'){
  if(!desktop||closeLock.current)return;
  try{const win=getCurrentWindow();if(kind==='minimize')await win.minimize();else if(kind==='maximize')await win.toggleMaximize();else await win.close()}
  catch(e){callbacks.current.onError(`Pencere işlemi tamamlanamadı. ${String(e)}`)}
 }
 return <header className="window-chrome" data-desktop={desktop} data-focused={focused} data-maximized={maximized}>
  {desktop&&<div className="window-drag-region" data-tauri-drag-region aria-hidden="true"/>}
  {children}
  {desktop&&<div className="window-controls" role="group" aria-label="Pencere kontrolleri"><button type="button" aria-label="Pencereyi küçült" title="Küçült" disabled={closing} onClick={()=>void action('minimize')}><Minus size={15}/></button><button type="button" aria-label={maximized?'Pencereyi geri yükle':'Pencereyi büyüt'} title={maximized?'Geri yükle':'Büyüt'} disabled={closing} onClick={()=>void action('maximize')}>{maximized?<Copy size={13}/>:<Square size={13}/>}</button><button type="button" className="window-close" aria-label="StudyOS’u kapat" title="Kapat" disabled={closing} onClick={()=>void action('close')}><X size={16}/></button></div>}
 </header>;
}
