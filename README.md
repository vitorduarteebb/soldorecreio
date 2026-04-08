# soldorecreio

Sistema de mercado com **cashback**: clientes filiados acumulam percentual nas compras; o administrador lança compras, promoções com notificação e gerencia resgates.

## Stack

- Next.js 16, React 19, Tailwind CSS  
- Prisma + SQLite  
- NextAuth (credenciais)

## Como rodar

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Contas de demonstração (após seed)

| Perfil   | E-mail               | Senha     |
|----------|----------------------|-----------|
| Admin    | admin@mercado.com    | admin123  |
| Cliente  | cliente@demo.com     | cliente123 |

Código de filiação para novos cadastros: `SOL2026`.

## Scripts

- `npm run dev` — desenvolvimento  
- `npm run build` / `npm start` — produção  
- `npm run db:seed` — popular dados de demo  
