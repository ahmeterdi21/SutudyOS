import type {CSSProperties} from 'react';
export type GlassSettings={blur:number;opacity:number;saturation:number;tint:string;edge:number;backdrop:'aurora'|'dusk'|'coast'};
export const defaultGlass:GlassSettings={blur:24,opacity:.38,saturation:1.2,tint:'#7186ad',edge:.45,backdrop:'aurora'};
const bound=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
export function normalizeGlass(value:Partial<GlassSettings>|undefined):GlassSettings{const v=value||{};return {blur:bound(v.blur,0,40,24),opacity:bound(v.opacity,.15,.85,.38),saturation:bound(v.saturation,.5,2,1.2),edge:bound(v.edge,0,1,.45),tint:typeof v.tint==='string'&&/^#[0-9a-f]{6}$/i.test(v.tint)?v.tint:defaultGlass.tint,backdrop:['aurora','dusk','coast'].includes(v.backdrop||'')?v.backdrop!:defaultGlass.backdrop}}
export function glassStyle(value:Partial<GlassSettings>|undefined):CSSProperties{const g=normalizeGlass(value);return {'--glass-blur':`${g.blur}px`,'--glass-opacity':g.opacity,'--glass-saturation':g.saturation,'--glass-tint':g.tint,'--glass-edge':g.edge} as CSSProperties}
