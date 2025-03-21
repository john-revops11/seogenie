
-- Create table for analysis sessions
create table if not exists public.analysis_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  main_domain text not null,
  competitor_domains text[] not null,
  session_name text not null,
  created_at timestamptz not null default now(),
  keywords_count integer not null default 0
);

-- Create RLS policies for analysis_sessions
alter table public.analysis_sessions enable row level security;

create policy "Users can view their own analysis sessions"
  on public.analysis_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analysis sessions"
  on public.analysis_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analysis sessions"
  on public.analysis_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analysis sessions"
  on public.analysis_sessions for delete
  using (auth.uid() = user_id);

-- Create table for analysis keywords
create table if not exists public.analysis_keywords (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.analysis_sessions not null,
  keywords_data jsonb not null,
  created_at timestamptz not null default now()
);

-- Create RLS policies for analysis_keywords
alter table public.analysis_keywords enable row level security;

create policy "Users can view their own analysis keywords"
  on public.analysis_keywords for select
  using (
    session_id in (
      select id from public.analysis_sessions
      where user_id = auth.uid()
    )
  );

create policy "Users can insert their own analysis keywords"
  on public.analysis_keywords for insert
  with check (
    session_id in (
      select id from public.analysis_sessions
      where user_id = auth.uid()
    )
  );

-- Create table for keyword gaps
create table if not exists public.keyword_gaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  main_domain text not null,
  competitor_domains text[] not null,
  keyword_gaps jsonb not null,
  created_at timestamptz not null default now(),
  gaps_count integer not null default 0
);

-- Create RLS policies for keyword_gaps
alter table public.keyword_gaps enable row level security;

create policy "Users can view their own keyword gaps"
  on public.keyword_gaps for select
  using (auth.uid() = user_id);

create policy "Users can insert their own keyword gaps"
  on public.keyword_gaps for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own keyword gaps"
  on public.keyword_gaps for update
  using (auth.uid() = user_id);

create policy "Users can delete their own keyword gaps"
  on public.keyword_gaps for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists analysis_sessions_user_id_idx on public.analysis_sessions(user_id);
create index if not exists analysis_keywords_session_id_idx on public.analysis_keywords(session_id);
create index if not exists keyword_gaps_user_id_idx on public.keyword_gaps(user_id);
