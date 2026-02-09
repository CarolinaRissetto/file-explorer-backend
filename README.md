# File Explorer – Backend

API REST para gerenciamento de arquivos e pastas.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL

## Pré-requisitos

- Node.js 18+
- npm ou pnpm
- PostgreSQL no Railway (recomendado) ou Docker/PostgreSQL local

## Como executar

### Desenvolvimento com PostgreSQL no Railway

1. Crie um banco PostgreSQL no [Railway](https://railway.app): New > Database > PostgreSQL.
2. Copie a `DATABASE_URL` das variáveis do serviço e cole no `.env`.
3. Rode:

```sh
npm install
cp .env.example .env
# Edite .env com a DATABASE_URL do Railway
npx prisma migrate deploy
npm run dev
```

### Desenvolvimento local (com Docker)

```sh
docker-compose up -d
npm install
cp .env.example .env
# Use DATABASE_URL="postgresql://postgres:postgres@localhost:5432/file_explorer" no .env
npx prisma migrate deploy
npm run dev
```

### Execuções seguintes

```sh
npm run dev
```

O servidor roda em `http://localhost:3001` por padrão. O frontend deve apontar para essa URL.

## Scripts disponíveis

- `npm run dev` – Servidor de desenvolvimento com hot-reload
- `npm run build` – Gera Prisma Client e compila TypeScript
- `npm run start` – Executa o build em produção
- `npm run dev:watch` – Desenvolvimento com nodemon

## Produção

Para aplicar migrações em produção (sem criar novas):

```sh
npx prisma migrate deploy
```

## Deploy no Railway

1. Crie um projeto no [Railway](https://railway.app) e adicione um serviço a partir do repositório.

2. Adicione o **PostgreSQL**: Railway > New > Database > PostgreSQL.

3. Configure as variáveis de ambiente:
   - `DATABASE_URL` – Railway preenche automaticamente ao vincular o PostgreSQL.
   - `CORS_ORIGIN` – URL do frontend (ex: `https://seu-app.vercel.app`).

4. Railway usa `PORT` automaticamente. O build e o start seguem o `nixpacks.toml`.

5. As migrações são executadas antes do start (`prisma migrate deploy`).

## Variáveis de ambiente

| Variável       | Descrição                             |
|----------------|---------------------------------------|
| `DATABASE_URL` | URL PostgreSQL (obrigatória em produção) |
| `PORT`         | Porta (Railway define automaticamente) |
| `CORS_ORIGIN`  | URLs permitidas, separadas por vírgula (produção) |
