-- ============================================================================
-- Adullam Cave Choir — Supabase Schema
-- Idempotent: safe to run multiple times against an empty or existing DB.
-- Run inside Supabase SQL editor (or `supabase db push`).
-- ============================================================================

set check_function_bodies = off;

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enum types
-- ----------------------------------------------------------------------------
do $$ begin create type user_role as enum ('super_admin', 'admin', 'editor'); exception when duplicate_object then null; end $$;
do $$ begin create type interest_level as enum ('beginner', 'intermediate', 'advanced'); exception when duplicate_object then null; end $$;
do $$ begin create type application_status as enum ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'waitlisted'); exception when duplicate_object then null; end $$;
do $$ begin create type program_audience as enum ('youth', 'adult', 'all'); exception when duplicate_object then null; end $$;
do $$ begin create type program_format as enum ('in_person', 'online', 'hybrid'); exception when duplicate_object then null; end $$;
do $$ begin create type event_status as enum ('draft', 'scheduled', 'live', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type event_application_status as enum ('pending', 'confirmed', 'attended', 'cancelled', 'declined'); exception when duplicate_object then null; end $$;
do $$ begin create type media_type as enum ('image', 'video', 'youtube', 'vimeo'); exception when duplicate_object then null; end $$;
do $$ begin create type gallery_category as enum ('performances', 'rehearsals', 'workshops', 'equipment', 'events', 'community'); exception when duplicate_object then null; end $$;
do $$ begin create type equipment_status as enum ('planned', 'in_progress', 'completed', 'maintenance'); exception when duplicate_object then null; end $$;
do $$ begin create type donation_status as enum ('initiated', 'success', 'failed', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type notification_type as enum ('application', 'event_application', 'donation', 'contact', 'system'); exception when duplicate_object then null; end $$;
do $$ begin create type related_entity as enum ('application', 'event_application', 'donation', 'equipment_record', 'blog_post'); exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- updated_at trigger function
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Helper: is the current user an admin? Used by RLS policies.
-- security definer so it can read profiles without recursing into RLS.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'editor')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================================
-- profiles — mirrors auth.users; populated via on_auth_user_created trigger
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        user_role not null default 'admin',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- New auth user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- applications — public submission, admin review
-- ============================================================================
create table if not exists public.applications (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null,
  age                  integer not null check (age between 5 and 120),
  phone                text not null,
  email                text,
  interest_level       interest_level not null default 'beginner',
  experience           text,
  preferred_program    text not null,
  guardian_consent     boolean not null default false,
  notes                text,
  passport_photo_url   text,
  status               application_status not null default 'pending',
  internal_notes       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_created_at_idx on public.applications(created_at desc);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- programs
-- ============================================================================
create table if not exists public.programs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null,
  target_audience program_audience not null default 'all',
  duration        text not null,
  format          program_format not null default 'in_person',
  prerequisites   text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists programs_is_active_idx on public.programs(is_active);

-- ============================================================================
-- events
-- ============================================================================
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null,
  audience     text not null,
  date         date not null,
  time         time not null,
  venue        text not null,
  capacity     integer check (capacity is null or capacity > 0),
  fee          numeric(12,2) not null default 0,
  currency     text not null default 'GHS',
  is_online    boolean not null default false,
  status       event_status not null default 'draft',
  created_at   timestamptz not null default now()
);

create index if not exists events_date_idx on public.events(date);
create index if not exists events_status_idx on public.events(status);

-- ============================================================================
-- event_applications — public sign-up, admin confirm
-- ============================================================================
create table if not exists public.event_applications (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  full_name    text not null,
  organization text,
  email        text not null,
  phone        text not null,
  message      text,
  status       event_application_status not null default 'pending',
  created_at   timestamptz not null default now()
);

create index if not exists event_applications_event_id_idx on public.event_applications(event_id);
create index if not exists event_applications_status_idx on public.event_applications(status);

-- ============================================================================
-- gallery_items
-- ============================================================================
create table if not exists public.gallery_items (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  category       gallery_category not null default 'performances',
  media_type     media_type not null default 'image',
  file_url       text,
  thumbnail_url  text,
  youtube_url    text,
  is_featured    boolean not null default false,
  is_published   boolean not null default false,
  date_taken     date,
  created_at     timestamptz not null default now(),
  constraint gallery_items_has_media check (
    file_url is not null or youtube_url is not null
  )
);

create index if not exists gallery_items_category_idx on public.gallery_items(category);
create index if not exists gallery_items_is_published_idx on public.gallery_items(is_published);
create index if not exists gallery_items_is_featured_idx on public.gallery_items(is_featured) where is_featured;

-- ============================================================================
-- equipment_records (+ link table)
-- ============================================================================
create table if not exists public.equipment_records (
  id              uuid primary key default gen_random_uuid(),
  church_name     text not null,
  location        text not null,
  service_date    date not null,
  equipment_types text[] not null default '{}',
  notes           text,
  status          equipment_status not null default 'planned',
  created_at      timestamptz not null default now()
);

create index if not exists equipment_records_service_date_idx on public.equipment_records(service_date desc);

create table if not exists public.equipment_gallery (
  id                   uuid primary key default gen_random_uuid(),
  equipment_record_id  uuid not null references public.equipment_records(id) on delete cascade,
  gallery_item_id      uuid not null references public.gallery_items(id) on delete cascade,
  unique (equipment_record_id, gallery_item_id)
);

create index if not exists equipment_gallery_record_idx on public.equipment_gallery(equipment_record_id);
create index if not exists equipment_gallery_item_idx on public.equipment_gallery(gallery_item_id);

-- ============================================================================
-- donations
-- ============================================================================
create table if not exists public.donations (
  id                uuid primary key default gen_random_uuid(),
  donor_name        text,
  email             text,
  phone             text,
  amount            numeric(12,2) not null check (amount > 0),
  currency          text not null default 'GHS',
  message           text,
  payment_reference text not null unique,
  status            donation_status not null default 'initiated',
  created_at        timestamptz not null default now()
);

create index if not exists donations_status_idx on public.donations(status);
create index if not exists donations_created_at_idx on public.donations(created_at desc);

-- ============================================================================
-- blog_posts
-- ============================================================================
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  content         text not null,
  excerpt         text,
  cover_image_url text,
  is_published    boolean not null default false,
  published_at    timestamptz,
  author_id       uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists blog_posts_is_published_idx on public.blog_posts(is_published);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc) where is_published;

