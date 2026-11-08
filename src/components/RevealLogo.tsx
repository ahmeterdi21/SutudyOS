import {useEffect,useState} from 'react';
import {BrandMark} from '../Brand';
import {GlassIconReveal} from './GlassLogo';
const logo=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><g fill="#2447a7">${Array.from({length:8},(_,i)=>`<path d="M80 73 54 20H73L89 39V65Z" transform="rotate(${i*45} 80 80)"/>`).join('')}</g></svg>`;
export function RevealLogo({theme,leaving}:{theme:'dark'|'light';leaving:boolean}){
 const [failed,setFailed]=useState(false),[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);
 return <div className={'reveal-stage '+(!failed&&!reduced?'reveal-animated ':'')+(leaving?'reveal-handoff':'')}><BrandMark className="reveal-static"/>{!failed&&!reduced&&<GlassIconReveal className="glass-engine" logo={logo} label="StudyOS logosu" look={theme} background={theme==='dark'?'#10131c':'#edf0f8'} logoColor="#2447a7" plateColor="#f5f7ff" iconPlate keepPlate tileSize={112} logoScale={.78} finalScale={1} loop={false} speed={1.25} tuning={{present:1.2,glide:1.1,startZoom:2,response:.35,drift:0}} onUnavailable={()=>setFailed(true)}/>}</div>;
}
