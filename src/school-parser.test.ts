import {expect,it,beforeAll} from 'vitest';
import {DOMParser} from 'linkedom';
import {parseSchoolPage,schoolFetchUrl} from './school';
beforeAll(()=>{Object.assign(globalThis,{DOMParser})});
it('parses RSS and Atom titles and safe links without injecting markup',()=>{
 const rss=parseSchoolPage('<rss><channel><item><title>Sınav programı</title><link>https://school.edu/exam</link><pubDate>2026-11-15</pubDate></item><item><title>Unsafe</title><link>javascript:alert(1)</link></item></channel></rss>','https://school.edu/feed','application/rss+xml');
 expect(rss.items).toEqual([{title:'Sınav programı',url:'https://school.edu/exam',date:'2026-11-15'}]);
 const atom=parseSchoolPage('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Exam dates</title><link href="/exam"/><updated>2026-11-15</updated></entry></feed>','https://school.edu/feed','application/atom+xml');expect(atom.items[0].url).toBe('https://school.edu/exam');
});
it('extracts page links, ignores navigation and scripts, discovers feed',()=>{
 const result=parseSchoolPage('<html><head><link type="application/rss+xml" href="/rss"/></head><body><nav><a href="/menu">Unrelated navigation</a></nav><main><a href="/exam">Final sınavı programı</a><a href="/exam">Duplicate title</a><a href="javascript:alert(1)">Unsafe announcement</a><script>alert(1)</script></main></body></html>','https://school.edu/news','text/html');
 expect(result.items).toHaveLength(1);expect(result.items[0].title).toBe('Final sınavı programı');expect(result.feed).toBe('https://school.edu/rss');
});
it('Uludag uses department home and announcement section, never static menu pages',()=>{
 expect(schoolFetchUrl('https://uludag.edu.tr/makine/duyuru')).toBe('https://uludag.edu.tr/makine');
 const html='<html><body><a href="/makine/ders-planlari-2020">Ders planları menüsü</a><section><h2>GENEL DUYURULAR</h2><a href="/makine/duyuru">Tüm Duyurular</a><a href="/makine/2026-2027-guz-yariyili-arasinav-programi-100127">2026-2027 Güz Yarıyılı Arasınav Programı</a></section><section><h2>ETKİNLİKLER</h2><a href="/makine/seminer-100120">Bölüm seminer etkinliği</a></section></body></html>';
 const result=parseSchoolPage(html,'https://uludag.edu.tr/makine','text/html');expect(result.items).toHaveLength(1);expect(result.items[0].url).toContain('100127');
 expect(parseSchoolPage('<html><body><a href="/makine/ders-planlari-2020">Ders planları menüsü</a></body></html>','https://uludag.edu.tr/makine','text/html').items).toHaveLength(0);
});
