-- StudyOS Teams v1. Run once in a new Supabase project's SQL Editor.
-- No service-role key is shipped to clients. All writes use checked RPCs.
begin;
create schema if not exists study_private;
revoke all on schema study_private from public;
grant usage on schema study_private to authenticated;
create table if not exists public.study_teams(
 id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 3 and 60),
 owner_id uuid not null references auth.users(id),created_at timestamptz not null default now());
create table if not exists public.study_team_members(
 team_id uuid references public.study_teams(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 2 and 40),joined_at timestamptz not null default now(),primary key(team_id,user_id));
create table if not exists study_private.invites(
 team_id uuid primary key references public.study_teams(id) on delete cascade,code_hash bytea unique not null,
 expires_at timestamptz not null,uses integer not null default 0,max_uses integer not null default 20,revoked boolean not null default false);
create table if not exists public.study_team_slots(
 id uuid primary key default gen_random_uuid(),team_id uuid not null references public.study_teams(id) on delete cascade,
 title text not null check(length(title) between 1 and 100),topic text not null default '' check(length(topic)<=400),
 starts_at timestamptz not null,duration_minutes integer not null check(duration_minutes between 5 and 240),
 created_by uuid not null references auth.users(id),revision integer not null default 1,created_at timestamptz not null default now());
