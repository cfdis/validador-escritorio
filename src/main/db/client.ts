import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Database as DB } from './schema';
import { join } from 'path';
import { app } from 'electron';

const dbPath = join(app.getPath('userData'), 'validador.db');

const dialect = new SqliteDialect({
  database: new Database(dbPath),
});

export const db = new Kysely<DB>({
  dialect,
});