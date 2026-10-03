import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_DB_PATH = resolve(process.cwd(), 'data', 'control-system.sqlite');

export function createDatabase(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH, { seed = true } = {}) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive')),
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
    CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
    CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
  `);

  if (seed) seedDatabase(db);
  return db;
}

function seedDatabase(db) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM clients').get();
  if (total > 0) return;

  const insert = db.prepare(`
    INSERT INTO clients (name, email, phone, company, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const samples = [
    ['Marina Costa', 'marina@aurora.com', '(44) 99912-3401', 'Aurora Studio', 'active', 'Cliente recorrente. Prefere contato por WhatsApp.'],
    ['Rafael Martins', 'rafael@novavenda.com', '(11) 98845-2100', 'Nova Venda', 'lead', 'Lead qualificado vindo por indicacao.'],
    ['Bianca Souza', 'bianca@cobalto.io', '(41) 99770-8891', 'Cobalto', 'active', 'Contrato renovado recentemente.'],
    ['Thiago Lima', 'thiago@vertice.co', '(43) 99180-1122', 'Vertice Co.', 'inactive', 'Relacionamento pausado no ultimo trimestre.']
  ];

  db.exec('BEGIN');
  try {
    for (const row of samples) insert.run(...row);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function createClientRepository(db) {
  return {
    list({ search = '', status = 'all' } = {}) {
      const term = `%${search.trim()}%`;
      const where = [];
      const params = [];

      if (search.trim()) {
        where.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ?)');
        params.push(term, term, term, term);
      }
      if (status !== 'all') {
        where.push('status = ?');
        params.push(status);
      }

      const sql = `
        SELECT * FROM clients
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY CASE status WHEN 'lead' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, name COLLATE NOCASE ASC
      `;
      return db.prepare(sql).all(...params);
    },

    findById(id) {
      return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) || null;
    },

    create(data) {
      const result = db.prepare(`
        INSERT INTO clients (name, email, phone, company, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.name, data.email, data.phone, data.company, data.status, data.notes);
      return this.findById(result.lastInsertRowid);
    },

    update(id, data) {
      const result = db.prepare(`
        UPDATE clients
        SET name = ?, email = ?, phone = ?, company = ?, status = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(data.name, data.email, data.phone, data.company, data.status, data.notes, id);
      return result.changes ? this.findById(id) : null;
    },

    remove(id) {
      return db.prepare('DELETE FROM clients WHERE id = ?').run(id).changes > 0;
    },

    stats() {
      return db.prepare(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) AS leads,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive
        FROM clients
      `).get();
    }
  };
}
