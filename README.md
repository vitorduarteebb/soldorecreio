# soldorecreio

Sistema de **cashback** do **Sol do Recreio**: cadastro com **WhatsApp**, login com **e-mail/senha** ou **Google** (OAuth), banco **MySQL**.

**Apresentação / roteiro de demo:** veja [`APRESENTACAO.md`](./APRESENTACAO.md).

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

### 0. Código completo no servidor (obrigatório)

Se no SSH `ls prisma/schema.prisma` e `ls src/app` falharem, a pasta do Node **não é o repositório inteiro** — só um `package.json` solto não basta. O build precisa de `prisma/`, `src/`, `package-lock.json`, etc.

**Opção recomendada (SSH):** na pasta do domínio, faça backup e clone o repositório para o diretório que o painel Node usa (ex.: `nodejs`):

```bash
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
cd ~/domains/SEU_DOMINIO.hostingersite.com
mv nodejs nodejs.bak.$(date +%Y%m%d)   # ou apague se não precisar do conteúdo antigo
git clone https://github.com/vitorduarteebb/soldorecreio.git nodejs
cd nodejs
chmod +x scripts/deploy-hostinger.sh
./scripts/deploy-hostinger.sh
```

#### Se `git pull` disser “not a git repository” ou `ls prisma/schema.prisma` falhar

A pasta `nodejs` **não é** o repositório do GitHub (só sobrou um `package.json` ou upload incompleto). **Não adianta** `npm install` sem `prisma/` e `src/`.

Faça backup e **clone de novo** (substitua pelo seu domínio):

```bash
cd ~/domains/SEU_DOMINIO.hostingersite.com
mv nodejs nodejs.broken.$(date +%Y%m%d)
git clone https://github.com/vitorduarteebb/soldorecreio.git nodejs
cd nodejs
ls prisma/schema.prisma prisma/seed.ts src/app
```

Depois: `npm install`, `export DATABASE_URL='...'`, `npm exec prisma migrate deploy`, `npm run db:seed`, `./scripts/deploy-hostinger.sh` (ou `npm run build`), reinicie o app Node no hPanel. Configure **`DATABASE_URL`**, **`AUTH_SECRET`** e **`AUTH_URL`** no hPanel (ver §1 abaixo).

O build usa **`output: "standalone"`** e copia **`/.next/static`** e **`/public`** para dentro de **`.next/standalone/`**. Sem isso, o navegador recebe **404/500** em CSS/JS e a página fica **sem estilo**. O comando de start é **`node server.js`** (arquivo na raiz), que escuta em **`0.0.0.0`** e usa a porta **`PORT`** do painel.

No hPanel (Node.js), use **arquivo de inicialização** `server.js` **ou** comando **`npm start`** (ambos apontam para o mesmo).

### 1. Variáveis no painel (Web / Node)

Defina **todas** (nomes exatos):

| Nome | Valor (exemplo) |
|------|------------------|
| `AUTH_SECRET` | Gere uma string longa (ex.: 40+ caracteres aleatórios). |
| `AUTH_URL` | `https://SEU_SUBDOMINIO.hostingersite.com` — **igual** ao que aparece no navegador. |
| `DATABASE_URL` | `mysql://USUARIO_MYSQL:SENHA@HOST:3306/NOME_DO_BANCO` |

O `HOST` costuma ser `localhost` ou `127.0.0.1` se o app e o MySQL estão no mesmo servidor. **Copie usuário, senha e nome do banco** em **hPanel → Bancos de dados MySQL**.

### 2. Migração e seed (SSH ou terminal da Hostinger)

**Antes:** entre na **raiz do clone** (onde existem `package.json` e `prisma/schema.prisma`):

```bash
cd ~/domains/SEU_DOMINIO.hostingersite.com/nodejs
ls prisma/schema.prisma   # tem que existir; senão: git pull
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
npm install
```

