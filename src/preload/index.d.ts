import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    auth: {
      setToken: (token: string) => Promise<boolean>
      getToken: () => Promise<string | null>
      removeToken: () => Promise<boolean>
    }
  }
}
