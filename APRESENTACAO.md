# Apresentação — Sol do Recreio (cashback)

## Roteiro rápido (~5 min)

1. **Início** (`/`) — Programa de fidelidade, CTA cadastro e login.
2. **Cliente** — Login com `cliente@demo.com` / `cliente123` (após `npm run db:seed`). Mostrar saldo, histórico, solicitar resgate.
3. **Admin** — Login com `admin@mercado.com` / `admin123`. Ajustar % cashback, lançar compra para o e-mail do cliente, criar promoção, aprovar/recusar resgate.
4. **Cadastro** — Opcional: `/register` com dados fictícios (precisa de banco e seed com merchant).

## Contas de demonstração (seed)

| Perfil  | E-mail              | Senha      |
|---------|---------------------|------------|
| Admin   | admin@mercado.com   | admin123   |
| Cliente | cliente@demo.com  | cliente123 |

Rodar antes: `npx prisma migrate deploy` e `npm run db:seed`.

## URLs úteis

- `/api/health` — diagnóstico de ambiente (produção).

## Frase de fechamento

“O cliente acumula cashback nas compras registradas pela equipe; solicita resgate no app e o mercado aprova no painel — tudo rastreado em um só lugar.”
