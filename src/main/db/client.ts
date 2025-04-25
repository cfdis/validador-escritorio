import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Database as DB } from './schema';

const dialect = new SqliteDialect({
  database: new Database('validador.db'),
});

export const db = new Kysely<DB>({
  dialect,
});