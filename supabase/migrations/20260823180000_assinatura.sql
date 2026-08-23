-- Assinatura mensal + limite diário do eco com IA.

alter table public.acessos
  add column if not exists assinatura_status text not null default 'inativa',
  add column if not exists proxima_cobranca date,
  add column if not exists cancelada_em timestamptz;

alter table public.acessos
  drop constraint if exists acessos_assinatura_status_chk;

alter table public.acessos
  add constraint acessos_assinatura_status_chk
  check (assinatura_status in ('ativa', 'atrasada', 'cancelada', 'inativa'));

comment on column public.acessos.assinatura_status is 'ativa | atrasada | cancelada | inativa';
comment on column public.acessos.proxima_cobranca is 'Fim do período já pago / próxima tentativa de cobrança.';
comment on column public.acessos.cancelada_em is 'Quando a pessoa pediu o cancelamento. Acesso segue até proxima_cobranca.';

-- Quem já estava pago (compra única antiga) continua liberado via status inativa + pago.
update public.acessos
set assinatura_status = 'ativa'
where pago = true and assinatura_status = 'inativa';

create or replace function public.acesso_esta_liberado(
  p_pago boolean,
  p_status text,
  p_proxima date
) returns boolean
language plpgsql
stable
as $$
declare
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
  v_status text := coalesce(p_status, 'inativa');
begin
  if v_status = 'ativa' then
    return true;
  end if;
  if v_status = 'atrasada' and (p_proxima is null or v_hoje <= p_proxima + 3) then
    return true;
  end if;
  if v_status = 'cancelada' and p_proxima is not null and v_hoje < p_proxima then
    return true;
  end if;
  -- Compra única anterior à assinatura.
  if v_status = 'inativa' and coalesce(p_pago, false) then
    return true;
  end if;
  return false;
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
  rec record;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return false;
  end if;
  select a.pago, a.assinatura_status, a.proxima_cobranca
    into rec
  from public.acessos a
  where lower(a.email) = v_email;
  if not found then
    return false;
  end if;
  return public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca);
end;
$$;

create or replace function public.obter_perfil(p_email text)
returns table (
  nome text,
  data_nascimento date,
  numero_destino int,
  streak_dias int,
  recorde_streak int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[],
  cartas_vividas jsonb
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
    a.recorde_streak,
    a.produto,
    (a.ultimo_ritual_em is not null and a.ultimo_ritual_em = v_hoje),
    a.rituais_em,
    a.cartas_vividas
  from public.acessos a
  where lower(a.email) = v_email
    and public.acesso_esta_liberado(a.pago, a.assinatura_status, a.proxima_cobranca);
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
  recorde_streak int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[],
  cartas_vividas jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_nome text := trim(coalesce(p_nome, ''));
  v_numero int;
  rec record;
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

  select a.pago, a.assinatura_status, a.proxima_cobranca
    into rec
  from public.acessos a
  where lower(a.email) = v_email;

  if not found or not public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca) then
    raise exception 'acesso não liberado';
  end if;

  v_numero := public.numero_destino_data(p_data_nascimento);

  update public.acessos a
  set
    nome = v_nome,
    data_nascimento = p_data_nascimento,
    numero_destino = v_numero
  where lower(a.email) = v_email
    and public.acesso_esta_liberado(a.pago, a.assinatura_status, a.proxima_cobranca);

  return query select * from public.obter_perfil(v_email);
end;
$$;

create or replace function public.registrar_ritual(
  p_email text,
  p_carta_id int default null,
  p_carta_nome text default null
)
returns table (
  nome text,
  data_nascimento date,
  numero_destino int,
  streak_dias int,
  recorde_streak int,
  produto text,
  ritual_feito_hoje boolean,
  rituais_em date[],
  cartas_vividas jsonb
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
  v_streak int;
  v_cartas jsonb;
  v_ja_tem boolean;
begin
  select * into rec
  from public.acessos a
  where lower(a.email) = v_email
    and public.acesso_esta_liberado(a.pago, a.assinatura_status, a.proxima_cobranca);

  if not found then
    raise exception 'acesso não liberado';
  end if;

  if rec.ultimo_ritual_em = v_hoje then
    v_streak := coalesce(rec.streak_dias, 0);
  elsif rec.ultimo_ritual_em = v_ontem then
    v_streak := coalesce(rec.streak_dias, 0) + 1;
  else
    v_streak := 1;
  end if;

  v_cartas := coalesce(rec.cartas_vividas, '[]'::jsonb);
  v_ja_tem := false;
  if p_carta_id is not null then
    select exists (
      select 1
      from jsonb_array_elements(v_cartas) e
      where (e->>'id')::int = p_carta_id
    ) into v_ja_tem;
    if not v_ja_tem then
      v_cartas := v_cartas || jsonb_build_array(
        jsonb_build_object(
          'id', p_carta_id,
          'nome', coalesce(p_carta_nome, ''),
          'em', v_hoje::text
        )
      );
    end if;
  end if;

  update public.acessos
  set
    streak_dias = v_streak,
    recorde_streak = greatest(coalesce(recorde_streak, 0), v_streak),
    ultimo_ritual_em = v_hoje,
    rituais_em = case
      when v_hoje = any(coalesce(rituais_em, '{}')) then rituais_em
      else array_append(coalesce(rituais_em, '{}'), v_hoje)
    end,
    cartas_vividas = v_cartas
  where id = rec.id;

  return query select * from public.obter_perfil(v_email);
end;
$$;

create table if not exists public.ritual_ecos_dia (
  email text not null,
  dia date not null,
  chamadas int not null default 0,
  primary key (email, dia)
);

alter table public.ritual_ecos_dia enable row level security;
revoke all on table public.ritual_ecos_dia from public, anon, authenticated;
grant all on table public.ritual_ecos_dia to service_role;

grant execute on function public.acesso_esta_liberado(boolean, text, date) to anon, authenticated, service_role;
grant execute on function public.verificar_acesso(text) to anon, authenticated, service_role;
grant execute on function public.obter_perfil(text) to anon, authenticated;
grant execute on function public.salvar_onboarding(text, text, date) to anon, authenticated;
grant execute on function public.registrar_ritual(text, integer, text) to anon, authenticated;
