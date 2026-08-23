-- Cadastro de senha só depois do pagamento. Entrada só com e-mail + senha.

create extension if not exists pgcrypto;

alter table public.acessos
  add column if not exists senha_hash text,
  add column if not exists sessao_hash text,
  add column if not exists conta_criada_em timestamptz;

comment on column public.acessos.senha_hash is 'bcrypt (pgcrypto). Nunca expor.';
comment on column public.acessos.sessao_hash is 'SHA-256 do token de sessão do app.';

create or replace function public.status_conta(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  rec record;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return 'invalido';
  end if;
  select a.pago, a.assinatura_status, a.proxima_cobranca, a.senha_hash
    into rec
  from public.acessos a
  where lower(a.email) = v_email;
  if not found then
    return 'nao_pago';
  end if;
  if not public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca) then
    return 'nao_pago';
  end if;
  if rec.senha_hash is null or rec.senha_hash = '' then
    return 'cadastrar';
  end if;
  return 'entrar';
end;
$$;

create or replace function public._nova_sessao(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := gen_random_uuid()::text;
begin
  update public.acessos
  set sessao_hash = encode(digest(convert_to(v_token, 'utf8'), 'sha256'), 'hex')
  where id = p_id;
  return v_token;
end;
$$;

create or replace function public.cadastrar_conta(p_email text, p_senha text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  rec record;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'e-mail inválido' using errcode = '22023';
  end if;
  if char_length(coalesce(p_senha, '')) < 8 then
    raise exception 'a senha precisa ter pelo menos 8 caracteres' using errcode = '22023';
  end if;

  select a.id, a.pago, a.assinatura_status, a.proxima_cobranca, a.senha_hash
    into rec
  from public.acessos a
  where lower(a.email) = v_email
  for update;
  if not found then
    raise exception 'pagamento não encontrado para este e-mail' using errcode = 'P0001';
  end if;
  if not public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca) then
    raise exception 'pagamento não encontrado para este e-mail' using errcode = 'P0001';
  end if;
  if rec.senha_hash is not null and rec.senha_hash <> '' then
    raise exception 'esta conta já tem senha. entre pelo login' using errcode = 'P0002';
  end if;

  update public.acessos
  set senha_hash = crypt(p_senha, gen_salt('bf', 10)),
      conta_criada_em = now()
  where id = rec.id;

  return public._nova_sessao(rec.id);
end;
$$;

create or replace function public.entrar_conta(p_email text, p_senha text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  rec record;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'e-mail ou senha inválidos' using errcode = '28000';
  end if;

  select a.id, a.pago, a.assinatura_status, a.proxima_cobranca, a.senha_hash
    into rec
  from public.acessos a
  where lower(a.email) = v_email;
  if not found or rec.senha_hash is null or rec.senha_hash = '' then
    raise exception 'e-mail ou senha inválidos' using errcode = '28000';
  end if;
  if not public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca) then
    raise exception 'assinatura inativa' using errcode = 'P0001';
  end if;
  if rec.senha_hash <> crypt(p_senha, rec.senha_hash) then
    raise exception 'e-mail ou senha inválidos' using errcode = '28000';
  end if;

  return public._nova_sessao(rec.id);
end;
$$;

create or replace function public.verificar_sessao(p_email text, p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  rec record;
  v_hash text;
begin
  if v_email = '' or coalesce(p_token, '') = '' then
    return false;
  end if;
  v_hash := encode(digest(convert_to(p_token, 'utf8'), 'sha256'), 'hex');
  select a.pago, a.assinatura_status, a.proxima_cobranca, a.sessao_hash
    into rec
  from public.acessos a
  where lower(a.email) = v_email;
  if not found or rec.sessao_hash is null then
    return false;
  end if;
  if rec.sessao_hash <> v_hash then
    return false;
  end if;
  return public.acesso_esta_liberado(rec.pago, rec.assinatura_status, rec.proxima_cobranca);
end;
$$;

revoke all on function public._nova_sessao(uuid) from public, anon, authenticated;
grant execute on function public.status_conta(text) to anon, authenticated;
grant execute on function public.cadastrar_conta(text, text) to anon, authenticated;
grant execute on function public.entrar_conta(text, text) to anon, authenticated;
grant execute on function public.verificar_sessao(text, text) to anon, authenticated;
