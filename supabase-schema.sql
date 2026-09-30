-- Already created in your Supabase project, but kept here for reference.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  gym text,
  goal text,
  starting_weight_kg numeric,
  target_weight_kg text,
  created_at timestamptz default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  workout_date date not null,
  workout_name text not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts(id) on delete cascade,
  exercise_name text not null,
  exercise_type text,
  equipment text,
  weight text,
  weight_1 text,
  weight_2 text,
  weight_3 text,
  weight_4 text,
  weight_5 text,
  weight_6 text,
  set_1 text,
  set_2 text,
  set_3 text,
  set_4 text,
  set_5 text,
  set_6 text,
  target_total integer,
  is_extra boolean default false,
  difficulty text,
  notes text
);

create table if not exists body_updates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  update_date date not null,
  weight_kg numeric,
  waist_cm numeric,
  created_at timestamptz default now()
);

-- Transactional write functions are versioned separately in:
-- supabase/migrations/20260930_atomic_workout_writes.sql
