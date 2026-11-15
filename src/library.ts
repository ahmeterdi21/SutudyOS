import type {State,LibraryFolder} from './model';
export type LibraryLocation={lesson:string;folderId?:string};
export function libraryPath(s:State,location:LibraryLocation):LibraryFolder[]{
 const result:LibraryFolder[]=[],seen=new Set<string>();let id=location.folderId;
 while(id){if(seen.has(id))throw Error('Klasör yolu geçerli değil.');seen.add(id);const folder=s.folders?.find(f=>f.id===id&&f.lesson===location.lesson);if(!folder)throw Error('Klasör bulunamadı.');result.unshift(folder);id=folder.parentId;}
 return result;
}
export function addLibraryFolder(s:State,location:LibraryLocation,name:string,id:string):State{
 libraryPath(s,location);name=name.trim();if(!name||name.length>80)throw Error('1–80 karakterlik bir klasör adı gir.');
 if((s.folders||[]).some(f=>f.lesson===location.lesson&&f.parentId===location.folderId&&f.name.toLocaleLowerCase('tr-TR')===name.toLocaleLowerCase('tr-TR')))throw Error('Bu konumda aynı isimde bir klasör var.');
 return {...s,folders:[...(s.folders||[]),{id,name,lesson:location.lesson,...(location.folderId?{parentId:location.folderId}:{})}]};
}
export function moveLibraryDocument(s:State,id:string,location:LibraryLocation):State{
 libraryPath(s,location);if(!s.docs.some(d=>d.id===id))throw Error('PDF bulunamadı.');
 return {...s,docs:s.docs.map(d=>{if(d.id!==id)return d;const {folderId:_,...rest}=d;return {...rest,lesson:location.lesson,...(location.folderId?{folderId:location.folderId}:{})}})};
}
export function libraryLessons(s:State){
 const ids=new Set([...s.docs.map(d=>d.lesson),...(s.folders||[]).map(f=>f.lesson)]);
 const roots=s.lessons.filter(l=>!l.archived||ids.has(l.id));
 for(const id of ids)if(id&&!roots.some(l=>l.id===id))roots.push({id,name:'Eski ders',color:'#9baeff',archived:true});
 return [...roots,{id:'',name:'Genel dosyalar',color:'#9baeff'}];
}
