# EstudarHub Frontend

Frontend web do EstudarHub (Vite + React + TypeScript) consumindo a API Spring Boot.

Deploy atual: `https://estudarhub.vercel.app/`

## Stack

- Vite + React + TypeScript
- TailwindCSS + shadcn-ui
- Axios para HTTP
- Auth via JWT em `localStorage` (header `Authorization: Bearer <token>`)

## Rodar Local

Requisitos: Node 18+ (ou Bun) e npm.

```bash
npm install
npm run dev
```

## Variaveis de Ambiente

Arquivo `.env`:

- `VITE_API_URL`: base URL da API (inclui `/api`)

Exemplo:

```bash
VITE_API_URL=https://estudarhunbackend.onrender.com/api
```

## Como o Auth Funciona

- Login/Register chamam `/auth/login` e `/auth/register`.
- O token vem em `data.token`.
- O axios interceptor ([api.ts](./src/services/api.ts)) injeta o token em cada request.
- Em `401`, o frontend limpa o token e redireciona para `/login`.

## Contrato de API Usado Pelo Frontend

Todos os calls estao em `src/services/*.ts` e assumem a base `VITE_API_URL`.

Principais endpoints:

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
- Instituicoes:
  - `GET /institutions` (paginado; `data.content`)
  - `GET /institutions/{id}`
- Categorias:
  - `GET /categories`
  - `GET /categories/{id}`
- Projetos:
  - `GET /projects`
  - `GET /projects/{id}`
  - `POST /projects` (multipart)
  - `PUT /projects/{id}` (multipart)
  - `DELETE /projects/{id}`
  - `POST /projects/{id}/comments`
  - `POST /projects/{id}/participate`
  - `POST /projects/{id}/invite`
- Convites:
  - `GET /invitations/me`
  - `PUT /invitations/{id}/accept`
  - `PUT /invitations/{id}/reject`
- Eventos:
  - `GET /events`
  - `GET /events/{id}`
  - `POST /events/{id}/participate`
  - `DELETE /events/{id}/participate`
- Chat:
  - `GET /chats`
  - `GET /chats/{id}`
  - `GET /chats/{id}/messages`
  - `POST /chats/{id}/messages`

## Fluxo de Registo (Register)

Arquivo: `src/pages/Register.tsx`

- Step "Dados Academicos" carrega as instituicoes do backend via `GET /institutions`.
- O valor do select e o `institutionId` (string numerica) e e convertido para `number` antes de enviar.
- `Ano academico` e validado no frontend porque o backend exige `anoAcademico`.

## Backend Checklist (Para Ficar 100% Conectado)

- Backend precisa estar acessivel publicamente e com CORS liberado para o dominio da Vercel.
- Endpoints acima precisam existir e responder no formato `{ success, message, data }`.
- O banco no Render precisa estar com as migrations aplicadas (principalmente `project_invitations`).

Documentacao detalhada do backend (API, DB, security, deploy): ver `docs/` no repo do backend.
