# EstudarHub Frontend

Frontend web do EstudarHub (Vite + React + TypeScript) consumindo a API Spring Boot.

Deploy atual: `https://estudarhub.vercel.app/`

## Stack

- Vite + React + TypeScript
- TailwindCSS + shadcn-ui
- Axios para HTTP
- Auth via **sessao** (cookie `JSESSIONID`) com `withCredentials: true`

## Rodar Local

Requisitos: Node 18+ (ou Bun) e npm.

```bash
npm install
npm run dev
```

## Variaveis de Ambiente

Cria um `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

- `VITE_API_URL`: base URL da API

Recomendado:

- Em producao (Vercel): `VITE_API_URL=/api` (same-origin) + `vercel.json` faz rewrite para o backend
- Em dev local: `VITE_API_URL=http://localhost:8080/api`

## Como o Auth Funciona (Sessao)

- Login/Register chamam `/auth/login` e `/auth/register`.
- O backend cria uma sessao e devolve cookie `JSESSIONID`.
- O axios ([api.ts](./src/services/api.ts)) usa `withCredentials: true` para enviar cookies.
- Em `401`, o frontend limpa o cache local e redireciona para `/login`.

## Contrato de API Usado Pelo Frontend

Todos os calls estao em `src/services/*.ts` e assumem a base `VITE_API_URL`.

Principais endpoints:

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
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
