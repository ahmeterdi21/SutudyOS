import {invoke} from '@tauri-apps/api/core';
import {isPermissionGranted,requestPermission} from '@tauri-apps/plugin-notification';
import {desktop} from './storage';
export async function allowDesktopNotifications():Promise<boolean>{
 if(!desktop)throw Error('Windows bildirimleri masaüstü uygulamasında kullanılabilir.');
 return await isPermissionGranted()||(await requestPermission())==='granted';
}
export async function desktopNotificationsAllowed(){return desktop&&await isPermissionGranted()}
export async function notifyCompanion(title:string,body:string){await invoke('study_notify',{title,body})}
