import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('cfdis')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('uuid', 'varchar', (col) => col.unique())
        .addColumn('emisor_id', 'integer')
        .addColumn('receptor_id', 'integer')
        .addColumn('fecha_creacion', 'text')
        .addColumn('fecha_timbrado', 'text')
        .addColumn('total', 'real',)
        .addColumn('efecto', 'varchar')
        .addColumn('fe', 'varchar')
        .addColumn('estatus_id', 'integer')
        .addColumn('estatus_cancelacion_id', 'integer')
        .addColumn('es_cancelable_id', 'integer')
        .addColumn('detalle', 'json')
        .addColumn('ultima_validacion', 'datetime')
        .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        // FK constraints
        .addForeignKeyConstraint('fk_emisor', ['emisor_id'], 'persons', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .addForeignKeyConstraint('fk_receptor', ['receptor_id'], 'persons', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .addForeignKeyConstraint('fk_estatus', ['estatus_id'], 'estatus', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .addForeignKeyConstraint('fk_estatus_cancelacion', ['estatus_cancelacion_id'], 'estatus_cancelacion', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .addForeignKeyConstraint('fk_es_cancelable', ['es_cancelable_id'], 'es_cancelable', ['id'], (cb) => cb.onDelete('cascade').onUpdate('cascade'))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('cfdis').execute();
}
