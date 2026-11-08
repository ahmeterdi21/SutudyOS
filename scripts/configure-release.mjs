import {readFileSync,writeFileSync} from 'node:fs';
const repository=process.env.STUDYOS_RELEASE_REPOSITORY;
const publicKey=process.env.STUDYOS_UPDATE_PUBLIC_KEY?.trim();
if(!repository||! /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))throw Error('STUDYOS_RELEASE_REPOSITORY: GitHub kullanıcı/depo bilgisini girin.');
if(!publicKey||!Buffer.from(publicKey,'base64').toString().startsWith('untrusted comment: minisign public key:'))throw Error('STUDYOS_UPDATE_PUBLIC_KEY: Tauri .pub dosyasının içeriğini girin. Özel anahtar kullanmayın.');
const version=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).version;
const tauri=JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json',import.meta.url)));
const cargo=readFileSync(new URL('../src-tauri/Cargo.toml',import.meta.url),'utf8').match(/^version = "([^"]+)"/m)?.[1];
if(tauri.version!==version||cargo!==version)throw Error('package.json, Cargo.toml ve tauri.conf.json sürümleri eşleşmiyor.');
if(process.env.GITHUB_REF_TYPE==='tag'&&process.env.GITHUB_REF_NAME!==`v${version}`)throw Error('Yayın etiketi proje sürümüyle eşleşmiyor.');
const endpoints=[`https://github.com/${repository}/releases/latest/download/latest.json`];
// The Rust updater and Tauri's bundle signer must use the same public key.
writeFileSync(new URL('../release/update-config.json',import.meta.url),JSON.stringify({repository,publicKey},null,2)+'\n');
writeFileSync(new URL('../src-tauri/tauri.release.conf.json',import.meta.url),JSON.stringify({
  bundle:{createUpdaterArtifacts:true},
  plugins:{updater:{pubkey:publicKey,endpoints,windows:{installMode:'passive'}}}
},null,2)+'\n');
console.log(`StudyOS ${version}: GitHub güncelleme adresi yapılandırıldı.`);
