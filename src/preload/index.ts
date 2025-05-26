import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { QrParams } from '../main/utils/Interfaces'
import { get } from 'http'

// Custom APIs for renderer
const authApi = {
  login: (username: string, password: string, remember: boolean) => ipcRenderer.invoke('auth:login', { username, password, remember }),
  logout: (fullLogout:boolean = true) => ipcRenderer.invoke('auth:logout', fullLogout),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  checkLogin: (empresaId?: number) => ipcRenderer.invoke('auth:checkLogin', empresaId),
  getSavedUsers: () => ipcRenderer.invoke('auth:getSavedUsers'),
  loginDirect: (email: string) => ipcRenderer.invoke('auth:loginDirect', email),
  deleteSavedUser: (email: string) => ipcRenderer.invoke('auth:deleteSavedUser', email)
}

const api = {
  get: (endpoint: string, urlParams?: any) => ipcRenderer.invoke('api:get', { endpoint, params: urlParams }),
  post: (endpoint: string, urlParams?: any, data?: any, useAuth: boolean = true) =>
    ipcRenderer.invoke('api:post', { endpoint, params: urlParams, data, useAuth }),
  put: (endpoint: string, urlParams?: any, data?: any) =>
    ipcRenderer.invoke('api:put', { endpoint, params: urlParams, data }),
  delete: (endpoint: string, urlParams?: any) => ipcRenderer.invoke('api:delete', { endpoint, params: urlParams }),
  uploadFile: (endpoint: string, file: any, data?: any) =>
    ipcRenderer.invoke('api:uploadFile', { endpoint, file, data }),
  uploadFileProgress: (endpoint: string, files: any, params?: any, data?: any, onProgress?: any, method?: string) =>
    ipcRenderer.invoke('api:uploadFileProgress', { endpoint, files, params, data, onProgress, method }),
  openExternal: (endpoint: string) => ipcRenderer.invoke('api:openExternal', endpoint)
}

// Custom XML API for renderer
const xmlApi = {
  preProcess: (xmlString: string) => ipcRenderer.invoke('xml:preProcess', xmlString)
}

const validationApi = {
  validateBulk: (bulkEntries: QrParams[]) => ipcRenderer.invoke('validate:bulk', bulkEntries)
}

const dbApi = {
  cfdi: {
    getAll: () => ipcRenderer.invoke('db:cfdi:getAll'),
    delete: (id: number) => ipcRenderer.invoke('db:cfdi:delete', id),
    deleteByUuid: (uuid: string) => ipcRenderer.invoke('db:cfdi:deleteByUuid', uuid),
    getByUuid: (uuid: string) => ipcRenderer.invoke('db:cfdi:getByUuid', uuid),
    getByUuids: (uuids: string[]) => ipcRenderer.invoke('db:cfdi:getByUuids', uuids)
  }
}

const appApi = {
  getVersion: () => ipcRenderer.invoke('app:version')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('auth', authApi)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('xml', xmlApi)
    contextBridge.exposeInMainWorld('validationApi', validationApi)
    contextBridge.exposeInMainWorld('db', dbApi)
    contextBridge.exposeInMainWorld('app', appApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.auth = authApi
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.xml = xmlApi
  // @ts-ignore (define in dts)
  window.validationApi = validationApi
  // @ts-ignore (define in dts)
  window.db = dbApi
  // @ts-ignore (define in dts)
  window.app = appApi
}
