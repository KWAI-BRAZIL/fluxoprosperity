-- Desbloqueio de Abundância — schema de acessos
-- Escrita direta na tabela: somente service role (Edge Function).
-- O front usa RPCs SECURITY DEFINER que nunca devolvem a linha inteira a quem não pagou.

create extension if not exists pgcrypto;

create table if not exists public.acessos (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nome text,
  pago boolean not null default false,
  produto text, -- 'acesso_base' | 'leitura_completa' | 'assinatura'
  data_nascimento date,
  numero_destino int,
  streak_dias int not null default 0,
  ultimo_ritual_em date,
  rituais_em date[] not null default '{}',
  criado_em timestamptz not null default now()
);

comment on table public.acessos is 'Liberação de acesso pós-pagamento Cakto. Não expor via SELECT direto.';
comment on column public.acessos.ultimo_ritual_em is 'Data (America/Sao_Paulo) do último ritual concluído — usada no streak.';
comment on column public.acessos.rituais_em is 'Datas de rituais concluídos — progresso da semana na home.';

create index if not exists acessos_pago_idx on public.acessos (pago);

create or replace function public.acessos_normaliza_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists acessos_email_biu on public.acessos;
create trigger acessos_email_biu
before insert or update on public.acessos
for each row execute procedure public.acessos_normaliza_email();

alter table public.acessos enable row level security;

revoke all on table public.acessos from public, anon, authenticated;
grant all on table public.acessos to service_role;

-- Sem políticas para anon/authenticated: SELECT/INSERT/UPDATE/DELETE direto ficam bloqueados.

create or replace function public.reduzir_pitagorico(n integer)
returns integer
language plpgsql
immutable
as $$
declare
  atual integer := n;
  soma integer;
  t text;
  i integer;
begin
  if atual is null or atual < 0 then
    raise exception 'número inválido para redução pitagórica';
  end if;
  while atual > 9 and atual <> 11 and atual <> 22 loop
    t := atual::text;
    soma := 0;
    for i in 1..char_length(t) loop
      soma := soma + substr(t, i, 1)::integer;
    end loop;
    atual := soma;
  end loop;
  return atual;
end;
$$;

create or replace function public.numero_destino_data(d date)
returns integer
language plpgsql
immutable
as $$
declare
  t text := to_char(d, 'DDMMYYYY');
  soma integer := 0;
  i integer;
begin
  if d is null then
    raise exception 'data de nascimento obrigatória';
  end if;
  for i in 1..char_length(t) loop
    soma := soma + substr(t, i, 1)::integer;
  end loop;
  return public.reduzir_pitagorico(soma);
end;
$$;

create or replace function public.verificar_acesso(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_pago boolean;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return false;
  end if;
  select a.pago into v_pago
  from public.acessos a
  where lower(a.email) = v_email;
  return coalesce(v_pago, false);
end;
$$;

create or replace function public.obter_perfil(p_email text)
returns table (
  nome text,
  data_nascimento date,
  numero_destino int,
  streak_dias int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
begin
  if v_email = '' then
    return;
  end if;
  return query
  select
    a.nome,
    a.data_nascimento,
    a.numero_destino,
    a.streak_dias,
    a.produto,
    (a.ultimo_ritual_em is not null and a.ultimo_ritual_em = v_hoje),
    a.rituais_em
  from public.acessos a
  where lower(a.email) = v_email
    and a.pago = true;
end;
$$;

create or replace function public.salvar_onboarding(
  p_email text,
  p_nome text,
  p_data_nascimento date
)
returns table (
  nome text,
  data_nascimento date,
  numero_destino int,
  streak_dias int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_nome text := trim(coalesce(p_nome, ''));
  v_numero int;
  v_pago boolean;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'e-mail inválido';
  end if;
  if char_length(v_nome) < 2 then
    raise exception 'nome obrigatório';
  end if;
  if p_data_nascimento is null then
    raise exception 'data de nascimento obrigatória';
  end if;

  select a.pago into v_pago
  from public.acessos a
  where lower(a.email) = v_email;

  if coalesce(v_pago, false) is not true then
    raise exception 'acesso não liberado';
  end if;

  v_numero := public.numero_destino_data(p_data_nascimento);

  update public.acessos a
  set
    nome = v_nome,
    data_nascimento = p_data_nascimento,
    numero_destino = v_numero
  where lower(a.email) = v_email
    and a.pago = true;

  return query select * from public.obter_perfil(v_email);
end;
$$;

create or replace function public.registrar_ritual(p_email text)
returns table (
  nome text,
  data_nascimento date,
  numero_destino int,
  streak_dias int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
  v_ontem date := v_hoje - 1;
  rec public.acessos%rowtype;
begin
  select * into rec
  from public.acessos a
  where lower(a.email) = v_email
    and a.pago = true;

  if not found then
    raise exception 'acesso não liberado';
  end if;

  if rec.ultimo_ritual_em = v_hoje then
    return query select * from public.obter_perfil(v_email);
    return;
  elsif rec.ultimo_ritual_em = v_ontem then
    update public.acessos
    set streak_dias = coalesce(streak_dias, 0) + 1,
        ultimo_ritual_em = v_hoje,
        rituais_em = case
          when v_hoje = any(coalesce(rituais_em, '{}')) then rituais_em
          else array_append(coalesce(rituais_em, '{}'), v_hoje)
        end
    where id = rec.id;
  else
    update public.acessos
    set streak_dias = 1,
        ultimo_ritual_em = v_hoje,
        rituais_em = case
          when v_hoje = any(coalesce(rituais_em, '{}')) then rituais_em
          else array_append(coalesce(rituais_em, '{}'), v_hoje)
        end
    where id = rec.id;
  end if;

  return query select * from public.obter_perfil(v_email);
end;
$$;

revoke all on function public.reduzir_pitagorico(integer) from public, anon, authenticated;
revoke all on function public.numero_destino_data(date) from public, anon, authenticated;

grant execute on function public.verificar_acesso(text) to anon, authenticated;
grant execute on function public.obter_perfil(text) to anon, authenticated;
grant execute on function public.salvar_onboarding(text, text, date) to anon, authenticated;
grant execute on function public.registrar_ritual(text) to anon, authenticated;
