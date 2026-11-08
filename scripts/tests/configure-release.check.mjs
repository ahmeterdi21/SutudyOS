import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const key=Buffer.from('untrusted comment: minisign public key: TEST\nRWTEST\n').toString('base64');
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'studyos-release-test-'));
 for(const dir of ['scripts','src-tauri','release'])mkdirSync(join(root,dir));
 copyFileSync(new URL('../configure-release.mjs',import.meta.url),join(root,'scripts/configure-release.mjs'));
 writeFileSync(join(root,'package.json'),JSON.stringify({version:'0.2.1'}));
 writeFileSync(join(root,'src-tauri/tauri.conf.json'),JSON.stringify({version:'0.2.1'}));
 writeFileSync(join(root,'src-tauri/Cargo.toml'),'[package]\nversion = "0.2.1"\n');
 writeFileSync(join(root,'release/update-config.json'),'original');
 return root;
}
function run(root,extra={}){return spawnSync(process.execPath,[join(root,'scripts/configure-release.mjs')],{encoding:'utf8',env:{...process.env,STUDYOS_RELEASE_REPOSITORY:'ahmeterdi21/SutudyOS',STUDYOS_UPDATE_PUBLIC_KEY:key,GITHUB_REF_TYPE:'tag',GITHUB_REF_NAME:'v0.2.1',...extra}})}
test('passes the same public key to the runtime and bundle signer',()=>{
 const root=fixture();try{
  const result=run(root);assert.equal(result.status,0,result.stderr);
  const runtime=JSON.parse(readFileSync(join(root,'release/update-config.json')));
  const bundle=JSON.parse(readFileSync(join(root,'src-tauri/tauri.release.conf.json')));
  assert.equal(runtime.publicKey,key);assert.equal(bundle.plugins.updater.pubkey,key);
  assert.deepEqual(bundle.plugins.updater.endpoints,['https://github.com/ahmeterdi21/SutudyOS/releases/latest/download/latest.json']);
  assert.equal(bundle.bundle.createUpdaterArtifacts,true);
 }finally{rmSync(root,{recursive:true,force:true})}
});
test('invalid public keys leave configuration unchanged',()=>{
 const root=fixture();try{assert.notEqual(run(root,{STUDYOS_UPDATE_PUBLIC_KEY:'invalid'}).status,0);assert.equal(readFileSync(join(root,'release/update-config.json'),'utf8'),'original')}finally{rmSync(root,{recursive:true,force:true})}
});
test('tag mismatch leaves configuration unchanged',()=>{
 const root=fixture();try{assert.notEqual(run(root,{GITHUB_REF_NAME:'v0.2.0'}).status,0);assert.equal(readFileSync(join(root,'release/update-config.json'),'utf8'),'original')}finally{rmSync(root,{recursive:true,force:true})}
});
