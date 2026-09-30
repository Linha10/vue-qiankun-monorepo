export interface MicroAppConfig {
  name: string
  entry: string
  container: string
  activeRule: string
  props?: Record<string, unknown>
}

// 提醒：這份清單只屬於「main-app 這個專案自己」要載入哪些子應用。
// 如果你把舊專案改成扮演主應用角色，那個舊專案要自己有一份類似的清單，
// 不是共用同一份檔案（各自的 baseURL / props 通常也不一樣）。
export const microApps: MicroAppConfig[] = [
  {
    name: 'sub-app-example',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/sub-app-example',
  },
  {
    name: 'system-settings',
    entry: '//localhost:8090',
    container: '#subapp-container',
    activeRule: '/system-settings',
    props: {
      // 這裡先寫死示範，實務上要換成這個主應用自己 useAuthStore / useAppStore 裡的真實資料
      baseURL: import.meta.env.VITE_API_BASE_URL,
      currentUser: { id: 'demo', name: 'Demo Admin' },
      role: 'admin',
      accountMenus: [], // 實務上換成 authStore 登入後取得的選單樹（跟 stores/app.ts 的 accountMenus 同一份）
      locale: 'zh',
      // 直接把這個主應用自己的 $t / setLocale 傳過去，
      // system-settings 就不用自己管一份語系檔，兩邊文字永遠一致
      $t: (key: string) => key, // 實務上換成 useAppStore().$t
      setLocale: (_locale: string) => {}, // 實務上換成 useAppStore().setLocale
    },
  },
  // {
  //   name: 'legacy-order-system',
  //   entry: '//localhost:8082',
  //   container: '#subapp-container',
  //   activeRule: '/order',
  // },
]
