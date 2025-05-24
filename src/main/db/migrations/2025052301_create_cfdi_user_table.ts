import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('cfdi_user')
        .ifNotExists()
        .addColumn('cfdi_id', 'integer', (col) => col.notNull())
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addPrimaryKeyConstraint('pk_cfdi_user', ['cfdi_id', 'user_id'])
        .addForeignKeyConstraint('fk_cfdi', ['cfdi_id'], 'cfdis', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('cfdi_user').execute()
}
