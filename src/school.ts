export type SchoolItem={title:string;url:string;date?:string};
export type SchoolSource={id:string;name:string;url:string;items:SchoolItem[];lastChecked?:number;lastAttempt?:number;error?:string;enabled:boolean;kind?:'feed'|'page'};
export const SCHOOL_INTERVAL=12*60*60*1000;
export function schoolDue(source:SchoolSource,now=Date.now()){
 if(!source.enabled)return false;
 const check=source.lastChecked||0,attempt=source.lastAttempt||0;
 return (!check||now-check>=SCHOOL_INTERVAL||check>now)&&(!attempt||now-attempt>=30*60*1000||attempt>now);
}
export function schoolUrl(raw:string,base?:string):string{
 if(!raw.trim())throw Error('Duyuru adresi boş olamaz.');
 const u=new URL(raw.trim(),base);
 if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||!u.hostname.includes('.')||u.hostname.endsWith('.local')||u.hostname==='localhost'||u.href.length>2048)throw Error('Herkese açık bir HTTPS duyuru veya RSS adresi gir.');
 u.hash='';return u.href;
}
export function uniqueSchoolItems(items:SchoolItem[]){
 const seen=new Set<string>();return items.filter(item=>{if(!item.title.trim()||seen.has(item.url))return false;seen.add(item.url);return true}).slice(0,30);
}
// Remote markup stays in an inert parsed document; only text and validated URLs reach React.
export function parseSchoolPage(body:string,base:string,contentType:string):{items:SchoolItem[];feed?:string;kind:'feed'|'page'}{
 const xml=/xml|rss|atom/.test(contentType)||/^\s*(<\?xml|<rss|<feed)/i.test(body);
 const doc=new DOMParser().parseFromString(body,xml?'application/xml':'text/html');
 const entries=Array.from(doc.querySelectorAll('item,entry'));
 const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
 if(entries.length){
  const items=entries.flatMap(entry=>{const title=clean(entry.querySelector('title')?.textContent||'').slice(0,240);const link=entry.querySelector('link[rel="alternate"],link:not([rel])');const raw=link?.getAttribute('href')||link?.textContent||'';try{return [{title,url:schoolUrl(raw,base),date:clean(entry.querySelector('pubDate,published,updated')?.textContent||'').slice(0,100)}]}catch{return []}});
  return {items:uniqueSchoolItems(items),kind:'feed'};
 }
 if(xml)return {items:[],kind:'feed'};
 const discovered=doc.querySelector('link[type="application/rss+xml"],link[type="application/atom+xml"]')?.getAttribute('href');
 let feed:string|undefined;try{if(discovered)feed=schoolUrl(discovered,base)}catch{}
 doc.querySelectorAll('script,style,nav,header,footer,form,aside,noscript,svg').forEach(e=>e.remove());
 let scope:Element=doc.querySelector('main,[role="main"]')||doc.body;
 const host=new URL(base);
 const uludag=host.hostname==='uludag.edu.tr'||host.hostname==='www.uludag.edu.tr';
 if(uludag){
  const heading=Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6')).find(h=>/genel duyurular/i.test(clean(h.textContent||'')));
  if(!heading)return {items:[],kind:'page'};
  let parent=heading.parentElement;
  while(parent&&!Array.from(parent.querySelectorAll('a[href]')).some(a=>/-\d+(?:#.*)?$/.test(a.getAttribute('href')||'')))parent=parent.parentElement;
  if(!parent)return {items:[],kind:'page'};scope=parent;
 }

 const items=Array.from(scope.querySelectorAll('a[href]')).flatMap(link=>{
  const title=clean(link.textContent||link.getAttribute('title')||'');
  if(title.length<12||title.length>350||/^(devamını oku|read more|tüm duyurular|all announcements|gizlilik|privacy|iletişim|contact|ana sayfa|home|daha fazla)$/i.test(title))return [];
  try{const url=schoolUrl(link.getAttribute('href')||'',base);if(url===schoolUrl(base))return [];if(uludag){const u=new URL(url);if(u.hostname.replace(/^www\./,'')!=='uludag.edu.tr'||!u.pathname.startsWith(host.pathname.replace(/\/$/,'')+'/')||!/-\d+$/.test(u.pathname))return []}return [{title:title.slice(0,240),url}]}catch{return []}
 });
 return {items:uniqueSchoolItems(items),feed,kind:'page'};
}

// Uludağ's archive table is client-rendered; the department home exposes recent announcements.
export function schoolFetchUrl(raw:string){
 const u=new URL(schoolUrl(raw));
 if((u.hostname==='uludag.edu.tr'||u.hostname==='www.uludag.edu.tr')&&/^\/[^/]+\/duyuru\/?$/.test(u.pathname))u.pathname=u.pathname.replace(/\/duyuru\/?$/,'');
 return u.href;
}
