import {expect,it} from 'vitest';
import {initial} from './model';
import {addLibraryFolder,libraryLessons,libraryPath,moveLibraryDocument} from './library';
it('creates nested folders with a stable lesson path without changing existing PDFs',()=>{
 const s=initial();s.docs=[{id:'pdf',name:'Not.pdf',lesson:'m',size:10}];
 const one=addLibraryFolder(s,{lesson:'m'},'Çıkmış sorular','a');const two=addLibraryFolder(one,{lesson:'m',folderId:'a'},'2025','b');
 expect(libraryPath(two,{lesson:'m',folderId:'b'}).map(f=>f.name)).toEqual(['Çıkmış sorular','2025']);expect(two.docs).toEqual(s.docs);
 expect(()=>addLibraryFolder(two,{lesson:'m'},'çıkmış sorular','c')).toThrow();
});
it('moves only document metadata, including between lessons and back to a root',()=>{
 const s=addLibraryFolder(initial(),{lesson:'m'},'Örnekler','a');s.docs=[{id:'p',name:'Soru.pdf',lesson:'',size:12}];
 const moved=moveLibraryDocument(s,'p',{lesson:'m',folderId:'a'});expect(moved.docs[0]).toEqual({...s.docs[0],lesson:'m',folderId:'a'});
 expect(moveLibraryDocument(moved,'p',{lesson:''}).docs[0]).toEqual(s.docs[0]);expect(s.docs[0].folderId).toBeUndefined();
 expect(()=>moveLibraryDocument(s,'p',{lesson:'wrong',folderId:'a'})).toThrow();
});
it('preserves access to archived and legacy lesson collections',()=>{
 const s=initial();s.lessons=[{id:'m',name:'Makine',color:'#abc',archived:true}];s.docs=[{id:'a',name:'x.pdf',lesson:'m',size:1},{id:'b',name:'y.pdf',lesson:'legacy',size:1}];
 expect(libraryLessons(s).map(l=>l.id)).toEqual(['m','legacy','']);
});
it('rejects cycles and broken parent references',()=>{
 const s=initial();s.folders=[{id:'a',lesson:'m',name:'A',parentId:'b'},{id:'b',lesson:'m',name:'B',parentId:'a'}];
 expect(()=>libraryPath(s,{lesson:'m',folderId:'a'})).toThrow();expect(()=>libraryPath(s,{lesson:'m',folderId:'missing'})).toThrow();
});
