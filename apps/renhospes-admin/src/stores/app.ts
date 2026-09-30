import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { zh } from '../locales/zh'
import { en } from '../locales/en'
import type { PermissionNode } from '@monorepo/types'

type Locale = 'zh' | 'en'

const messages: Record<Locale, any> = { zh, en }

export const useAppStore = defineStore('app', () => {
  // 側邊欄收合狀態
  const isSidebarCollapsed = ref(false)
  // 目前登入的使用者資訊
  const userInfo = ref<UserInfo | null>(null)
  // 目前帳號可用的選單樹（供路由權限守衛比對）
  const accountMenus = ref<PermissionNode[]>([])
  // 全域 loading 狀態
  const isGlobalLoading = ref(false)
  // 目前語言設定
  const locale = ref<Locale>('zh')

  const isLoggedIn = computed(() => !!userInfo.value)

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function clearUserInfo() {
    userInfo.value = null
    localStorage.removeItem('token')
  }

  function setAccountMenus(menus: PermissionNode[]) {
    accountMenus.value = menus
  }

  function clearAccountMenus() {
    accountMenus.value = []
  }

  // 尚未取得選單資料時預設放行，避免初始化完成前整批頁面被誤擋
  // 僅 create/edit 這類子路由可沿用列表頁權限，避免手足選單因共用路徑前綴而被誤判（如帳號操作日誌 vs 登入登出日誌）
  const SUB_ACTION_SEGMENTS = ['create', 'edit']

  function canAccessPath(path: string): boolean {
    if (accountMenus.value.length === 0) return true
    return accountMenus.value.some(menu => {
      if ((menu.menuType !== 'DIR' && menu.menuType !== 'MENU') || menu.status === 0 || !menu.url) {
        return false
      }
      if (path === menu.url) return true
      if (!path.startsWith(`${menu.url}/`)) return false
      const nextSegment = path.slice(menu.url.length + 1).split('/')[0]
      return SUB_ACTION_SEGMENTS.includes(nextSegment)
    })
  }

  // 尚未取得選單資料時預設放行，避免初始化完成前按鈕/路由被誤擋
  function canPerformAction(url: string, action: 'create' | 'update' | 'delete'): boolean {
    if (accountMenus.value.length === 0) return true
    const menu = accountMenus.value.find(
      m => (m.menuType === 'DIR' || m.menuType === 'MENU') && m.status !== 0 && m.url === url
    )
    if (!menu) return false
    return accountMenus.value.some(
      btn =>
        btn.menuType === 'BTN' &&
        btn.parentId === menu.id &&
        btn.action === action &&
        btn.status !== 0
    )
  }

  /**
   * 翻譯函數 - 根據 key 查詢翻譯文本，支持參數插值
   * @param key - 點符號分隔的翻譯 key（如 'common.create', 'messages.deleteConfirm'）
   * @param params - 可選的參數對象，用於替換翻譯文本中的佔位符
   * @returns 翻譯後的文本
   */
  function $t(key: string, params?: Record<string, string>): string {
    const currentMessages = messages[locale.value]
    const keys = key.split('.')

    let value: any = currentMessages
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    // 如果沒有參數，直接返回翻譯文本
    if (!params || typeof value !== 'string') {
      return value as string
    }

    // 替換參數（支持 {name}, {type} 等格式）
    let result = value
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
    }
    return result
  }

  /**
   * 設定語言
   * @param newLocale - 要設定的語言代碼
   */
  function setLocale(newLocale: Locale) {
    if (messages[newLocale]) {
      locale.value = newLocale
    }
  }

  return {
    isSidebarCollapsed,
    userInfo,
    accountMenus,
    isGlobalLoading,
    isLoggedIn,
    locale,
    toggleSidebar,
    setUserInfo,
    clearUserInfo,
    setAccountMenus,
    clearAccountMenus,
    canAccessPath,
    canPerformAction,
    $t,
    setLocale,
  }
})
