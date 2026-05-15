-- Phase 7: RBAC roles, payments on event applications, portal access
-- Run in Supabase SQL editor after schema.sql

alter type user_role add value if not exists 'content_manager';
alter type user_role add value if not exists 'workshop_coordinator';

alter table public.event_applications
  add column if not exists payment_reference text,
  add column if not exists payment_status donation_status not null default 'initiated';

create index if not exists event_applications_payment_ref_idx
  on public.event_applications(payment_reference)
  where payment_reference is not null;

alter table public.applications
  add column if not exists portal_enabled boolean not null default false;

-- Role helpers (security definer)
create or replace function public.user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.user_role() to authenticated;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super_admin', 'admin')
  );
$$;

grant execute on function public.is_super_admin() to authenticated;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'editor', 'content_manager')
  );
$$;

grant execute on function public.can_manage_content() to authenticated;

create or replace function public.can_manage_workshops()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'workshop_coordinator')
  );
$$;

grant execute on function public.can_manage_workshops() to authenticated;

-- Portal: admitted applicants read own row
create policy "applications_portal_self_read"
  on public.applications for select
  using (
    portal_enabled = true
    and email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Event applications: applicant reads own confirmed row by email
create policy "event_applications_self_read"
  on public.event_applications for select
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and status in ('confirmed', 'attended')
  );
