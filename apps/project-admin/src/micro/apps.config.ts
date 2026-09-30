import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

export interface MicroAppConfig {
  name: string
  entry: string
  container: string
  activeRule: string
  props?: Record<string, unknown>
}

export const microApps: MicroAppConfig[] = [
  {
    name: 'system-settings',
    // 開發時子應用是獨立跑在 8090 port 的 dev server；
    // 正式環境（Docker 或 GitHub Pages）子應用跟 host 部署在同一個 origin 下的 system-settings/ 子路徑，
    // 用 host 自己的 BASE_URL 推算即可涵蓋「根路徑」跟「GitHub Pages 子路徑」兩種情況
    entry: import.meta.env.DEV ? '//localhost:8090' : `${import.meta.env.BASE_URL}system-settings/`,
    container: '#system-settings-container',
    activeRule: '/system-settings',
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
