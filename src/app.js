import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { URL } from 'node:url';
import { createClientRepository } from './db.js';
import { normalizeClient, validateClient } from './validation.js';
import { formView, listView, notFoundView } from './views.js';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', ...headers });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(303, { location });
  res.end();
}

async function readForm(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf8');
  return Object.fromEntries(new URLSearchParams(body));
}

function friendlyMessage(code) {
  return {
    created: 'Cliente cadastrado com sucesso.',
    updated: 'Alteracoes salvas com sucesso.',
    deleted: 'Cliente excluido com sucesso.'
  }[code] || '';
}

function isUniqueEmailError(error) {
  return String(error?.message || '').includes('UNIQUE constraint failed: clients.email');
}

async function serveStatic(req, res, pathname) {
  if (!pathname.startsWith('/styles.css') && !pathname.startsWith('/app.js')) return false;
  const safePath = normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const file = join(process.cwd(), 'public', safePath.replace(/^\//, ''));
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': contentTypes[extname(file)] || 'application/octet-stream',
      'cache-control': 'public, max-age=300'
    });
    res.end(body);
  } catch {
    send(res, 404, 'Not found');
  }
  return true;
}

export function createApp(db) {
  const clients = createClientRepository(db);

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    if (await serveStatic(req, res, pathname)) return;

    if (req.method === 'GET' && pathname === '/') {
      const search = url.searchParams.get('search') || '';
      const status = ['all', 'lead', 'active', 'inactive'].includes(url.searchParams.get('status')) ? url.searchParams.get('status') : 'all';
      const message = friendlyMessage(url.searchParams.get('success'));
      return send(res, 200, listView({ clients: clients.list({ search, status }), stats: clients.stats(), search, status, message }));
    }

    if (req.method === 'GET' && pathname === '/clients/new') {
      return send(res, 200, formView({ client: { status: 'lead' } }));
    }

    if (req.method === 'POST' && pathname === '/clients') {
      const client = normalizeClient(await readForm(req));
      const errors = validateClient(client);
      if (Object.keys(errors).length) return send(res, 422, formView({ client, errors }));
      try {
        clients.create(client);
        return redirect(res, '/?success=created');
      } catch (error) {
        if (isUniqueEmailError(error)) {
          return send(res, 422, formView({ client, errors: { email: 'Ja existe um cliente com este e-mail.' } }));
        }
        throw error;
      }
    }

    const editMatch = pathname.match(/^\/clients\/(\d+)\/edit$/);
    if (req.method === 'GET' && editMatch) {
      const client = clients.findById(Number(editMatch[1]));
      if (!client) return send(res, 404, notFoundView());
      return send(res, 200, formView({ client, mode: 'edit' }));
    }

    const updateMatch = pathname.match(/^\/clients\/(\d+)$/);
    if (req.method === 'POST' && updateMatch) {
      const id = Number(updateMatch[1]);
      const existing = clients.findById(id);
      if (!existing) return send(res, 404, notFoundView());
      const client = { id, ...normalizeClient(await readForm(req)) };
      const errors = validateClient(client);
      if (Object.keys(errors).length) return send(res, 422, formView({ client, errors, mode: 'edit' }));
      try {
        clients.update(id, client);
        return redirect(res, '/?success=updated');
      } catch (error) {
        if (isUniqueEmailError(error)) {
          return send(res, 422, formView({ client, errors: { email: 'Ja existe um cliente com este e-mail.' }, mode: 'edit' }));
        }
        throw error;
      }
    }

    const deleteMatch = pathname.match(/^\/clients\/(\d+)\/delete$/);
    if (req.method === 'POST' && deleteMatch) {
      clients.remove(Number(deleteMatch[1]));
      return redirect(res, '/?success=deleted');
    }

    return send(res, 404, notFoundView());
  };
}
