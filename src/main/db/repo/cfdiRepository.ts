import { InsertResult, Kysely, UpdateResult } from 'kysely';
import { ApiService } from '../../services/ApiService';
import { DataEntry } from '../../utils/Interfaces';
import { db } from '../client';

export class CfdiRepository {
    private apiService: ApiService;

    private constructor() {
        this.apiService = ApiService.getInstance();
    }

    private static instance: CfdiRepository | null = null;
    public static getInstance(): CfdiRepository {
        if (!CfdiRepository.instance) {
            CfdiRepository.instance = new CfdiRepository();
        }
        return CfdiRepository.instance;
    } async guardarOActualizarCfdi(entry: DataEntry, userId?: number) {
        if (!userId) {
            return;
        }

        if (!entry.qrData || !entry.result?.resultado) return;

        const { qrData, result } = entry;
        const { re: emisorRfc, rr: receptorRfc, id: uuid, tt: total, fe, xml } = qrData;
        const {
            Estado,
            EstatusCancelacion,
            EsCancelable,
            UltimaFechaConsulta,
        } = result.resultado!;

        await db.transaction().execute(async (trx) => {
            // Insertar o buscar estatus
            const estatusId = await this.getOrCreateStatus(Estado, trx);
            const cancelacionId = await this.getOrCreateStatusCancelacion(EstatusCancelacion, trx);
            const cancelableId = await this.getOrCreateCancelable(EsCancelable, trx);

            // Insertar o buscar emisor y receptor
            const emisorId = await this.getOrCreatePerson(emisorRfc, trx);
            const receptorId = await this.getOrCreatePerson(receptorRfc, trx);

            // Verificar si ya existe
            const existente = await trx
                .selectFrom('cfdis')
                .select(['uuid', 'id'])
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
                xml: xml ? xml : null,
                ultima_validacion: UltimaFechaConsulta,
                updated_at: new Date().toISOString(),
            };

            let cfdiId: any;

            if (!existente) {
                const guardados = await trx.insertInto('cfdis').values(valoresComunes).execute();
                cfdiId = guardados[0].insertId;
            } else {
                cfdiId = existente.id;
                await trx.updateTable('cfdis')
                    .set(valoresComunes)
                    .where('uuid', '=', uuid)
                    .execute();
            }

            if (!cfdiId) return;

            // Verifica si ya existe relación user-cfdi
            const relacion = await trx
                .selectFrom('cfdi_user')
                .select('user_id')
                .where('cfdi_id', '=', cfdiId)
                .where('user_id', '=', userId)
                .executeTakeFirst();

            if (!relacion) {
                await trx.insertInto('cfdi_user')
                    .values({
                        cfdi_id: cfdiId,
                        user_id: userId,
                    })
                    .execute();
            }
        });
    }

    private async getOrCreateStatus(value: string, trx: Kysely<any>): Promise<number> {
        const [inserted] = await trx
            .insertInto('estatus')
            .values({ 'status': value })
            .onConflict((oc) => oc.column('status').doNothing())
            .returning(['id'])
            .execute();

        if (inserted?.id) return inserted.id;

        const found = await trx
            .selectFrom('estatus')
            .select('id')
            .where('status', '=', value)
            .executeTakeFirstOrThrow();

        return found.id;
    }

    private async getOrCreateStatusCancelacion(value: string, trx: Kysely<any>): Promise<number> {
        const [inserted] = await trx
            .insertInto('estatus_cancelacion')
            .values({ 'status': value })
            .onConflict((oc) => oc.column('status').doNothing())
            .returning(['id'])
            .execute();

        if (inserted?.id) return inserted.id;

        const found = await trx
            .selectFrom('estatus_cancelacion')
            .select('id')
            .where('status', '=', value)
            .executeTakeFirstOrThrow();

        return found.id;
    }

    private async getOrCreateCancelable(value: string, trx: Kysely<any>): Promise<number> {
        const [inserted] = await trx
            .insertInto('es_cancelable')
            .values({ 'cancelable': value })
            .onConflict((oc) => oc.column('cancelable').doNothing())
            .returning(['id'])
            .execute();

        if (inserted?.id) return inserted.id;

        const found = await trx
            .selectFrom('es_cancelable')
            .select('id')
            .where('cancelable', '=', value)
            .executeTakeFirstOrThrow();

        return found.id;
    }

    private async getOrCreatePerson(rfc: string, trx: Kysely<any>): Promise<number> {
        const [inserted] = await trx
            .insertInto('persons')
            .values({ rfc })
            .onConflict((oc) => oc.column('rfc').doNothing())
            .returning(['id'])
            .execute();

        if (inserted?.id) return inserted.id;

        const found = await trx
            .selectFrom('persons')
            .select(['id'])
            .where('rfc', '=', rfc)
            .executeTakeFirstOrThrow();

        return found.id;
    } async eliminarCfdi(id: number, userId: number): Promise<void> {
        if (!userId) {
            return;
        }

        // Eliminar la relación entre el CFDI y el usuario
        await db.deleteFrom('cfdi_user').where('cfdi_id', '=', id).where('user_id', '=', userId).execute();
    } async eliminarCfdiByUuid(uuid: string, userId: number): Promise<void> {
        // Eliminar la relación entre el CFDI y el usuario
        if (!userId) {
            return;
        }

        const cfdi = await db.selectFrom('cfdis').where('uuid', '=', uuid)
            .select(['id', 'uuid']).executeTakeFirst();
        if (!cfdi) {
            return;
        }
        await db.deleteFrom('cfdi_user').where('cfdi_id', '=', cfdi.id).where('user_id', '=', userId).execute();
    } async obtenerCfdis(userId: number): Promise<any[]> {
        if (!userId) {
            return [];
        }

        return await db
            .selectFrom('cfdis')
            .innerJoin('cfdi_user', 'cfdis.id', 'cfdi_user.cfdi_id')
            .leftJoin('persons as emisor', 'cfdis.emisor_id', 'emisor.id')
            .leftJoin('persons as receptor', 'cfdis.receptor_id', 'receptor.id')
            .leftJoin('estatus', 'cfdis.estatus_id', 'estatus.id')
            .leftJoin('estatus_cancelacion', 'cfdis.estatus_cancelacion_id', 'estatus_cancelacion.id')
            .leftJoin('es_cancelable', 'cfdis.es_cancelable_id', 'es_cancelable.id')
            .where('cfdi_user.user_id', '=', userId)
            .select([
                'cfdis.id',
                'cfdis.uuid',
                'cfdis.emisor_id',
                'cfdis.receptor_id',
                'cfdis.total',
                'cfdis.fe',
                'cfdis.estatus_id',
                'cfdis.estatus_cancelacion_id',
                'cfdis.es_cancelable_id',
                'cfdis.detalle',
                'cfdis.ultima_validacion',
                'cfdis.updated_at',
                'emisor.name as emisor_name',
                'emisor.rfc as emisor_rfc',
                'receptor.name as receptor_name',
                'receptor.rfc as receptor_rfc',
                'estatus.status as status',
                'estatus_cancelacion.status as cancel_status',
                'es_cancelable.cancelable as cancelable'
            ])
            .orderBy('cfdis.updated_at', 'desc')
            .execute();
    } async obtenerCfdiByUuid(uuid: string, userId: number): Promise<any> {
        if (!userId) {
            return null;
        }

        return await db
            .selectFrom('cfdis')
            .innerJoin('cfdi_user', 'cfdis.id', 'cfdi_user.cfdi_id')
            .leftJoin('persons as emisor', 'cfdis.emisor_id', 'emisor.id')
            .leftJoin('persons as receptor', 'cfdis.receptor_id', 'receptor.id')
            .leftJoin('estatus', 'cfdis.estatus_id', 'estatus.id')
            .leftJoin('estatus_cancelacion', 'cfdis.estatus_cancelacion_id', 'estatus_cancelacion.id')
            .leftJoin('es_cancelable', 'cfdis.es_cancelable_id', 'es_cancelable.id')
            .where('cfdi_user.user_id', '=', userId)
            .select([
                'cfdis.id',
                'cfdis.uuid',
                'cfdis.emisor_id',
                'cfdis.receptor_id',
                'cfdis.total',
                'cfdis.fe',
                'cfdis.estatus_id',
                'cfdis.estatus_cancelacion_id',
                'cfdis.es_cancelable_id',
                'cfdis.detalle',
                'cfdis.ultima_validacion',
                'cfdis.updated_at',
                'emisor.name as emisor_name',
                'emisor.rfc as emisor_rfc',
                'receptor.name as receptor_name',
                'receptor.rfc as receptor_rfc',
                'estatus.status as status',
                'estatus_cancelacion.status as cancel_status',
                'es_cancelable.cancelable as cancelable'
            ])
            .where('uuid', '=', uuid)
            .executeTakeFirst();
    } async obtenerCfdisByUuid(uuids: string[], userId: number): Promise<any[]> {
        if (!userId) {
            return [];
        }

        return await db
            .selectFrom('cfdis')
            .innerJoin('cfdi_user', 'cfdis.id', 'cfdi_user.cfdi_id')
            .leftJoin('persons as emisor', 'cfdis.emisor_id', 'emisor.id')
            .leftJoin('persons as receptor', 'cfdis.receptor_id', 'receptor.id')
            .leftJoin('estatus', 'cfdis.estatus_id', 'estatus.id')
            .leftJoin('estatus_cancelacion', 'cfdis.estatus_cancelacion_id', 'estatus_cancelacion.id')
            .leftJoin('es_cancelable', 'cfdis.es_cancelable_id', 'es_cancelable.id')
            .where('cfdi_user.user_id', '=', userId)
            .select([
                'cfdis.id',
                'cfdis.uuid',
                'cfdis.emisor_id',
                'cfdis.receptor_id',
                'cfdis.total',
                'cfdis.fe',
                'cfdis.estatus_id',
                'cfdis.estatus_cancelacion_id',
                'cfdis.es_cancelable_id',
                'cfdis.detalle',
                'cfdis.ultima_validacion',
                'cfdis.updated_at',
                'emisor.name as emisor_name',
                'emisor.rfc as emisor_rfc',
                'receptor.name as receptor_name',
                'receptor.rfc as receptor_rfc',
                'estatus.status as status',
                'estatus_cancelacion.status as cancel_status',
                'es_cancelable.cancelable as cancelable'
            ])
            .where('cfdis.uuid', 'in', uuids)
            .execute();
    }
}