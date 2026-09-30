import { createApp, ref } from 'vue'
import ElementPlus from 'element-plus'
import { I18N_KEY, PERMISSION_KEY, createPermissionChecker } from '@monorepo/composables'
import App from './App.vue'
import { startMicroApps } from './qiankun'

const app = createApp(App)
app.use(ElementPlus)

// 這個 app 自己的根部 provide：實務上把下面的假資料換成 useAppStore() / useAuthStore()
// 換好之後，這個專案裡任何用到 @monorepo/ui-kit 或 @monorepo/composables 的元件
// （例如 HcDialog 用到的 useI18n()）都不用再改，一次接好、全部生效
app.provide(I18N_KEY, {
  $t: (key: string) => key, // 換成 useAppStore().$t
  locale: ref('zh'), // 換成 useAppStore().locale
  setLocale: () => {}, // 換成 useAppStore().setLocale
})
app.provide(PERMISSION_KEY, createPermissionChecker(ref([]), ref('admin')))
// 實務上換成：createPermissionChecker(computed(() => appStore.accountMenus), computed(() => authStore.role))

app.mount('#app')

startMicroApps()
