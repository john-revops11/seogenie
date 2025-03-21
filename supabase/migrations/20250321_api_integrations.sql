
-- Create table for API integrations
create table if not exists public.api_integrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  api_type text not null,
  api_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add constraints
alter table public.api_integrations add constraint api_integrations_user_id_api_type_key unique (user_id, api_type);

-- Create RLS policies for api_integrations
alter table public.api_integrations enable row level security;

create policy "Users can view their own API integrations"
  on public.api_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own API integrations"
  on public.api_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own API integrations"
  on public.api_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own API integrations"
  on public.api_integrations for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists api_integrations_user_id_api_type_idx on public.api_integrations(user_id, api_type);
