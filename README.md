# 📚 Livraria Ver e Ler — Backend

Backend da plataforma **Livraria Ver e Ler**, uma aplicação para autores independentes publicarem seus livros após curadoria do administrador.

---

## 🚀 Tecnologias

- [NestJS](https://nestjs.com/) — Framework Node.js
- [TypeORM](https://typeorm.io/) — ORM para banco de dados
- [MySQL](https://www.mysql.com/) — Banco de dados
- [JWT](https://jwt.io/) — Autenticação
- [Passport](http://www.passportjs.org/) — Middleware de autenticação
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — Hash de senhas

---

## 📋 Pré-requisitos

- Node.js v18+
- MySQL 8+
- npm

---

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/imgabrielimartins/backend-livraria.git
cd backend-livraria

# Instale as dependências
npm install
```

---

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=sua_senha
DB_NAME=ver_e_ler_db

JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES=7d

ADMIN_EMAIL=admin@vereler.com
ADMIN_PASSWORD=sua_senha_admin
ADMIN_NAME=Administrador
```

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE ver_e_ler_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ▶️ Rodando o projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

O servidor sobe em `http://localhost:3000/api`

Na primeira execução, o usuário **admin** é criado automaticamente com as credenciais do `.env`.

---

## 👤 Perfis de usuário

| Role | Descrição |
|---|---|
| `leitor` | Pode explorar o marketplace |
| `autor` | Pode submeter livros para publicação |
| `admin` | Gerencia livros e aprova publicações |

> O perfil `admin` é criado automaticamente e não pode ser cadastrado via API.

---

## 📖 Fluxo de publicação

```
Autor submete o livro
        ↓
status: PENDENTE
        ↓
Admin coloca EM_ANALISE
        ↓
Admin APROVA ou REJEITA (com motivo)
        ↓
Se aprovado → Autor clica em "Publicar"
        ↓
Livro aparece no Marketplace
```

---

## 🛣️ Rotas da API

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Cadastro de usuário |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Dados do usuário logado |

### Books

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/books` | ✅ Autor | Submeter livro |
| GET | `/api/books/mine` | ✅ Autor | Meus livros com status |
| PATCH | `/api/books/:id/publish` | ✅ Autor | Publicar livro aprovado |
| GET | `/api/books/published` | ❌ | Marketplace público |
| GET | `/api/books/authors` | ❌ | Lista autores do marketplace |
| GET | `/api/books/pending` | ✅ Admin | Livros pendentes |
| PATCH | `/api/books/:id/analysis` | ✅ Admin | Colocar em análise |
| PATCH | `/api/books/:id/approve` | ✅ Admin | Aprovar livro |
| PATCH | `/api/books/:id/reject` | ✅ Admin | Rejeitar com motivo |

---

## 📦 Exemplos de requisição

### Cadastro
```json
POST /api/auth/register
{
  "name": "Gabriel Martins",
  "email": "gabriel@email.com",
  "password": "123456",
  "role": "autor"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "gabriel@email.com",
  "password": "123456"
}
```

### Submeter livro
```json
POST /api/books
Authorization: Bearer <token>
{
  "title": "Meu Primeiro Livro",
  "synopsis": "Uma história incrível...",
  "authorMessage": "Escrevi este livro com muito carinho.",
  "genre": "romance"
}
```

### Rejeitar livro (admin)
```json
PATCH /api/books/1/reject
Authorization: Bearer <token>
{
  "adminNote": "O livro precisa de revisão ortográfica."
}
```

---

## 🗂️ Estrutura do projeto

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
├── books/
│   ├── book.entity.ts
│   ├── books.controller.ts
│   ├── books.module.ts
│   └── books.service.ts
├── users/
│   ├── seed-admin.service.ts
│   ├── user.entity.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts
└── main.ts
```

---

## 🔗 Frontend

O frontend deste projeto está disponível em: [Livraria Ver e Ler](https://github.com/Renato666Jk/Livraria-Ver-e-Ler)

---

## 📄 Licença

Este projeto está sob a licença MIT.