-- ============================================================================
-- notifications (admin inbox)
-- ============================================================================
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  message      text not null,
  type         notification_type not null,
  is_read      boolean not null default false,
  related_id   uuid,
  related_type related_entity,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

-- Realtime (admin bell + notifications page)
alter table public.notifications replica identity full;

-- ============================================================================
-- site_settings (key/value)
-- ============================================================================
create table if not exists public.site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.applications        enable row level security;
alter table public.programs            enable row level security;
alter table public.events              enable row level security;
alter table public.event_applications  enable row level security;
alter table public.gallery_items       enable row level security;
alter table public.equipment_records   enable row level security;
alter table public.equipment_gallery   enable row level security;
alter table public.donations           enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.notifications       enable row level security;
alter table public.site_settings       enable row level security;

-- Drop-and-recreate policies so the file stays idempotent.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- profiles: users read own row; admins read/manage everything
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);
create policy "profiles_admin_read"
  on public.profiles for select
  using (public.is_admin());
create policy "profiles_admin_write"
  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- programs: public can read active rows; admins manage
create policy "programs_public_read_active"
  on public.programs for select
  using (is_active = true);
create policy "programs_admin_all"
  on public.programs for all
  using (public.is_admin()) with check (public.is_admin());

-- events: public reads non-draft/non-cancelled; admins manage
create policy "events_public_read_scheduled"
  on public.events for select
  using (status in ('scheduled', 'live', 'completed'));
create policy "events_admin_all"
  on public.events for all
  using (public.is_admin()) with check (public.is_admin());

-- applications: anonymous insert; only admins read/update
create policy "applications_anon_insert"
  on public.applications for insert
  to anon, authenticated
  with check (true);
create policy "applications_admin_read"
  on public.applications for select
  using (public.is_admin());
create policy "applications_admin_update"
  on public.applications for update
  using (public.is_admin()) with check (public.is_admin());
create policy "applications_admin_delete"
  on public.applications for delete
  using (public.is_admin());

-- event_applications: anonymous insert; admin manage
create policy "event_applications_anon_insert"
  on public.event_applications for insert
  to anon, authenticated
  with check (true);
create policy "event_applications_admin_read"
  on public.event_applications for select
  using (public.is_admin());
create policy "event_applications_admin_update"
  on public.event_applications for update
  using (public.is_admin()) with check (public.is_admin());
create policy "event_applications_admin_delete"
  on public.event_applications for delete
  using (public.is_admin());

-- gallery_items: public reads published; admin manage
create policy "gallery_items_public_read_published"
  on public.gallery_items for select
  using (is_published = true);
create policy "gallery_items_admin_all"
  on public.gallery_items for all
  using (public.is_admin()) with check (public.is_admin());

-- equipment_records: public reads completed; admin manage
create policy "equipment_records_public_read_completed"
  on public.equipment_records for select
  using (status = 'completed');
create policy "equipment_records_admin_all"
  on public.equipment_records for all
  using (public.is_admin()) with check (public.is_admin());

-- equipment_gallery: public reads (visibility filtered via FK selects); admin manage
create policy "equipment_gallery_public_read"
  on public.equipment_gallery for select
  using (true);
create policy "equipment_gallery_admin_all"
  on public.equipment_gallery for all
  using (public.is_admin()) with check (public.is_admin());

-- donations: anonymous insert; admin read/update; no public reads
create policy "donations_anon_insert"
  on public.donations for insert
  to anon, authenticated
  with check (true);
create policy "donations_admin_read"
  on public.donations for select
  using (public.is_admin());
create policy "donations_admin_update"
  on public.donations for update
  using (public.is_admin()) with check (public.is_admin());

-- blog_posts: public reads published; admin manage
create policy "blog_posts_public_read_published"
  on public.blog_posts for select
  using (is_published = true);
create policy "blog_posts_admin_all"
  on public.blog_posts for all
  using (public.is_admin()) with check (public.is_admin());

-- notifications: admin-only
create policy "notifications_admin_all"
  on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());

-- site_settings: public read; admin manage
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);
create policy "site_settings_admin_write"
  on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('gallery',      'gallery',      true),
  ('avatars',      'avatars',      true),
  ('applications', 'applications', false)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "gallery_public_read"           on storage.objects;
drop policy if exists "gallery_admin_write"           on storage.objects;
drop policy if exists "avatars_public_read"           on storage.objects;
drop policy if exists "avatars_user_write_own"        on storage.objects;
drop policy if exists "applications_admin_read"       on storage.objects;
drop policy if exists "applications_anon_insert"      on storage.objects;

create policy "gallery_public_read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery_admin_write"
  on storage.objects for all
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_user_write_own"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "applications_anon_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'applications');

create policy "applications_admin_read"
  on storage.objects for select
  using (bucket_id = 'applications' and public.is_admin());

-- ============================================================================
-- Done
-- ============================================================================
