type CloseEvent={preventDefault:()=>void};
export function createCloseCoordinator(flush:()=>Promise<void>,requestClose:()=>Promise<void>,setBusy:(busy:boolean)=>void,onError:(error:unknown)=>void){
 let approved=false,pending=false;
 return async(event:CloseEvent)=>{
  if(approved)return;
  event.preventDefault();if(pending)return;
  pending=true;setBusy(true);
  try{await flush();approved=true;await requestClose()}
  catch(e){approved=false;onError(e)}
  finally{pending=false;setBusy(false)}
 };
}
