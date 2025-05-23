import { ElectronAPI } from '@electron-toolkit/preload'
import { ApiErrorDetails, ApiResponse, DataEntry } from '../renderer/src/utils/Interfaces'
import { QrParams, ValidacionCfdiResponse } from '../renderer/src/utils/Types'

declare global {
  interface Window {
    electron: ElectronAPI
    auth: {
      login: (username: string, password: string) => Promise<ApiResponse<void | ApiErrorDetails>>
      logout: () => Promise<void | ApiErrorDetails>
      getUser: () => Promise<any | ApiErrorDetails>
      checkLogin: (empresaId?: number) => Promise<ApiResponse<boolean | ApiErrorDetails>>
    }
    api: {
      get: (endpoint: string, urlParams?: any) => Promise<any>
      post: (endpoint: string, urlParams?: any, data?: any, useAuth?: boolean) => Promise<any>
      put: (endpoint: string, urlParams?: any, data?: any) => Promise<any>
      delete: (endpoint: string, urlParams?: any) => Promise<any>
      uploadFile: (endpoint: string, file: any, data?: any) => Promise<any>
      uploadFileProgress: (endpoint: string, files: any, params?: any, data?: any, onProgress?: any, method?: string) => Promise<any>
      openExternal: (endpoint: string) => Promise<void>
    }
    xml: {
      preProcess: (xmlString: string) => Promise<QrParams | null>
    }
    validationApi: {
      validateBulk: (bulkEntries: QrParams[]) => Promise<ValidacionCfdiResponse>
    }
    db: {
      cfdi: {
        getAll: () => Promise<any[]>
        delete: (id: number) => Promise<void>
        deleteByUuid: (uuid: string) => Promise<void>
        getByUuid: (uuid: string) => Promise<any>
        getByUuids: (uuids: string[]) => Promise<any[]>
      }
    }
    app:{
      getVersion: () => Promise<string>
    }
  }
}
