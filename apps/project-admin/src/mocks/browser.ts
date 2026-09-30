import { startMockWorker } from '@monorepo/mocks/browser'

// BASE_URL 會依 vite.config.ts 的 base 設定變化（本機 '/'，GitHub Pages 則是 repo 子路徑），
// mockServiceWorker.js 一定跟著 public/ 一起部署在同一個 base 下。
export function startProjectAdminMocks(): Promise<void> {
  return startMockWorker({ serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js` })
}
