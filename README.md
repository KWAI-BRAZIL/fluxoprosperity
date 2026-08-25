# Desbloqueio de Abundância

App web mobile-first (Vite + React + TypeScript) de numerologia e tarot, com acesso liberado só depois do pagamento na Cakto.

O mockup visual está em `app_abundancia_mobile.html` (paleta dourado/roxo, Fraunces + Inter).

## Stack

- Front: Vite, React, TypeScript, Vercel
- Banco e RPCs: Supabase
- Webhook: Edge Function `cakto-webhook`
- Pagamento: Cakto (checkout externo — este app **não** tem tela de pagamento)

## Rodar local

```bash
cp .env.example .env
# preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e os links da Cakto
npm install
npm run dev
```

Acesso ao app **nunca** é liberado por parâmetro de URL ou `localStorage` sozinho. O e-mail é só um lembrete: cada tela paga chama `verificar_acesso` no Supabase.

## Variáveis de ambiente

| Variável | Onde | Função |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Front / Vercel | URL do projeto |
| `VITE_SUPABASE_ANON_KEY` | Front / Vercel | Chave anon (RLS + RPCs) |
| `VITE_CAKTO_CHECKOUT_URL` | Front / Vercel | Checkout do acesso único (R$14,97) |
| `VITE_CAKTO_LEITURA_URL` | Front / Vercel | Upsell leitura (R$97) |
| `VITE_CAKTO_ASSINATURA_URL` | Front / Vercel | Upsell assinatura (R$27/mês) |
| `SUPABASE_SERVICE_ROLE_KEY` | Só Edge Function | Upsert em `acessos` |
| `CAKTO_WEBHOOK_SECRET` | Só Edge Function | Campo `secret` do POST da Cakto |
| `CAKTO_PRODUCT_*_ID` | Só Edge Function | Opcional, IDs para mapear `produto` |

A service role **não** pode ter prefixo `VITE_`. Se cair no front, qualquer pessoa escreve na tabela.

## Supabase

1. Crie o projeto.
2. SQL Editor: rode `supabase/migrations/20260823120000_acessos.sql`.
3. Deploy da function:

```bash
supabase functions deploy cakto-webhook --no-verify-jwt
supabase secrets set CAKTO_WEBHOOK_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...
```

`verify_jwt` precisa estar desligado: a Cakto não envia JWT do Supabase.

URL do webhook (cadastre em Cakto → Integrações → Webhooks, evento **Compra aprovada** / `purchase_approved`):

```
https://<ref>.supabase.co/functions/v1/cakto-webhook
```

O segredo da Cakto vai no JSON (`secret`), não em HMAC de header. A function compara esse campo (e, por segurança, headers equivalentes) com `CAKTO_WEBHOOK_SECRET`. Secret inválido → **401**, sem gravar.

## Cakto (manual)

1. Cadastre os 3 produtos: acesso único R$14,97 / leitura R$97 / assinatura R$27/mês.
2. Cole os links de checkout nas variáveis `VITE_CAKTO_*`.
3. URL de redirecionamento pós-compra: `https://seu-dominio/pos-compra`.
4. Ligue o webhook no evento Compra aprovada.
5. Teste com uma compra real de valor baixo antes de divulgar.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Landing / vendas |
| `/pos-compra` | E-mail da compra → RPC `verificar_acesso` |
| `/onboarding` | Nome + nascimento → numerologia pitagórica real |
| `/home` | Favorece hoje, número da sorte, carta, streak |
| `/ritual` | 3 passos do ritual do dia |
| `/cuidados` | CVV 188 e Jogadores Anônimos — rota **pública**, também no menu após o login |
| `/upsell` | Leitura R$97 e assinatura R$27 |

## Segurança do banco

- RLS ligado, **nenhuma** policy para `anon`/`authenticated`.
- `verificar_acesso` devolve só `pago`.
- `obter_perfil` / `salvar_onboarding` / `registrar_ritual` só funcionam se `pago = true`.
- Número de destino é recalculado no banco a partir da data (não confia no valor do client).
