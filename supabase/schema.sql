-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('student','lecturer','admin')),
  department text,
  level text,
  courses text[],
  photo_url text,
  email_verified boolean default false,
  created_at timestamptz default now()
);

-- ============ PAST QUESTIONS ============
create table public.past_questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  level text not null,
  course_code text not null,
  year int not null,
  file_path text not null,
  uploaded_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);
create index pq_index on public.past_questions (department, level, course_code, year);

-- ============ OTPs ============
create table public.otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  purpose text not null, -- 'verify' | '2fa' | 'reset'
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.past_questions enable row level security;
alter table public.otps enable row level security;

-- helper: get current user's role
create or replace function public.current_role()
returns text language sql stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- PROFILES policies
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or public.current_role() = 'admin');

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "admin reads all" on public.profiles
  for select using (public.current_role() = 'admin');

-- PAST QUESTIONS policies
create policy "students read matching" on public.past_questions
  for select using (
    public.current_role() in ('student','lecturer','admin')
  );

create policy "lecturers insert own" on public.past_questions
  for insert with check (
    public.current_role() = 'lecturer' and uploaded_by = auth.uid()
  );

create policy "lecturers manage own" on public.past_questions
  for update using (uploaded_by = auth.uid());

create policy "lecturers delete own" on public.past_questions
  for delete using (uploaded_by = auth.uid());

-- OTP policies (service role only; no client access)
-- (no policies → all client access blocked, service role bypasses RLS)