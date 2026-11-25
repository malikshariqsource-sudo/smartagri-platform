import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const file = process.env.DATABASE_PATH || "./data/smartagri.db";
const absolute = path.resolve(file);
fs.mkdirSync(path.dirname(absolute), { recursive: true });
const db = new DatabaseSync(absolute);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS crops (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, variety TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', planted_on TEXT NOT NULL, harvest_on TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Growing', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL, kind TEXT NOT NULL, details TEXT NOT NULL, happened_on TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
export default db;
export type Crop = { id: number; name: string; variety: string; area: string; planted_on: string; harvest_on: string; status: string };
export type Activity = { id: number; kind: string; details: string; happened_on: string; crop_name: string | null };
