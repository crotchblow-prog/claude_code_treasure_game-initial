import type { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;

const DB_KEY = 'treasure_db';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function initDb(): Promise<void> {
  // Vite pre-bundles CJS modules; default is the initSqlJs function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import('sql.js');
  const initSqlJs: (config?: object) => Promise<SqlJsStatic> =
    typeof mod.default === 'function' ? mod.default
    : typeof mod === 'function' ? mod
    : mod.initSqlJs ?? mod.Module;

  const SQL = await initSqlJs({
    locateFile: (_file: string) => '/sql-wasm.wasm',
  });

  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    db = new SQL.Database(fromBase64(saved));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      total_score INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      best_score INTEGER DEFAULT 0
    )
  `);

  saveDb();
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  localStorage.setItem(DB_KEY, toBase64(data));
}

export function runQuery(sql: string, params: (string | number)[] = []): void {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
}

export function getRows<T = Record<string, string | number | null>>(
  sql: string,
  params: (string | number)[] = []
): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}