A URL do MySQL **não é um comando** no bash: não digite `mysql://...` sozinho na linha (o shell tenta “executar” isso e dá erro). Use só em `export` ou no painel.

Use a **mesma** `DATABASE_URL` do hPanel (URL completa, sem `...`):

```bash
export DATABASE_URL='mysql://USUARIO:SENHA_ENCODADA@127.0.0.1:3306/NOME_DO_BANCO'
npm exec prisma migrate deploy
npm run db:seed
```

(`npm exec prisma` usa o Prisma **do projeto**, versão 5, e reconhece o seed do `package.json`.)

### Checklist rápido se “ainda não está legal”

1. **`/api/health`** → `ok: true` e `DATABASE_REACHABLE: true`. Se `false`, corrija variáveis no hPanel e reinicie o app (não use só `export` no SSH).
2. **Pasta do app** no hPanel = raiz do clone (onde estão `server.js`, `prisma/`, `src/`).
3. **Comando de start** = `node server.js` ou `npm start` (nunca `next dev`).
4. Após cada `git pull`: **`npm install`** e **`npm run build`** no SSH, depois reiniciar o Node.
5. **Build sempre no servidor Linux** (ou no mesmo OS do deploy): o engine do Prisma é gerado para aquele sistema.

### Diagnóstico rápido

Abra no navegador (substitua pelo seu domínio):

`https://SEU_SITE/api/health`

A resposta JSON mostra o que está **false** (variável não definida no servidor). Corrija no painel e faça **redeploy**.

### 3. Erro 500 em `/api/auth/session` (“server configuration”)

- **`AUTH_SECRET`** ausente ou vazio → configure no painel e **reinicie** a aplicação.
- Se o painel **não** repassar variáveis ao Node (comum em algumas VPS), crie na **raiz do app** (mesma pasta que `server.js`) o arquivo **`.env.production`** com `AUTH_SECRET`, `AUTH_URL` e `DATABASE_URL` (copie de `.env.example`). O `server.js` carrega esse arquivo **antes** do Next.
- **`AUTH_URL`** ou **`NEXTAUTH_URL`** → use exatamente `https://...` do seu site (sem `/` no final). Se o painel só tiver `NEXTAUTH_URL`, o app copia para `AUTH_URL` automaticamente.
- Se a Hostinger usar **`NODE_ENV=production`**, **`AUTH_SECRET` é obrigatório** (não há fallback).

### 4. Página sem CSS / erros 404 ou 500 em `/_next/static/`

- Rode **`npm run build`** no servidor (ou `./scripts/deploy-hostinger.sh`) após cada `git pull` — o script de build **copia** os assets para o modo standalone.
- Confirme que o app **não** está em `next dev` em produção.
- Variável opcional: **`HOSTNAME=0.0.0.0`** (o `server.js` já define padrão).

### 5. Erro 503 no cadastro (“Não foi possível conectar ao banco”)

- **`DATABASE_URL`** incorreto (usuário, senha, host ou nome do banco).
- **Senha com caracteres especiais** (`@`, `#`, `%`, etc.): codifique na URL (ex.: `@` → `%40`) ou troque a senha do MySQL por uma sem símbolos reservados.
- Migração não aplicada: rode `npx prisma migrate deploy`.
- Se o host `localhost` falhar, teste `127.0.0.1` no lugar do host na URL.
- Confirme no hPanel que o usuário MySQL tem permissão para esse banco.

### Aviso do Chrome (`webpage_content_reporter.js` / `Unexpected token 'export'`)

Costuma ser **extensão do navegador** (não é do projeto). Teste em **janela anônima** sem extensões.

## Scripts

- `npm run dev` — desenvolvimento  
- `npm run build` — produção (gera standalone e copia `static`/`public`)  
- `npm start` — `node server.js` (produção)  
- `npm run db:seed` — dados iniciais  
- `scripts/deploy-hostinger.sh` — no servidor (SSH), instala dependências, `prisma generate`, `migrate deploy` e `next build`  
