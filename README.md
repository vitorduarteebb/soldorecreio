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
| `AUTH_SECRET` | **Obrigatório em produção.** Sem isso, `/api/auth/session` retorna **500**. String longa e aleatória (32+ caracteres). |
| `NEXTAUTH_SECRET` | (Opcional) Mesmo valor que `AUTH_SECRET`, se preferir usar esse nome. |
| `AUTH_URL` | **URL pública exata** do site, **sem barra no final** — ex.: `https://silver-sheep-181616.hostingersite.com` |
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

## Produção (Hostinger)

### 1. Variáveis no painel (Web / Node)

Defina **todas** (nomes exatos):

| Nome | Valor (exemplo) |
|------|------------------|
| `AUTH_SECRET` | Gere uma string longa (ex.: 40+ caracteres aleatórios). |
| `AUTH_URL` | `https://SEU_SUBDOMINIO.hostingersite.com` — **igual** ao que aparece no navegador. |
| `DATABASE_URL` | `mysql://USUARIO_MYSQL:SENHA@HOST:3306/NOME_DO_BANCO` |

O `HOST` costuma ser `localhost` ou `127.0.0.1` se o app e o MySQL estão no mesmo servidor. **Copie usuário, senha e nome do banco** em **hPanel → Bancos de dados MySQL**.

### 2. Migração e seed (SSH ou terminal da Hostinger)

No diretório do projeto após o deploy:

```bash
npx prisma migrate deploy
npm run db:seed
```

### 3. Erro 500 em `/api/auth/session` (“server configuration”)

- **`AUTH_SECRET`** ausente ou vazio → configure no painel e **reinicie** a aplicação.
- **`AUTH_URL`** ausente ou errado → use exatamente `https://...` do seu site (sem `/` no final).

### 4. Erro 503 no cadastro (“Não foi possível conectar ao banco”)

- **`DATABASE_URL`** incorreto (usuário, senha, host ou nome do banco).
- Migração não aplicada: rode `npx prisma migrate deploy`.
- Se o host `localhost` falhar, teste `127.0.0.1` no lugar do host na URL.
- Confirme no hPanel que o usuário MySQL tem permissão para esse banco.

### Aviso do Chrome (`webpage_content_reporter.js` / `Unexpected token 'export'`)

Costuma ser **extensão do navegador** (não é do projeto). Teste em **janela anônima** sem extensões.

## Scripts

- `npm run dev` — desenvolvimento  
- `npm run build` / `npm start` — produção  
- `npm run db:seed` — dados iniciais  
