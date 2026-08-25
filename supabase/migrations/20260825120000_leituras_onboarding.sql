-- Leitura de onboarding: uma vez por e-mail, nunca regenerar.

create table if not exists public.leituras_onboarding (
  email text primary key,
  texto text not null,
  criado_em timestamptz not null default now()
);

comment on table public.leituras_onboarding is
  'Primeira leitura do mapa. Cache permanente por e-mail — Gemini só na primeira vez.';

alter table public.leituras_onboarding enable row level security;
revoke all on table public.leituras_onboarding from public, anon, authenticated;
grant all on table public.leituras_onboarding to service_role;
