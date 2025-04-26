import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from 'kysely';
import { ValidacionCfdiResult } from '../utils/Interfaces';

export interface PersonTable {
    id: Generated<number>;
    name?: string;
    rfc: string;
    created_at?: string;
}

export type Person = Selectable<PersonTable>
export type NewPerson = Insertable<PersonTable>
export type UpdatePerson = Updateable<PersonTable>

export interface EstatusTable {
    id: Generated<number>;
    status: string;
}
export type Estatus = Selectable<EstatusTable>
export type NewEstatus = Insertable<EstatusTable>
export type UpdateEstatus = Updateable<EstatusTable>

export interface EstatusCancelacionTable {
    id: Generated<number>;
    status: string;
}
export type EstatusCancelacion = Selectable<EstatusCancelacionTable>
export type NewEstatusCancelacion = Insertable<EstatusCancelacionTable>
export type UpdateEstatusCancelacion = Updateable<EstatusCancelacionTable>

export interface EsCancelableTable {
    id: Generated<number>;
    cancelable: string;
}
export type EsCancelable = Selectable<EsCancelableTable>
export type NewEsCancelable = Insertable<EsCancelableTable>
export type UpdateEsCancelable = Updateable<EsCancelableTable>

export interface CfdiTable {
    id: Generated<number>;
    uuid?: string;
    emisor_id?: number;
    receptor_id?: number;
    fecha_creacion?: string;
    fecha_timbrado?: string;
    total?: number;
    efecto?: string;
    fe?: string;
    estatus_id?: number;
    estatus_cancelacion_id?: number;
    es_cancelable_id?: number;
    detalle?: JSONColumnType<ValidacionCfdiResult>;
    xml?: string | null;
    ultima_validacion?: string;
    created_at?: ColumnType<Date, string>;
    updated_at?: ColumnType<Date, string, string>;
}

export type Cfdi = Selectable<CfdiTable>
export type NewCfdi = Insertable<CfdiTable>
export type UpdateCfdi = Updateable<CfdiTable>

export interface Database {
    persons: PersonTable;
    estatus: EstatusTable;
    estatus_cancelacion: EstatusCancelacionTable;
    es_cancelable: EsCancelableTable;
    cfdis: CfdiTable;
}
