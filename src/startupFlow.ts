import type {UpdateStatus} from './useUpdates';
export const STARTUP_MIN=3000;
export const STARTUP_MAX=4200;
export function startupCanLeave(ready:boolean,fatal:boolean,elapsed:number,checking:boolean){return ready&&!fatal&&elapsed>=STARTUP_MIN&&(!checking||elapsed>=STARTUP_MAX)}
export function startupMessage(ready:boolean,fatal:boolean,checking:boolean,status:UpdateStatus['status']|undefined,error:string,preview:boolean){
 if(fatal)return 'Çalışma alanın açılamadı.';
 if(!ready)return 'Kişisel çalışma alanın hazırlanıyor…';
 if(preview)return 'Çalışma alanın hazır.';
 if(checking)return 'Güncellemeler kontrol ediliyor…';
 if(error)return 'Güncelleme kontrolü daha sonra tekrar denenebilir.';
 if(status==='available')return 'Yeni bir sürüm hazır. İçeriden güncelleyebilirsin.';
 if(status==='current')return 'Her şey güncel. Başlamaya hazırsın.';
 if(status==='development')return 'Geliştirme alanın hazır.';
 if(status==='unconfigured')return 'Çalışma alanın hazır. Güncelleme kanalı henüz bağlı değil.';
 return 'Başlamaya hazırsın.';
}
