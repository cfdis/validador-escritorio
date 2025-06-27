import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey()) // No autoincrement, usa el ID del API
        .addColumn('email', 'varchar', (col) => col.notNull().unique())
        .addColumn('last_sync', 'text') // Fecha de última sincronización
        .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute()
}
