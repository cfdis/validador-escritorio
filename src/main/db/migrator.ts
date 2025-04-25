// migrator.ts
import { Migrator, FileMigrationProvider, Kysely } from 'kysely';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Database } from './schema';
import { db } from './client'; // Tu instancia de conexión de Kysely

export async function migrateDatabase() {
    const migrator = new Migrator({
        db: db as Kysely<Database>,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        console.log(`Migration "${it.migrationName}" was ${it.status}`);
    });

    if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
