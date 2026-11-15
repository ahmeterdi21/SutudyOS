import {invoke} from '@tauri-apps/api/core';
export type TeamStatus={configured:boolean;project_url?:string;user_id?:string;email?:string};
export type Team={id:string;name:string;owner_id:string;created_at:string};
export type TeamMember={team_id:string;user_id:string;display_name:string;joined_at:string};
export type TeamSlot={id:string;team_id:string;title:string;topic:string;starts_at:string;duration_minutes:number;created_by:string;revision:number;attendees:string[]};
export type TeamFile={id:string;team_id:string;name:string;size:number;uploaded_by:string;created_at:string;deleting:boolean};
export type TeamSnapshot={schema_version:1;selected_id:string|null;teams:Team[];members:TeamMember[];slots:TeamSlot[];files:TeamFile[]};
export function teamCall<T=unknown>(input:{action:string;[key:string]:unknown}):Promise<T>{return invoke<T>('teams_call',{input})}
export function localDateTime(iso:string){const date=new Date(iso);if(!Number.isFinite(date.getTime()))return '';const pad=(n:number)=>String(n).padStart(2,'0');return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`}
export function teamSlotInput(form:FormData){
 const title=String(form.get('title')||'').trim(),topic=String(form.get('topic')||'').trim(),local=String(form.get('starts_at')||''),duration=Number(form.get('duration'));
 const date=new Date(local);
 if(!title||title.length>100||topic.length>400)throw Error('Başlık ve konu uzunluğunu kontrol et.');
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(local)||!Number.isFinite(date.getTime())||localDateTime(date.toISOString())!==local)throw Error('Geçerli bir yerel tarih ve saat seç.');
 if(!Number.isInteger(duration)||duration<5||duration>240)throw Error('Süre 5–240 dakika arasında olmalı.');
 return {title,topic,starts_at:date.toISOString(),duration};
}
export function normalizeTeamCode(code:string){const normalized=code.trim().toUpperCase().replace(/^ST-/,'').replaceAll('-','');if(!/^[0-9A-F]{32}$/.test(normalized))throw Error('Davet kodunu eksiksiz yapıştır.');return 'ST-'+normalized}
