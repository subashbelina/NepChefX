-- NepChefX Supabase schema (recipes)
-- Apply in Supabase SQL editor.

create table if not exists public.recipes (
  id text primary key,
  title text not null,
  description text not null,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  -- image_uri can store a public URL (optional)
  image_uri text,
  -- image_bucket + image_path store the Supabase Storage object location (recommended)
  image_bucket text not null default 'recipe-images',
  image_path text,
  is_favorite boolean not null default false,
  created_at bigint not null
);

create index if not exists idx_recipes_created_at on public.recipes (created_at desc);

-- Recommended: enable RLS and write proper per-user policies once you add Supabase Auth.
alter table public.recipes enable row level security;

-- Temporary/dev-only policy: allow anonymous full access (DO NOT use for production).
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recipes'
      and policyname = 'anon_all_recipes'
  ) then
    create policy anon_all_recipes
    on public.recipes
    for all
    to anon
    using (true)
    with check (true);
  end if;
end $$;

