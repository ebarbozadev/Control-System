# Control System

Primeira versao funcional do projeto: um CRUD de clientes com banco SQLite, interface responsiva e foco em uma experiencia simples de operacao.

## O que esta pronto

- Cadastro de clientes.
- Edicao e exclusao com confirmacao.
- Busca por nome, empresa, e-mail ou telefone.
- Filtro por status: lead, ativo e inativo.
- Indicadores de total, ativos e leads.
- Validacao de formulario e e-mail unico.
- Feedback visual de sucesso e erros.
- Layout responsivo para desktop, tablet e celular.
- Banco SQLite local criado automaticamente em `data/control-system.sqlite`.
- Dados demonstrativos inseridos apenas na primeira execucao de um banco vazio.
- Testes automatizados com o test runner nativo do Node.js.
- CI no GitHub Actions.

## Stack

- Node.js 22+
- HTTP nativo do Node.js
- `node:sqlite` / SQLite
- HTML renderizado no servidor
- CSS e JavaScript sem frameworks e sem dependencias externas

A escolha de uma stack sem pacotes externos deixa o piloto pequeno, reproduzivel e facil de auditar dentro do proprio repositorio.

## Como executar

```bash
npm start
```

Acesse `http://localhost:3000`.

Para desenvolvimento com reload automatico:

```bash
npm run dev
```

## Testes

```bash
npm test
```

Os testes usam banco em memoria e cobrem criacao, edicao, exclusao, validacao e unicidade de e-mail.

## Estrutura

```text
.github/workflows/ci.yml
public/
  app.js
  styles.css
src/
  app.js
  db.js
  server.js
  validation.js
  views.js
test/
  crud.test.js
data/
  .gitkeep
```

## Banco de dados

O arquivo SQLite e criado automaticamente em:

```text
data/control-system.sqlite
```

Esse arquivo e ignorado pelo Git para evitar versionar dados locais de runtime. A estrutura do banco e criada automaticamente ao iniciar a aplicacao.
