-- Recorde de streak (não punitivo) + coleção das 22 cartas vividas no ritual.

alter table public.acessos
  add column if not exists recorde_streak int not null default 0,
  add column if not exists cartas_vividas jsonb not null default '[]'::jsonb;

comment on column public.acessos.recorde_streak is 'Maior sequência já alcançada. Não zera quando a sequência atual quebra.';
comment on column public.acessos.cartas_vividas is 'Arcanos vividos no ritual: [{id, nome, em}].';

update public.acessos
set recorde_streak = greatest(coalesce(recorde_streak, 0), coalesce(streak_dias, 0))
where recorde_streak < coalesce(streak_dias, 0);

drop function if exists public.obter_perfil(text);
drop function if exists public.salvar_onboarding(text, text, date);
drop function if exists public.registrar_ritual(text);
drop function if exists public.registrar_ritual(text, integer, text);

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
    and a.pago = true;

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

grant execute on function public.obter_perfil(text) to anon, authenticated;
grant execute on function public.salvar_onboarding(text, text, date) to anon, authenticated;
grant execute on function public.registrar_ritual(text, integer, text) to anon, authenticated;
