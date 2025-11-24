create table public.users (
  id uuid not null primary key references auth.users on delete cascade,
  created_at timestamp with time zone not null default now(),
  elevenlabs_voice_id character varying null default ''::character varying UNIQUE
);

alter table public.users enable row level security;
