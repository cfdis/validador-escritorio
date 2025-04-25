import { DataEntry } from '../../utils/Interfaces';
import { db } from '../client';

export async function guardarOActualizarCfdi(entry: DataEntry) {
    if (!entry.qrData || !entry.result?.resultado) return;

    const { qrData, result } = entry;
    const { re: emisorRfc, rr: receptorRfc, id: uuid, tt: total, fe } = qrData;
    const {
        Estado,
        EstatusCancelacion,
        EsCancelable,
        UltimaFechaConsulta,
    } = result.resultado!;

    // Insertar o buscar estatus
    const estatusId = await getOrCreateStatus(Estado);
    const cancelacionId = await getOrCreateStatusCancelacion(EstatusCancelacion);
    const cancelableId = await getOrCreateCancelable(EsCancelable);

    // Insertar o buscar emisor y receptor
    const emisorId = await getOrCreatePerson(emisorRfc);
    const receptorId = await getOrCreatePerson(receptorRfc);

    // Verificar si ya existe
    const existente = await db
        .selectFrom('cfdis')
        .select(['uuid'])
        .where('uuid', '=', uuid)
        .executeTakeFirst();

    const valoresComunes = {
        uuid,
        emisor_id: emisorId,
        receptor_id: receptorId,
        total: parseFloat(total),
        fe,
        estatus_id: estatusId,
        estatus_cancelacion_id: cancelacionId,
        es_cancelable_id: cancelableId,
        detalle: result.resultado ? JSON.stringify(result.resultado) : '{}',
        ultima_validacion: UltimaFechaConsulta,
    };

    if (!existente) {
        await db.insertInto('cfdis').values(valoresComunes).execute();
    } else {
        await db.updateTable('cfdis')
            .set({ ...valoresComunes, updated_at: new Date(), })
            .where('uuid', '=', uuid)
            .execute();
    }
}

async function getOrCreateStatus(value: string): Promise<number> {
    const [inserted] = await db
        .insertInto('estatus')
        .values({ 'status': value })
        .onConflict((oc) => oc.column('status').doNothing())
        .returning(['id'])
        .execute();

    if (inserted?.id) return inserted.id;

    const found = await db
        .selectFrom('estatus')
        .select('id')
        .where('status', '=', value)
        .executeTakeFirstOrThrow();

    return found.id;
}
async function getOrCreateStatusCancelacion(value: string): Promise<number> {
    const [inserted] = await db
        .insertInto('estatus_cancelacion')
        .values({ 'status': value })
        .onConflict((oc) => oc.column('status').doNothing())
        .returning(['id'])
        .execute();

    if (inserted?.id) return inserted.id;

    const found = await db
        .selectFrom('estatus_cancelacion')
        .select('id')
        .where('status', '=', value)
        .executeTakeFirstOrThrow();

    return found.id;
}

async function getOrCreateCancelable(value: string): Promise<number> {
    const [inserted] = await db
        .insertInto('es_cancelable')
        .values({ 'cancelable': value })
        .onConflict((oc) => oc.column('cancelable').doNothing())
        .returning(['id'])
        .execute();

    if (inserted?.id) return inserted.id;

    const found = await db
        .selectFrom('es_cancelable')
        .select('id')
        .where('cancelable', '=', value)
        .executeTakeFirstOrThrow();

    return found.id;
}

async function getOrCreatePerson(rfc: string): Promise<number> {
    const [inserted] = await db
        .insertInto('persons')
        .values({ rfc })
        .onConflict((oc) => oc.column('rfc').doNothing())
        .returning(['id'])
        .execute();

    if (inserted?.id) return inserted.id;

    const found = await db
        .selectFrom('persons')
        .select(['id'])
        .where('rfc', '=', rfc)
        .executeTakeFirstOrThrow();

    return found.id;
}

export async function eliminarCfdi(uuid: string): Promise<void> {
    await db.deleteFrom('cfdis').where('uuid', '=', uuid).execute();
}

export async function obtenerCfdis(): Promise<any[]> {
    return await db
        .selectFrom('cfdis')
        .selectAll()
        .leftJoin('persons', 'cfdis.emisor_id', 'persons.id')
        .leftJoin('persons', 'cfdis.receptor_id', 'persons.id')
        .leftJoin('estatus', 'cfdis.estatus_id', 'estatus.id')
        .leftJoin('estatus_cancelacion', 'cfdis.estatus_cancelacion_id', 'estatus_cancelacion.id')
        .leftJoin('es_cancelable', 'cfdis.es_cancelable_id', 'es_cancelable.id')
        .orderBy('cfdis.updated_at', 'desc')
        .execute();
}
