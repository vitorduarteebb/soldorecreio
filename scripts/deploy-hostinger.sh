#!/usr/bin/env bash
# Rode na raiz do repositório clonado no servidor (pasta com package.json, prisma/, src/).
set -euo pipefail

export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"

echo "Node: $(node -v) | npm: $(npm -v)"

if [[ ! -f prisma/schema.prisma ]]; then
  echo "Erro: prisma/schema.prisma não encontrado. Você não está na raiz do repositório."
  echo "Use: cd ~/domains/SEU_DOMINIO.hostingersite.com/nodejs && pwd && ls prisma/schema.prisma"
  echo "Se faltar: git pull origin main"
  exit 1
fi

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

npx prisma generate
npx prisma migrate deploy
npm run build

echo "OK. Reinicie o app Node no hPanel e confira https://SEU_DOMINIO/api/health"
