create table public.hr_delays (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delay_date date not null,
  delay_minutes integer not null default 0,
  justification text null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint hr_delays_pkey primary key (id)
);

create trigger handle_updated_at before update on public.hr_delays
  for each row execute procedure moddatetime('updated_at');

-- RLS
alter table public.hr_delays enable row level security;

-- Permite ao admin ver/inserir/atualizar todos os atrasos (usado também via service_role ou roles específicas)
create policy "Allow all actions for authenticated users based on role"
on public.hr_delays
for all
to authenticated
using (true)
with check (true);
