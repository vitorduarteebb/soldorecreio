# soldorecreio

Sistema de **cashback** do **Sol do Recreio**: cadastro com **WhatsApp**, login com **e-mail/senha** ou **Google** (OAuth), banco **MySQL**.

## Requisitos

- Node.js 18+
- MySQL 8+ (Hostinger ou outro provedor)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL MySQL, ex.: `mysql://usuario:senha@host:3306/nome_banco` |
| `AUTH_SECRET` | **Obrigatório.** Sem isso, `/api/auth/session` falha com 500. String longa e aleatória. |
| `NEXTAUTH_SECRET` | (Opcional) Mesmo valor que `AUTH_SECRET`, se preferir usar esse nome. |
| `AUTH_URL` | URL pública do site, ex.: `https://seudominio.com.br` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth no [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Mesmo **Client ID** (público) — usado para exibir o botão “Continuar com Google” |

**Redirect URI autorizado no Google:**  
`https://SEU_DOMINIO/api/auth/callback/google`

## Banco de dados

```bash
npx prisma migrate deploy
npm run db:seed
```

O seed cria o mercado **Sol do Recreio**, o admin e um cliente de teste.

## Desenvolvimento local

```bash
npm install
cp .env.example .env
# Ajuste DATABASE_URL para seu MySQL local ou remoto
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Contas de demonstração (após seed)

| Perfil  | E-mail              | Senha     |
|---------|---------------------|-----------|
| Admin   | admin@mercado.com   | admin123  |
| Cliente | cliente@demo.com    | cliente123 |

## Produção (Hostinger / Node)

1. Defina as variáveis de ambiente no painel (**inclua `AUTH_SECRET` e `DATABASE_URL` válidos para MySQL**).
2. `npm install` / build conforme o fluxo da hospedagem.
3. `npx prisma migrate deploy` e `npm run db:seed` (ou só seed na primeira vez).

### Erro 500 em `/api/auth/session` ou “auth configuration”

- Defina **`AUTH_SECRET`** (ou `NEXTAUTH_SECRET`) no painel com uma string longa e aleatória.
- Defina **`AUTH_URL`** com a URL real do site (ex.: `https://seudominio.com.br`).

### Erro 500 em `/api/register`

- Confira **`DATABASE_URL`** (MySQL acessível, usuário/senha/host corretos).
- Rode **`npx prisma migrate deploy`** no servidor após o deploy.

## Scripts

- `npm run dev` — desenvolvimento  
- `npm run build` / `npm start` — produção  
- `npm run db:seed` — dados iniciais  
