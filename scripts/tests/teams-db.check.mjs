import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

test('Teams database: membership isolation, invitation lifecycle and shared resource permissions',async t=>{
 const db=new PGlite();
 const owner='10000000-0000-4000-8000-000000000001',friend='10000000-0000-4000-8000-000000000002',stranger='10000000-0000-4000-8000-000000000003';
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);grant usage on schema auth to authenticated,anon;
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   create schema storage;grant usage on schema storage to authenticated;
   create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
   create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
   alter table storage.objects enable row level security;grant select,insert,delete on storage.objects to authenticated;
   insert into auth.users values('${owner}'),('${friend}'),('${stranger}');`);
  const migration=readFileSync(new URL('../../supabase/migrations/202611150001_teams.sql',import.meta.url),'utf8');
  await db.exec(migration);
  await t.test('migration can be reapplied without destroying existing tables',async()=>{await db.exec(migration)});
  const as=async uid=>{await db.exec('reset role;set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid])};
  const rpc=async(sql,args=[])=>{const {rows}=await db.query(sql,args);return rows[0]?.result};
  await as(owner);const team=await rpc('select public.study_team_create($1,$2) as result',['Mühendislik','Ahmet']);
  const invite=await rpc('select public.study_team_invite($1) as result',[team]);assert.match(invite.code,/^ST-[A-F0-9]{32}$/);
  await t.test('outsider cannot see rows, read snapshot or forge membership',async()=>{
   await as(stranger);assert.equal((await db.query('select * from public.study_teams')).rows.length,0);
   await assert.rejects(()=>rpc('select public.study_team_snapshot($1) as result',[team]),/erişimin/);
   await assert.rejects(()=>db.query('insert into public.study_team_members(team_id,user_id,display_name) values($1,$2,$3)',[team,stranger,'Fake']));
  });
  await t.test('invite is reusable by friends but joining twice does not consume another use',async()=>{
   await as(friend);assert.equal(await rpc('select public.study_team_join($1,$2) as result',[invite.code,'Ayşe']),team);
   assert.equal(await rpc('select public.study_team_join($1,$2) as result',[invite.code,'Ayşe']),team);
   await db.exec('reset role');const {rows}=await db.query('select uses from study_private.invites where team_id=$1',[team]);assert.equal(rows[0].uses,1);
  });
  let slot;
  await t.test('members share plans but only creator or owner can edit, with revision checks',async()=>{
   await as(owner);slot=await rpc("select public.study_team_save_slot($1,null,null,'Dişliler','Ortak tekrar',now()+interval '1 day',60) as result",[team]);
   await as(friend);const snapshot=await rpc('select public.study_team_snapshot($1) as result',[team]);assert.equal(snapshot.slots[0].id,slot);
   await assert.rejects(()=>rpc("select public.study_team_save_slot($1,$2,1,'Bad','',now()+interval '1 day',60) as result",[team,slot]),/yetkin/);
   await rpc('select public.study_team_attend($1,true) as result',[slot]);
   await as(owner);await rpc("select public.study_team_save_slot($1,$2,1,'Yeni konu','',now()+interval '1 day',60) as result",[team,slot]);
   await assert.rejects(()=>rpc('select public.study_team_delete_slot($1,1) as result',[slot]),/değişti/);
  });
  const file='20000000-0000-4000-8000-000000000001',objectPath=team+'/'+owner+'/'+file+'.pdf';
  await t.test('storage is private; uploads must use the authenticated member’s own folder',async()=>{
   await as(friend);await assert.rejects(()=>db.query("insert into storage.objects(bucket_id,name,metadata) values('study-team-files',$1,'{\"size\":10}')",[objectPath]));
   await as(owner);await db.query("insert into storage.objects(bucket_id,name,metadata) values('study-team-files',$1,'{\"size\":10}')",[objectPath]);
   await rpc('select public.study_team_add_file($1,$2,$3,10) as result',[team,file,'Sorular.pdf']);
   await as(friend);assert.equal((await db.query('select * from storage.objects')).rows.length,1);
   await assert.rejects(()=>rpc('select public.study_team_delete_file($1,false) as result',[file]),/yetkin/);
   await as(stranger);assert.equal((await db.query('select * from storage.objects')).rows.length,0);
  });
  await t.test('rotation and expiry prevent further invitation use',async()=>{
   await as(owner);const next=await rpc('select public.study_team_invite($1) as result',[team]);
   await as(stranger);await assert.rejects(()=>rpc('select public.study_team_join($1,$2) as result',[invite.code,'Ziyaretçi']),/geçersiz/);
   await db.exec('reset role');await db.query("update study_private.invites set expires_at=now()-interval '1 second' where team_id=$1",[team]);
   await as(stranger);await assert.rejects(()=>rpc('select public.study_team_join($1,$2) as result',[next.code,'Ziyaretçi']),/geçersiz/);
  });
  await t.test('removing a member immediately revokes plan and file access',async()=>{
   await as(owner);await rpc('select public.study_team_remove_member($1,$2) as result',[team,friend]);
   await as(friend);assert.equal((await db.query('select * from storage.objects')).rows.length,0);
   assert.equal((await db.query('select * from public.study_team_slots')).rows.length,0);
   await assert.rejects(()=>rpc('select public.study_team_attend($1,true) as result',[slot]),/üyeliği/);
  });
  await t.test('owner cannot accidentally leave and deleting files can be retried',async()=>{
   await as(owner);await assert.rejects(()=>rpc('select public.study_team_remove_member($1,$2) as result',[team,owner]),/ayrılamaz/);
   assert.equal(await rpc('select public.study_team_delete_file($1,false) as result',[file]),objectPath);
   assert.equal(await rpc('select public.study_team_delete_file($1,false) as result',[file]),objectPath);
   await db.query('delete from storage.objects where name=$1',[objectPath]);await rpc('select public.study_team_delete_file($1,true) as result',[file]);
   assert.equal((await db.query('select * from public.study_team_files')).rows.length,0);
  });
  await t.test('anonymous requests cannot invoke team writes',async()=>{
   await db.exec('reset role;set role anon');await db.query("select set_config('request.jwt.claim.sub','',false)");
   await assert.rejects(()=>rpc("select public.study_team_create('Fake','Guest') as result"));
  });
  await t.test('revoked invites cannot add users, but existing members retain access',async()=>{
   await as(owner);const next=await rpc('select public.study_team_invite($1) as result',[team]);await rpc('select public.study_team_invite($1,true) as result',[team]);
   assert.equal((await rpc('select public.study_team_snapshot($1) as result',[team])).teams.length,1);
   await as(stranger);await assert.rejects(()=>rpc('select public.study_team_join($1,$2) as result',[next.code,'Guest']),/geçersiz/);
  });
  await t.test('server limits team ownership instead of trusting the client',async()=>{
   await as(owner);for(let i=0;i<4;i++)await rpc('select public.study_team_create($1,$2) as result',['Pilot '+i,'Owner']);
   await assert.rejects(()=>rpc('select public.study_team_create($1,$2) as result',['Too many','Owner']),/beş/);
  });
 }finally{await db.close()}
});
