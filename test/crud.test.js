import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createDatabase, createClientRepository } from '../src/db.js';
import { createApp } from '../src/app.js';

async function withServer(run) {
  const db = createDatabase(':memory:', { seed: false });
  const server = http.createServer(createApp(db));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await run({ baseUrl: `http://127.0.0.1:${port}`, db });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
}

function form(data) {
  return new URLSearchParams(data).toString();
}

test('home carrega com estado vazio', async () => withServer(async ({ baseUrl }) => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Nenhum cliente encontrado/);
}));

test('CRUD completo de cliente', async () => withServer(async ({ baseUrl, db }) => {
  const repo = createClientRepository(db);

  const created = await fetch(`${baseUrl}/clients`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ name: 'Ana Teste', email: 'ana@teste.com', phone: '44999999999', company: 'Teste SA', status: 'lead', notes: 'Primeiro contato' }),
    redirect: 'manual'
  });
  assert.equal(created.status, 303);
  assert.equal(repo.list().length, 1);

  const client = repo.list()[0];
  const updated = await fetch(`${baseUrl}/clients/${client.id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ name: 'Ana Teste', email: 'ana@teste.com', phone: '44999999999', company: 'Teste SA', status: 'active', notes: 'Cliente ativo' }),
    redirect: 'manual'
  });
  assert.equal(updated.status, 303);
  assert.equal(repo.findById(client.id).status, 'active');

  const deleted = await fetch(`${baseUrl}/clients/${client.id}/delete`, { method: 'POST', redirect: 'manual' });
  assert.equal(deleted.status, 303);
  assert.equal(repo.list().length, 0);
}));

test('validacao bloqueia e-mail invalido', async () => withServer(async ({ baseUrl, db }) => {
  const response = await fetch(`${baseUrl}/clients`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ name: 'Cliente Valido', email: 'email-invalido', status: 'lead' })
  });
  const html = await response.text();
  assert.equal(response.status, 422);
  assert.match(html, /Informe um e-mail valido/);
  assert.equal(createClientRepository(db).list().length, 0);
}));

test('e-mail duplicado retorna feedback de formulario', async () => withServer(async ({ baseUrl, db }) => {
  const repo = createClientRepository(db);
  repo.create({ name: 'Primeiro', email: 'mesmo@teste.com', phone: '', company: '', status: 'lead', notes: '' });
  const response = await fetch(`${baseUrl}/clients`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ name: 'Segundo', email: 'mesmo@teste.com', status: 'active' })
  });
  const html = await response.text();
  assert.equal(response.status, 422);
  assert.match(html, /Ja existe um cliente com este e-mail/);
  assert.equal(repo.list().length, 1);
}));
