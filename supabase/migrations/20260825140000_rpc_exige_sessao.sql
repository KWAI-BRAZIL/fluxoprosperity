-- RPCs sensíveis exigem o token de sessão (já emitido em cadastrar/entrar).
-- Token inválido: leitura vazia / escrita com erro genérico — sem revelar se o e-mail existe.

drop function if exists public.obter_perfil(text);
drop function if exists public.obter_perfil(text, text);
drop function if exists public.salvar_onboarding(text, text, date);
drop function if exists public.salvar_onboarding(text, text, text, date);
drop function if exists public.registrar_ritual(text);
drop function if exists public.registrar_ritual(text, integer, text);
drop function if exists public.registrar_ritual(text, text, integer, text);
drop function if exists public.listar_entradas_ritual(text);
drop function if exists public.listar_entradas_ritual(text, text);
drop function if exists public.salvar_entrada_ritual(text, int, text, text[], text[], text);
drop function if exists public.salvar_entrada_ritual(text, text, int, text, text[], text[], text);
drop function if exists public.obter_sintese(text, text, text);
drop function if exists public.obter_sintese(text, text, text, text);

create or replace function public.obter_perfil(p_email text, p_token text)
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
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
begin
  if not public.verificar_sessao(v_email, p_token) then
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
  where lower(a.email) = v_email;
end;
$$;

create or replace function public.salvar_onboarding(
  p_email text,
  p_token text,
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
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_nome text := trim(coalesce(p_nome, ''));
  v_numero int;
begin
  if not public.verificar_sessao(v_email, p_token) then
    raise exception 'sessao invalida' using errcode = '28000';
  end if;
  if char_length(v_nome) < 2 then
    raise exception 'nome obrigatório';
  end if;
  if p_data_nascimento is null then
    raise exception 'data de nascimento obrigatória';
  end if;

  v_numero := public.numero_destino_data(p_data_nascimento);

  update public.acessos a
  set
    nome = v_nome,
    data_nascimento = p_data_nascimento,
    numero_destino = v_numero
  where lower(a.email) = v_email;

  return query select * from public.obter_perfil(v_email, p_token);
end;
$$;

create or replace function public.registrar_ritual(
  p_email text,
  p_token text,
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
set search_path = public, extensions
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
  if not public.verificar_sessao(v_email, p_token) then
    raise exception 'sessao invalida' using errcode = '28000';
  end if;

  select * into rec
  from public.acessos a
  where lower(a.email) = v_email;

  if not found then
    raise exception 'sessao invalida' using errcode = '28000';
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

  return query select * from public.obter_perfil(v_email, p_token);
end;
$$;

create or replace function public.salvar_entrada_ritual(
  p_email text,
  p_token text,
  p_carta_id int,
  p_carta_nome text,
  p_perguntas text[],
  p_respostas text[],
  p_conselho text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hoje date := (timezone('America/Sao_Paulo', now()))::date;
begin
  if not public.verificar_sessao(v_email, p_token) then
    raise exception 'sessao invalida' using errcode = '28000';
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

create or replace function public.listar_entradas_ritual(p_email text, p_token text)
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
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if not public.verificar_sessao(v_email, p_token) then
    return;
  end if;
  return query
    select e.dia, e.carta_id, e.carta_nome, e.perguntas, e.respostas, e.conselho
    from public.ritual_entradas e
    where e.email = v_email
    order by e.dia desc
    limit 120;
end;
$$;

create or replace function public.obter_sintese(p_email text, p_token text, p_tipo text, p_periodo text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_txt text;
begin
  if not public.verificar_sessao(v_email, p_token) then
    return null;
  end if;
  select s.texto into v_txt
  from public.sinteses s
  where s.email = v_email and s.tipo = p_tipo and s.periodo = p_periodo;
  return v_txt;
end;
$$;

revoke execute on function public.verificar_acesso(text) from public, anon, authenticated;
grant execute on function public.verificar_acesso(text) to service_role;
grant execute on function public.verificar_sessao(text, text) to anon, authenticated, service_role;
grant execute on function public.obter_perfil(text, text) to anon, authenticated;
grant execute on function public.salvar_onboarding(text, text, text, date) to anon, authenticated;
grant execute on function public.registrar_ritual(text, text, integer, text) to anon, authenticated;
grant execute on function public.salvar_entrada_ritual(text, text, int, text, text[], text[], text) to anon, authenticated;
grant execute on function public.listar_entradas_ritual(text, text) to anon, authenticated;
grant execute on function public.obter_sintese(text, text, text, text) to anon, authenticated;
