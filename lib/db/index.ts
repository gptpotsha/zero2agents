import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

function resolveDbPath(): string {
  const p = process.env.DATABASE_PATH ?? "./data/app.db";
  return path.isAbsolute(p) ? p : path.join(/*turbopackIgnore: true*/ process.cwd(), p);
}

let _db: BetterSQLite3Database<typeof schema> | undefined;

/** Ленивый синглтон: создаёт файл БД, применяет миграции один раз. */
export function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  _db = db;
  return _db;
}

export { schema };
