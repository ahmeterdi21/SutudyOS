export function BrandMark({className=''}:{className?:string}){
 return <svg className={className} viewBox="0 0 160 160" fill="none" aria-hidden="true"><rect x="1" y="1" width="158" height="158" rx="39" fill="var(--logo-tile, #f5f7ff)"/><g fill="var(--logo-ink, #2447a7)">{Array.from({length:8},(_,i)=><path key={i} d="M80 73 54 20H73L89 39V65Z" transform={`rotate(${i*45} 80 80)`}/>)}</g></svg>;
}
