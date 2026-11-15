import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export function validateReleaseAssets(release,manifest,signature,{repository,version}){
 if(release.tag_name!==`v${version}`)throw Error('Release tag does not match the project version.');
 const installer=`StudyOS_${version}_x64-setup.exe`;
 const assets=[installer,installer+'.sig','latest.json'].map(name=>{
  const matches=release.assets.filter(asset=>asset.name===name&&asset.state==='uploaded'&&asset.size>0);
  if(matches.length!==1)throw Error(`Missing or ambiguous release asset: ${name}`);
  return matches[0];
 });
 if(manifest.version!==version)throw Error('Updater manifest version does not match the release.');
 const platforms=['windows-x86_64','windows-x86_64-nsis'].map(key=>manifest.platforms?.[key]).filter(Boolean);
 if(!platforms.length)throw Error('Windows updater platform is missing.');
 for(const platform of platforms){
  const url=new URL(platform.url);
  const download=url.hostname==='github.com'&&decodeURIComponent(url.pathname)===`/${repository}/releases/download/v${version}/${installer}`;
  const apiAsset=url.hostname==='api.github.com'&&Number.isSafeInteger(assets[0].id)&&url.pathname===`/repos/${repository}/releases/assets/${assets[0].id}`;
  if(url.protocol!=='https:'||url.username||url.password||(!download&&!apiAsset))throw Error('Updater URL does not point to this release installer.');
  if(!signature.trim()||platform.signature?.trim()!==signature.trim())throw Error('Updater and installer signatures differ.');
 }
 return assets;
}
async function main(){
 const repository=process.env.GITHUB_REPOSITORY,token=process.env.GITHUB_TOKEN,tag=process.env.GITHUB_REF_NAME;
 const version=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).version;
 if(!token||!repository||!/^[-\w.]+\/[-\w.]+$/.test(repository)||tag!==`v${version}`)throw Error('Publication requires a matching release tag and GitHub Actions credentials.');
 const notes=readFileSync(new URL(`../RELEASE-NOTES-v${version}.md`,import.meta.url),'utf8');
 async function request(path,{binary=false,body}={}){
  const response=await fetch(`https://api.github.com${path}`,{method:body?'PATCH':'GET',headers:{Authorization:`Bearer ${token}`,Accept:binary?'application/octet-stream':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'StudyOS-Release','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!response.ok)throw Error(`GitHub release request failed (${response.status}).`);
  return binary?response.text():response.json();
 }
 const releases=await request(`/repos/${repository}/releases?per_page=100`);
 const release=releases.find(item=>item.tag_name===tag);
 if(!release)throw Error('The completed draft release was not found.');
 // Check names before downloading draft assets; publishing never happens on a partial upload.
 const getAsset=name=>{const asset=release.assets.find(asset=>asset.name===name&&asset.state==='uploaded'&&asset.size>0);if(!asset)throw Error(`Missing release asset: ${name}`);return asset};
 const manifestAsset=getAsset('latest.json'),signatureAsset=getAsset(`StudyOS_${version}_x64-setup.exe.sig`);
 const manifest=JSON.parse(await request(`/repos/${repository}/releases/assets/${manifestAsset.id}`,{binary:true}));
 const signature=await request(`/repos/${repository}/releases/assets/${signatureAsset.id}`,{binary:true});
 validateReleaseAssets(release,manifest,signature,{repository,version});
 const published=await request(`/repos/${repository}/releases/${release.id}`,{body:{name:`StudyOS v${version}`,body:notes,draft:false,prerelease:false,make_latest:'true'}});
 if(published.draft)throw Error('Release is still a draft.');
 console.log(`Published StudyOS v${version}: ${published.html_url}`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
