import {describe,it,expect} from 'vitest';
import {defaultGlass,normalizeGlass,glassStyle} from './glass';
describe('durable glass preferences',()=>{
 it('opens old records without glass settings',()=>{expect(normalizeGlass(undefined)).toEqual(defaultGlass)});
 it('clamps opacity and blur while rejecting invalid tint and backdrop',()=>{const g=normalizeGlass({blur:200,opacity:0,saturation:NaN,tint:'url(unsafe)',backdrop:'missing' as never,edge:-3});expect(g).toEqual({...defaultGlass,blur:40,opacity:.15,edge:0})});
 it('preserves valid custom settings after JSON serialization',()=>{const g={...defaultGlass,blur:32,opacity:.6,tint:'#123abc',backdrop:'dusk' as const};expect(normalizeGlass(JSON.parse(JSON.stringify(g)))).toEqual(g);expect(glassStyle(g)).toHaveProperty('--glass-blur','32px')});
});
