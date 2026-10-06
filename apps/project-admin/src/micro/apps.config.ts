import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

export interface MicroAppConfig {
  name: string
  entry: string
  container: string
  activeRule: string
  props?: Record<string, unknown>
}

// qiankun 的 activeRule 字串是拿去跟瀏覽器「完整」的 location.pathname 做 startsWith 比對，
// 不會自動扣掉 host 自己的 BASE_URL（跟 vue-router 的 route.path 不一樣，那個才是已經去除 base 的邏輯路徑）。
// 本機開發、Docker 都部署在網域根目錄所以沒差，但 GitHub Pages 這種有 repo 子路徑
// （例如 /vue-qiankun-monorepo/）的環境，activeRule 沒加上這個前綴就永遠比對不到，
// 子應用會完全掛載不起來。這裡統一用 BASE_URL 組出正確的完整前綴，並清掉重複的斜線。
function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, '/')
}

export const microApps: MicroAppConfig[] = [
  {
    name: 'system-settings',
    // 開發時子應用是獨立跑在 8090 port 的 dev server；
    // 正式環境（Docker 或 GitHub Pages）子應用跟 host 部署在同一個 origin 下的 system-settings/ 子路徑，
    // 用 host 自己的 BASE_URL 推算即可涵蓋「根路徑」跟「GitHub Pages 子路徑」兩種情況
    entry: import.meta.env.DEV ? '//localhost:8090' : `${import.meta.env.BASE_URL}system-settings/`,
    container: '#system-settings-container',
    activeRule: withBase('system-settings'),
    // 用 getter 讓 qiankun 每次掛載（含重新導覽回來）時都讀到當下最新的 store 資料，
    // 而不是這個模組被 import 當下（登入完成前）就凍結住的舊快照
    get props() {
      const appStore = useAppStore()
      const authStore = useAuthStore()
      return {
        baseURL: import.meta.env.VITE_API_BASE_URL,
        currentUser: appStore.userInfo
          ? { id: appStore.userInfo.id, name: appStore.userInfo.accountName }
          : null,
        role: authStore.role,
        accountMenus: appStore.accountMenus,
        locale: appStore.locale,
        $t: appStore.$t,
        setLocale: (locale: string) => appStore.setLocale(locale as 'zh' | 'en'),
      }
    },
  },
]
