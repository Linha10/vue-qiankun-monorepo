import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export interface StartMockWorkerOptions {
  /** mockServiceWorker.js 的路徑，預設 '/mockServiceWorker.js'。
   *  部署到 GitHub Pages 子路徑時，需傳入例如 '/vue-qiankun-monorepo/mockServiceWorker.js'。 */
  serviceWorkerUrl?: string
}

let startPromise: Promise<void> | null = null

/** 啟動 MSW，同一個分頁只會真的啟動一次（qiankun 環境下避免host/子應用重複啟動）。 */
export function startMockWorker(options: StartMockWorkerOptions = {}): Promise<void> {
  if (!startPromise) {
    startPromise = worker
      .start({
        onUnhandledRequest: 'bypass',
        serviceWorker: options.serviceWorkerUrl ? { url: options.serviceWorkerUrl } : undefined,
      })
      .then(() => undefined)
  }
  return startPromise
}
