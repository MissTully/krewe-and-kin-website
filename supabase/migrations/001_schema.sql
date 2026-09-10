-- Krewe & Kin Billing Portal — schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(email);

-- Clients (business accounts billed by the studio)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx on public.clients(email);
create index if not exists clients_profile_id_idx on public.clients(profile_id);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number text not null unique,
  title text not null,
  description text,
  invoice_type text not null check (invoice_type in ('one_time', 'deposit', 'balance', 'retainer')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  currency text not null default 'USD',
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  due_date date,
  issued_at timestamptz,
  paid_at timestamptz,
  parent_invoice_id uuid references public.invoices(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists invoices_type_idx on public.invoices(invoice_type);

-- Line items
create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_amount_cents integer not null,
  amount_cents integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invoice_line_items_invoice_id_idx on public.invoice_line_items(invoice_id);

-- Payment schedules (deposit+balance or monthly retainer)
create table if not exists public.payment_schedules (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  schedule_type text not null check (schedule_type in ('deposit_balance', 'retainer_monthly')),
  label text not null,
  amount_cents integer not null,
  cadence text, -- e.g. monthly
  next_due_date date,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_schedules_client_id_idx on public.payment_schedules(client_id);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text not null default 'paypal',
  provider_order_id text,
  provider_capture_id text,
  provider_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_provider_order_id_idx on public.payments(provider_order_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists invoices_updated_at on public.invoices;
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

drop trigger if exists payment_schedules_updated_at on public.payment_schedules;
create trigger payment_schedules_updated_at before update on public.payment_schedules
  for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payment_schedules enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
  for all using (public.is_admin());

-- Clients policies
drop policy if exists "Clients read own row" on public.clients;
create policy "Clients read own row" on public.clients
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage clients" on public.clients;
create policy "Admins manage clients" on public.clients
  for all using (public.is_admin());

-- Invoices policies
drop policy if exists "Clients read own invoices" on public.invoices;
create policy "Clients read own invoices" on public.invoices
  for select using (
    public.is_admin()
    or client_id in (select id from public.clients where profile_id = auth.uid())
  );

drop policy if exists "Admins manage invoices" on public.invoices;
create policy "Admins manage invoices" on public.invoices
  for all using (public.is_admin());

-- Line items
drop policy if exists "Clients read own line items" on public.invoice_line_items;
create policy "Clients read own line items" on public.invoice_line_items
  for select using (
    public.is_admin()
    or invoice_id in (
      select i.id from public.invoices i
      join public.clients c on c.id = i.client_id
      where c.profile_id = auth.uid()
    )
  );

drop policy if exists "Admins manage line items" on public.invoice_line_items;
create policy "Admins manage line items" on public.invoice_line_items
  for all using (public.is_admin());

-- Schedules
drop policy if exists "Clients read own schedules" on public.payment_schedules;
create policy "Clients read own schedules" on public.payment_schedules
  for select using (
    public.is_admin()
    or client_id in (select id from public.clients where profile_id = auth.uid())
  );

drop policy if exists "Admins manage schedules" on public.payment_schedules;
create policy "Admins manage schedules" on public.payment_schedules
  for all using (public.is_admin());

-- Payments
drop policy if exists "Clients read own payments" on public.payments;
create policy "Clients read own payments" on public.payments
  for select using (
    public.is_admin()
    or client_id in (select id from public.clients where profile_id = auth.uid())
  );

drop policy if exists "Admins manage payments" on public.payments;
create policy "Admins manage payments" on public.payments
  for all using (public.is_admin());
