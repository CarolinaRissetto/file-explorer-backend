# File Explorer – Backend

API REST para gerenciamento de arquivos e pastas (PostgreSQL + Prisma).

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL

## Pré-requisitos

- **Node.js** 18+
- **Docker** e **Docker Compose** (para subir o PostgreSQL em desenvolvimento)

## Como executar

1. Instale as dependências e copie o `.env`:
```sh
npm install
cp .env.example .env
```

2. Suba o PostgreSQL com Docker:
```sh
docker-compose up -d
```

3. Aplique as migrações e inicie o servidor:
```sh
npx prisma migrate deploy
npm run dev
```

O servidor fica em `http://localhost:3001`. Rode o backend antes do frontend.

**Rodar o projeto completo:** depois que este servidor estiver no ar, abra a pasta do frontend (`file-explorer-frontend`) e siga o README de lá.

## Scripts disponíveis

- `npm run dev` – Servidor de desenvolvimento com hot-reload
- `npm run dev:watch` – Desenvolvimento com nodemon (observa só a pasta `src`)
- `npm run build` – Gera Prisma Client e compila TypeScript
- `npm run start` – Executa o build (sem migrações)
- `npm run start:prod` – Aplica migrações e executa o build

## Variáveis de ambiente

| Variável       | Descrição |
|----------------|-----------|
| `DATABASE_URL` | URL do PostgreSQL (obrigatória) |
| `PORT`         | Porta do servidor (padrão: 3001) |
