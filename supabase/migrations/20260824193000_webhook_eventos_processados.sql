-- Idempotência do webhook Cakto: um evento só entra uma vez.

create table if not exists public.webhook_eventos_processados (
  id text primary key,
  processado_em timestamptz not null default now()
);

comment on table public.webhook_eventos_processados is
  'IDs de eventos de webhook já aplicados. Duplicata → 200 sem reprocessar.';

alter table public.webhook_eventos_processados enable row level security;
