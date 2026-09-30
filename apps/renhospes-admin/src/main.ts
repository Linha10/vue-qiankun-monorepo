import { createApp, computed, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import router from './router'
import App from './App.vue'
import { startMicroApps } from './qiankun'
import { startRenhospesAdminMocks } from './mocks/browser'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/main.css'
import '@/styles/theme.scss'
import { I18N_KEY, PERMISSION_KEY, createPermissionChecker } from '@monorepo/composables'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30 秒內不重複打同一支 API
      staleTime: 1000 * 30,
      // 失敗最多重試 1 次
      retry: 1,
      // 離開頁面後不重新 fetch
      refetchOnWindowFocus: false,
    },
  },
})
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })

// runWithContext：讓 authStore 內部的 useRouter() 這類 inject-based composable
// 在沒有元件 instance 的情況下（這裡是 main.ts 最外層）也能正確解析
app.runWithContext(() => {
  const appStore = useAppStore()
  const authStore = useAuthStore()

  app.provide(I18N_KEY, {
    // 邊界轉型：I18nContext 用 string 表示比 store 實際的字面量型別寬，store 內部會再驗證合法性
    $t: (key, params) => appStore.$t(key, params as Parameters<typeof appStore.$t>[1]),
    locale: computed(() => appStore.locale), // 保持跟 store 響應同步（唯讀）
    setLocale: locale => appStore.setLocale(locale as Parameters<typeof appStore.setLocale>[0]),
  })
  app.provide(
    PERMISSION_KEY,
    createPermissionChecker(
      computed(() => appStore.accountMenus),
      computed(() => authStore.role)
    )
  )
})

// 這是純前端 demo，沒有真實後端，所有 API（含登入）都由 MSW 攔截處理，
// 必須在 mount 之前啟動，避免初始畫面打出的請求沒被攔截到。
await startRenhospesAdminMocks()

app.mount('#app')
await router.isReady()
await nextTick()

startMicroApps()
