-- 在 Supabase → SQL Editor 整段运行。可重复运行（已建过表也没问题）。

-- 1) 训练记录表
create table if not exists public.logs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  module text not null,          -- nutrition / prep / skills / mind / summary
  item text not null,            -- 对应 frontend/lib/modules.ts 里的 key
  value numeric,                 -- 数值：升、公斤、分钟、次数、元、1-10 评分……
  count numeric,                 -- 网球技能的次数（和 value=分钟 配合）
  note text,                     -- 文字备注
  created_at timestamptz not null default now()
);
alter table public.logs add column if not exists count numeric;
create index if not exists logs_user_module_idx on public.logs (user_id, module, created_at desc);

-- 2) 用户资料表（管理员页面显示邮箱用），新用户注册时自动写入
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text
);
alter table public.profiles add column if not exists phone text;
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, phone) values (new.id, new.email, new.phone)
  on conflict (id) do update set email = excluded.email, phone = excluded.phone;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
insert into public.profiles (id, email, phone) select id, email, phone from auth.users
  on conflict (id) do update set email = excluded.email, phone = excluded.phone;

-- 3) 管理员判断：读取登录令牌里的 app_metadata.role（用户自己无法修改这个字段）
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- 4) 行级安全：普通用户只能读写自己的；管理员可以"读"所有人的，但不能改别人的
alter table public.logs enable row level security;
drop policy if exists "own logs" on public.logs;
drop policy if exists "read own or admin" on public.logs;
drop policy if exists "insert own" on public.logs;
drop policy if exists "update own" on public.logs;
drop policy if exists "delete own" on public.logs;
create policy "read own or admin" on public.logs for select using (user_id = auth.uid() or public.is_admin());
create policy "insert own" on public.logs for insert with check (user_id = auth.uid());
create policy "update own" on public.logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own" on public.logs for delete using (user_id = auth.uid());

alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
drop policy if exists "admin read profiles" on public.profiles;
create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "admin read profiles" on public.profiles for select using (public.is_admin());

-- 5) 指定管理员（把邮箱换成你的，单独运行；之后该账号需要退出再重新登录才生效。
--    用手机号登录的话，把 where 改成 phone = '8613800000000'，注意手机号这里不带 +）
-- update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   where email = 'you@example.com';
