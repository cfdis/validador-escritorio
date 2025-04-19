import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const authApi = {
  login: (username: string, password: string) => ipcRenderer.invoke('auth:login', { username, password }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  checkLogin: (empresaId?: number) => ipcRenderer.invoke('auth:checkLogin', empresaId)
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
    ipcRenderer.invoke('api:uploadFileProgress', { endpoint, files, params, data, onProgress, method })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('auth', authApi)
    contextBridge.exposeInMainWorld('api', api)
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
}