create table if not exists public.study_team_attendance(
 slot_id uuid references public.study_team_slots(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,primary key(slot_id,user_id));
create table if not exists public.study_team_files(
 id uuid primary key,team_id uuid not null references public.study_teams(id) on delete cascade,
 name text not null check(length(name) between 1 and 150),size bigint not null check(size between 5 and 26214400),
 storage_path text unique not null,uploaded_by uuid not null references auth.users(id),deleting boolean not null default false,
 created_at timestamptz not null default now());
create index if not exists study_members_user on public.study_team_members(user_id);
create index if not exists study_slots_team_time on public.study_team_slots(team_id,starts_at);
create index if not exists study_files_team on public.study_team_files(team_id);

create or replace function study_private.member(p_team uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.study_team_members where team_id=p_team and user_id=auth.uid()) $$;
create or replace function study_private.owner(p_team uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.study_teams where id=p_team and owner_id=auth.uid()) $$;
revoke all on function study_private.member(uuid),study_private.owner(uuid) from public;
grant execute on function study_private.member(uuid),study_private.owner(uuid) to authenticated;
alter table public.study_teams enable row level security;
alter table public.study_team_members enable row level security;
alter table public.study_team_slots enable row level security;
alter table public.study_team_attendance enable row level security;
alter table public.study_team_files enable row level security;
revoke all on public.study_teams,public.study_team_members,public.study_team_slots,public.study_team_attendance,public.study_team_files from anon,authenticated;
grant select on public.study_teams,public.study_team_members,public.study_team_slots,public.study_team_attendance,public.study_team_files to authenticated;
drop policy if exists study_team_read on public.study_teams;
create policy study_team_read on public.study_teams for select to authenticated using(study_private.member(id));
drop policy if exists study_member_read on public.study_team_members;
create policy study_member_read on public.study_team_members for select to authenticated using(study_private.member(team_id));
drop policy if exists study_slot_read on public.study_team_slots;
create policy study_slot_read on public.study_team_slots for select to authenticated using(study_private.member(team_id));
drop policy if exists study_attendance_read on public.study_team_attendance;
create policy study_attendance_read on public.study_team_attendance for select to authenticated using(exists(select 1 from public.study_team_slots where id=slot_id));
drop policy if exists study_file_read on public.study_team_files;
create policy study_file_read on public.study_team_files for select to authenticated using(study_private.member(team_id));

create or replace function public.study_team_create(p_name text,p_display_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;begin
 if auth.uid() is null then raise exception 'Önce giriş yap.';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if (select count(*) from public.study_teams where owner_id=auth.uid())>=5 then raise exception 'En fazla beş takım oluşturabilirsin.';end if;
 insert into public.study_teams(name,owner_id) values(trim(p_name),auth.uid()) returning id into result;
 insert into public.study_team_members values(result,auth.uid(),trim(p_display_name),now());return result;
end $$;
create or replace function public.study_team_invite(p_team_id uuid,p_revoke boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare code text;begin
 if not study_private.owner(p_team_id) then raise exception 'Bu işlem takım sahibine ait.';end if;
 perform 1 from public.study_teams where id=p_team_id for update;
 if p_revoke then update study_private.invites set revoked=true where team_id=p_team_id;return jsonb_build_object('revoked',true);end if;
 code:=upper(replace(gen_random_uuid()::text,'-',''));
 insert into study_private.invites(team_id,code_hash,expires_at) values(p_team_id,sha256(convert_to(code,'UTF8')),now()+interval '7 days')
 on conflict(team_id) do update set code_hash=excluded.code_hash,expires_at=excluded.expires_at,uses=0,revoked=false;
 return jsonb_build_object('code','ST-'||code,'expires_at',now()+interval '7 days');
end $$;
create or replace function public.study_team_join(p_code text,p_display_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare normalized text; invite study_private.invites%rowtype;begin
 if auth.uid() is null then raise exception 'Önce giriş yap.';end if;
 normalized:=replace(regexp_replace(upper(trim(p_code)),'^ST-',''),'-','');
 if normalized !~ '^[0-9A-F]{32}$' then raise exception 'Davet kodu geçersiz.';end if;
 select * into invite from study_private.invites where code_hash=sha256(convert_to(normalized,'UTF8'));
 if not found then raise exception 'Davet kodu geçersiz veya süresi dolmuş.';end if;
 perform 1 from public.study_teams where id=invite.team_id for update;
 select * into invite from study_private.invites where team_id=invite.team_id for update;
 if invite.revoked or invite.expires_at<=now() or invite.uses>=invite.max_uses or invite.code_hash<>sha256(convert_to(normalized,'UTF8')) then raise exception 'Davet kodu geçersiz veya süresi dolmuş.';end if;
 if study_private.member(invite.team_id) then return invite.team_id;end if;
 if (select count(*) from public.study_team_members where team_id=invite.team_id)>=20 then raise exception 'Takımın 20 kişilik sınırı doldu.';end if;
 insert into public.study_team_members(team_id,user_id,display_name) values(invite.team_id,auth.uid(),trim(p_display_name));
 update study_private.invites set uses=uses+1 where team_id=invite.team_id;return invite.team_id;
end $$;
create or replace function public.study_team_remove_member(p_team_id uuid,p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or (p_user_id<>auth.uid() and not study_private.owner(p_team_id)) then raise exception 'Bu üyelik üzerinde yetkin yok.';end if;
 if exists(select 1 from public.study_teams where id=p_team_id and owner_id=p_user_id) then raise exception 'Takım sahibi kendi takımından ayrılamaz.';end if;
 delete from public.study_team_attendance where user_id=p_user_id and slot_id in(select id from public.study_team_slots where team_id=p_team_id);
 delete from public.study_team_members where team_id=p_team_id and user_id=p_user_id;
end $$;
create or replace function public.study_team_save_slot(p_team_id uuid,p_id uuid,p_revision integer,p_title text,p_topic text,p_starts_at timestamptz,p_duration integer) returns uuid language plpgsql security definer set search_path='' as $$
declare current public.study_team_slots%rowtype;result uuid;begin
 if not study_private.member(p_team_id) then raise exception 'Takım üyeliği gerekiyor.';end if;
 if p_starts_at is null or p_starts_at<now()-interval '30 days' or p_starts_at>now()+interval '366 days' then raise exception 'Çalışma tarihi geçerli aralıkta değil.';end if;
 if p_id is null then
  insert into public.study_team_slots(team_id,title,topic,starts_at,duration_minutes,created_by) values(p_team_id,trim(p_title),trim(coalesce(p_topic,'')),p_starts_at,p_duration,auth.uid()) returning id into result;
  insert into public.study_team_attendance values(result,auth.uid());return result;
 end if;
 select * into current from public.study_team_slots where id=p_id and team_id=p_team_id for update;
 if not found or (current.created_by<>auth.uid() and not study_private.owner(p_team_id)) then raise exception 'Bu planı değiştirme yetkin yok.';end if;
 if p_revision is null or current.revision<>p_revision then raise exception 'Plan başka biri tarafından değiştirildi. Yenileyip tekrar dene.';end if;
 update public.study_team_slots set title=trim(p_title),topic=trim(coalesce(p_topic,'')),starts_at=p_starts_at,duration_minutes=p_duration,revision=revision+1 where id=p_id;return p_id;
end $$;
create or replace function public.study_team_delete_slot(p_id uuid,p_revision integer) returns void language plpgsql security definer set search_path='' as $$
declare current public.study_team_slots%rowtype;begin
 select * into current from public.study_team_slots where id=p_id for update;
 if not found or not study_private.member(current.team_id) or (current.created_by<>auth.uid() and not study_private.owner(current.team_id)) then raise exception 'Bu planı silme yetkin yok.';end if;
 if p_revision is null or current.revision<>p_revision then raise exception 'Plan değişti. Yenileyip tekrar dene.';end if;
 delete from public.study_team_slots where id=p_id;
end $$;
create or replace function public.study_team_attend(p_id uuid,p_going boolean) returns void language plpgsql security definer set search_path='' as $$
declare team uuid;begin
 select team_id into team from public.study_team_slots where id=p_id;
 if team is null or not study_private.member(team) then raise exception 'Takım üyeliği gerekiyor.';end if;
 if p_going then insert into public.study_team_attendance values(p_id,auth.uid()) on conflict do nothing;
 else delete from public.study_team_attendance where slot_id=p_id and user_id=auth.uid();end if;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('study-team-files','study-team-files',false,26214400,array['application/pdf']) on conflict(id) do nothing;
-- Private bucket only. Reapplying the migration must not silently keep an accidentally public bucket.
update storage.buckets set public=false,file_size_limit=26214400,allowed_mime_types=array['application/pdf'] where id='study-team-files';
create or replace function study_private.object_member(p_name text,p_write boolean default false) returns boolean language plpgsql stable security definer set search_path='' as $$
declare parts text[];begin
 parts:=string_to_array(p_name,'/');
 if array_length(parts,1)<>3 or parts[1] !~ '^[0-9a-f-]{36}$' or parts[2] !~ '^[0-9a-f-]{36}$' then return false;end if;
 return study_private.member(parts[1]::uuid) and (not p_write or parts[2]=auth.uid()::text or study_private.owner(parts[1]::uuid));
exception when invalid_text_representation then return false;end $$;
revoke all on function study_private.object_member(text,boolean) from public;
grant execute on function study_private.object_member(text,boolean) to authenticated;
drop policy if exists study_object_read on storage.objects;
create policy study_object_read on storage.objects for select to authenticated using(bucket_id='study-team-files' and study_private.object_member(name));
drop policy if exists study_object_upload on storage.objects;
create policy study_object_upload on storage.objects for insert to authenticated with check(bucket_id='study-team-files' and study_private.object_member(name,true) and split_part(name,'/',2)=auth.uid()::text);
drop policy if exists study_object_delete on storage.objects;
create policy study_object_delete on storage.objects for delete to authenticated using(bucket_id='study-team-files' and study_private.object_member(name,true));

create or replace function public.study_team_add_file(p_team_id uuid,p_id uuid,p_name text,p_size bigint) returns uuid language plpgsql security definer set search_path='' as $$
declare object_path text;begin
 if not study_private.member(p_team_id) then raise exception 'Takım üyeliği gerekiyor.';end if;
 object_path:=p_team_id::text||'/'||auth.uid()::text||'/'||p_id::text||'.pdf';
 if not exists(select 1 from storage.objects where bucket_id='study-team-files' and name=object_path and (metadata->>'size')::bigint=p_size) then raise exception 'Dosya yüklemesi doğrulanamadı.';end if;
 insert into public.study_team_files(id,team_id,name,size,storage_path,uploaded_by) values(p_id,p_team_id,trim(p_name),p_size,object_path,auth.uid());return p_id;
end $$;
create or replace function public.study_team_delete_file(p_id uuid,p_finish boolean default false) returns text language plpgsql security definer set search_path='' as $$
declare current public.study_team_files%rowtype;begin
 select * into current from public.study_team_files where id=p_id for update;
 if not found or not study_private.member(current.team_id) or (current.uploaded_by<>auth.uid() and not study_private.owner(current.team_id)) then raise exception 'Bu dosyayı silme yetkin yok.';end if;
 if p_finish then delete from public.study_team_files where id=p_id;
 else update public.study_team_files set deleting=true where id=p_id;end if;
 return current.storage_path;
end $$;
create or replace function public.study_team_snapshot(p_team_id uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare selected uuid;begin
 if auth.uid() is null then raise exception 'Önce giriş yap.';end if;
 selected:=p_team_id;
 if selected is null then select team_id into selected from public.study_team_members where user_id=auth.uid() order by joined_at desc limit 1;end if;
 if selected is not null and not study_private.member(selected) then raise exception 'Bu takıma erişimin yok.';end if;
 return jsonb_build_object('schema_version',1,'selected_id',selected,
 'teams',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from public.study_teams t where study_private.member(t.id)),'[]'::jsonb),
 'members',coalesce((select jsonb_agg(to_jsonb(m) order by m.joined_at) from public.study_team_members m where team_id=selected),'[]'::jsonb),
 'slots',coalesce((select jsonb_agg(to_jsonb(s)||jsonb_build_object('attendees',(select coalesce(jsonb_agg(a.user_id),'[]'::jsonb) from public.study_team_attendance a where a.slot_id=s.id)) order by s.starts_at) from (select * from public.study_team_slots where team_id=selected order by starts_at desc limit 200) s),'[]'::jsonb),
 'files',coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at desc) from (select * from public.study_team_files where team_id=selected order by created_at desc limit 200) f),'[]'::jsonb));
end $$;
-- Functions are not executable by anonymous visitors. Tables have no client write grant.
do $$declare f record;begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'study_team_%' loop
  execute format('revoke all on function %s from public, anon',f.signature);
  execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
commit;
