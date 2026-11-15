export type SoundSettings={effects:boolean;alarm:boolean;volume:number};
export function soundSettings(value?:Partial<SoundSettings>):SoundSettings{
 return {effects:typeof value?.effects==='boolean'?value.effects:true,alarm:typeof value?.alarm==='boolean'?value.alarm:true,volume:typeof value?.volume==='number'&&Number.isFinite(value.volume)?Math.max(0,Math.min(1,value.volume)):.45};
}
export function completedDeadline(timer:{deadline:number|null},now:number,last:number|null):number|null{
 return timer.deadline!==null&&timer.deadline<=now&&timer.deadline!==last?timer.deadline:null;
}
/** Local synthesized sounds: no downloads, microphone or external service. */
export class StudyAudio{
 private context:AudioContext|null=null;
 private nodes=new Set<OscillatorNode>();
 private alarmNodes=new Set<OscillatorNode>();
 private revision=0;
 scheduled:number|null=null;
 private scheduledVolume=0;
 private alarmTime=0;
 wasScheduled(deadline:number){return this.scheduled===deadline&&!!this.context&&(this.context.currentTime>=this.alarmTime||(this.context.state==='running'&&Date.now()-deadline<2000))}
 async unlock(){
  try{this.context??=new AudioContext();if(this.context.state==='suspended')await this.context.resume();return this.context.state==='running'}catch{return false}
 }
 async play(kind:'click'|'navigate'|'alarm',volume:number){
  const revision=this.revision;
  if(volume<=0)return false;
  if(!await this.unlock()||!this.context||revision!==this.revision)return false;
  return this.emit(kind,volume);
 }
 scheduleAlarm(deadline:number|null,volume:number){
  if(this.scheduled===deadline&&this.scheduledVolume===volume)return this.scheduled!==null;
  this.stopAlarm();
  if(deadline===null||deadline<=Date.now()||volume<=0||this.context?.state!=='running')return false;
  this.scheduled=deadline;this.scheduledVolume=volume;this.alarmTime=this.context.currentTime+(deadline-Date.now())/1000;return this.emit('alarm',volume,(deadline-Date.now())/1000);
 }
 stopAlarm(){this.revision++;for(const node of this.alarmNodes){try{node.stop()}catch{}}this.alarmNodes.clear();this.scheduled=null;}
 private emit(kind:'click'|'navigate'|'alarm',volume:number,delay=0){
  if(!this.context)return false;
  const context=this.context,time=context.currentTime+Math.max(0,delay);
  const notes=kind==='alarm'?[0,1].flatMap(round=>[660,830,990].map((frequency,i)=>({frequency,delay:round*1.25+i*.23,duration:.65}))):[{frequency:kind==='navigate'?570:850,delay:0,duration:kind==='navigate'?.1:.045}];
  for(const note of notes){
   const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=note.frequency;
   const start=time+note.delay,end=start+note.duration;
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume*(kind==='alarm'?.3:.08),start+.008);gain.gain.exponentialRampToValueAtTime(.0001,end);
   oscillator.connect(gain);gain.connect(context.destination);this.nodes.add(oscillator);if(kind==='alarm')this.alarmNodes.add(oscillator);
   oscillator.onended=()=>{this.nodes.delete(oscillator);this.alarmNodes.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(start);oscillator.stop(end+.02);
  }return true;
 }
 stop(){this.stopAlarm();for(const node of this.nodes){try{node.stop()}catch{}}this.nodes.clear()}
 dispose(){this.stop();const context=this.context;this.context=null;if(context)void context.close().catch(()=>{})}
}
