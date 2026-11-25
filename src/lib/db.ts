import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const sqliteSchema = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS crops (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, variety TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', planted_on TEXT NOT NULL, harvest_on TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Growing', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL, kind TEXT NOT NULL, details TEXT NOT NULL, happened_on TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`;
const postgresSchema = [
  "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS crops (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, variety TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', planted_on TEXT NOT NULL, harvest_on TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Growing', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS activities (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL, kind TEXT NOT NULL, details TEXT NOT NULL, happened_on TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
];

const databaseUrl = process.env.DATABASE_URL;
const pg = databaseUrl ? postgres(databaseUrl, { ssl: process.env.NODE_ENV === "production" ? "require" : undefined, max: 5 }) : null;
let ready: Promise<void> | null = null;
function ensureReady() {
  if (!ready) ready = (async () => {
    if (pg) { for (const statement of postgresSchema) await pg.unsafe(statement); }
    else {
      const file = process.env.DATABASE_PATH || "./data/smartagri.db";
      const absolute = path.resolve(file);
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      sqlite = new DatabaseSync(absolute);
      sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
      sqlite.exec(sqliteSchema);
    }
  })();
  return ready;
}
let sqlite: DatabaseSync | null = null;

function toPostgres(sql: string) { let n = 0; return sql.replace(/\?/g, () => `$${++n}`); }
const db = {
  prepare(sql: string) {
    return {
      async get(...params: unknown[]) {
        await ensureReady();
        if (pg) { const rows = await pg.unsafe(toPostgres(sql), params as never[]); return rows[0]; }
        return sqlite!.prepare(sql).get(...params as SQLInputValue[]);
      },
      async all(...params: unknown[]) {
        await ensureReady();
        if (pg) return pg.unsafe(toPostgres(sql), params as never[]);
        return sqlite!.prepare(sql).all(...params as SQLInputValue[]);
      },
      async run(...params: unknown[]) {
        await ensureReady();
        if (pg) {
          const insert = /^\s*INSERT\s+INTO\s+(users|crops)\b/i.test(sql) && !/\bRETURNING\b/i.test(sql);
          const rows = await pg.unsafe(`${toPostgres(sql)}${insert ? " RETURNING id" : ""}`, params as never[]);
          return { changes: rows.count, lastInsertRowid: rows[0]?.id ?? 0 };
        }
        return sqlite!.prepare(sql).run(...params as SQLInputValue[]);
      },
    };
  },
};
export default db;
export type Crop = { id: number; name: string; variety: string; area: string; planted_on: string; harvest_on: string; status: string };
export type Activity = { id: number; kind: string; details: string; happened_on: string; crop_name: string | null };
