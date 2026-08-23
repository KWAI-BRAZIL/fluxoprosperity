-- Diário do ritual + sínteses. Escrita via RPC (security definer).

create table if not exists public.ritual_entradas (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  dia date not null,
  carta_id int not null,
  carta_nome text not null,
  perguntas text[] not null default '{}',
  respostas text[] not null default '{}',
  conselho text not null default '',
  criado_em timestamptz not null default now(),
  unique (email, dia)
);

create index if not exists ritual_entradas_email_dia_idx
  on public.ritual_entradas (email, dia desc);

create table if not exists public.sinteses (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tipo text not null check (tipo in ('semana', 'mes')),
  periodo text not null,
  texto text not null,
  criado_em timestamptz not null default now(),
  unique (email, tipo, periodo)
);

alter table public.ritual_entradas enable row level security;
alter table public.sinteses enable row level security;
revoke all on table public.ritual_entradas from public, anon, authenticated;
revoke all on table public.sinteses from public, anon, authenticated;
grant all on table public.ritual_entradas to service_role;
grant all on table public.sinteses to service_role;

create or replace function public.salvar_entrada_ritual(
  p_email text,
  p_carta_id int,
  p_carta_nome text,
  p_perguntas text[],
  p_respostas text[],
  p_conselho text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
begin
  if not public.verificar_acesso(v_email) then
    raise exception 'acesso não liberado';
  end if;
  insert into public.ritual_entradas (
    email, dia, carta_id, carta_nome, perguntas, respostas, conselho
  ) values (
    v_email,
    v_hoje,
    p_carta_id,
    coalesce(p_carta_nome, ''),
    coalesce(p_perguntas, '{}'),
    coalesce(p_respostas, '{}'),
    left(coalesce(p_conselho, ''), 2000)
  )
  on conflict (email, dia) do update set
    carta_id = excluded.carta_id,
    carta_nome = excluded.carta_nome,
    perguntas = excluded.perguntas,
    respostas = excluded.respostas,
    conselho = excluded.conselho;
end;
$$;

create or replace function public.listar_entradas_ritual(p_email text)
returns table (
  dia date,
  carta_id int,
  carta_nome text,
  perguntas text[],
  respostas text[],
  conselho text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if not public.verificar_acesso(v_email) then
    raise exception 'acesso não liberado';
  end if;
  return query
    select e.dia, e.carta_id, e.carta_nome, e.perguntas, e.respostas, e.conselho
    from public.ritual_entradas e
    where e.email = v_email
    order by e.dia desc
    limit 120;
end;
$$;

create or replace function public.obter_sintese(p_email text, p_tipo text, p_periodo text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_txt text;
begin
  if not public.verificar_acesso(v_email) then
    return null;
  end if;
  select s.texto into v_txt
  from public.sinteses s
  where s.email = v_email and s.tipo = p_tipo and s.periodo = p_periodo;
  return v_txt;
end;
$$;

grant execute on function public.salvar_entrada_ritual(text, int, text, text[], text[], text) to anon, authenticated;
grant execute on function public.listar_entradas_ritual(text) to anon, authenticated;
grant execute on function public.obter_sintese(text, text, text) to anon, authenticated;
