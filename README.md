# soldorecreio

Sistema de **cashback** exclusivo do mercado **Sol do Recreio**: clientes acumulam percentual nas compras; a equipe lança compras, promoções com aviso aos cadastrados e gerencia resgates.

## Stack

- Next.js 16, React 19, Tailwind CSS  
- Prisma + SQLite  
- NextAuth (credenciais)

## Como rodar

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Em desenvolvimento local, use `npx prisma migrate dev` no lugar de `deploy` se preferir.

Abra [http://localhost:3000](http://localhost:3000).

### Contas de demonstração (após seed)

| Perfil   | E-mail               | Senha     |
|----------|----------------------|-----------|
| Admin    | admin@mercado.com    | admin123  |
| Cliente  | cliente@demo.com     | cliente123 |

Novos clientes se cadastram pela tela pública — não é necessário código de filiação.

## Scripts

- `npm run dev` — desenvolvimento  
- `npm run build` / `npm start` — produção  
- `npm run db:seed` — popular dados de demo (garante o registro **Sol do Recreio** e usuários de teste)  
