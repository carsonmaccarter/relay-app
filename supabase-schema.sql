-- Relay CRM schema for Supabase
-- Run this entire file once in Supabase → SQL Editor.

create table if not exists public.companies (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  company_name text not null,
  company_type text not null check (company_type in ('Photography', 'Airbnb Management')),
  location text not null default '',
  website text not null default '',
  website_domain text not null default '',
  contact_form text not null default '',
  primary_email text not null default '',
  primary_phone text not null default '',
  contact_name text not null default '',
  contact_title text not null default '',
  stage text not null default 'New',
  fit_notes text not null default '',
  source_url text not null default '',
  snoozed_until date,
  contact_method_order text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table if not exists public.contact_methods (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  company_id text not null,
  method_type text not null check (method_type in ('form', 'email', 'phone', 'linkedin', 'other')),
  label text not null default '',
  value text not null,
  rank integer not null default 0 check (rank >= 0),
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, company_id) references public.companies(owner_id, id) on delete cascade
);

create table if not exists public.activities (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  company_id text not null,
  direction text not null default 'note' check (direction in ('outbound', 'inbound', 'note')),
  method_id text,
  method_value text not null default '',
  method_label text not null default '',
  channel text not null default 'other',
  kind text not null,
  activity_date date not null,
  subject text not null default '',
  message text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, company_id) references public.companies(owner_id, id) on delete cascade
);

create table if not exists public.message_drafts (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  draft_key text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (owner_id, draft_key)
);

create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  attempt_threshold integer not null default 4 check (attempt_threshold between 1 and 20),
  stale_days integer not null default 5 check (stale_days between 1 and 365),
  updated_at timestamptz not null default now()
);

create index if not exists companies_owner_domain_idx on public.companies(owner_id, website_domain);
create index if not exists contact_methods_company_idx on public.contact_methods(owner_id, company_id, rank);
create index if not exists activities_company_date_idx on public.activities(owner_id, company_id, activity_date desc);

create or replace function public.relay_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.relay_set_updated_at();
drop trigger if exists message_drafts_set_updated_at on public.message_drafts;
create trigger message_drafts_set_updated_at before update on public.message_drafts
for each row execute function public.relay_set_updated_at();
drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at before update on public.user_settings
for each row execute function public.relay_set_updated_at();

alter table public.companies enable row level security;
alter table public.contact_methods enable row level security;
alter table public.activities enable row level security;
alter table public.message_drafts enable row level security;
alter table public.user_settings enable row level security;

revoke all on public.companies, public.contact_methods, public.activities, public.message_drafts, public.user_settings from anon;
revoke all on public.companies, public.contact_methods, public.activities, public.message_drafts, public.user_settings from authenticated;
grant select, insert, update, delete on public.companies, public.contact_methods, public.activities, public.message_drafts, public.user_settings to authenticated;

drop policy if exists "Owner manages companies" on public.companies;
create policy "Owner manages companies" on public.companies for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner manages contact methods" on public.contact_methods;
create policy "Owner manages contact methods" on public.contact_methods for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner manages activities" on public.activities;
create policy "Owner manages activities" on public.activities for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner manages drafts" on public.message_drafts;
create policy "Owner manages drafts" on public.message_drafts for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

drop policy if exists "User manages settings" on public.user_settings;
create policy "User manages settings" on public.user_settings for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
