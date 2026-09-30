import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { accManagementApi } from '@/api/accountManagement'
import { AccountRole } from '@/api/role'
import { useAppStore } from '@/stores/app'
import { permission } from '@/api/permission'
import { flattenMenuTree } from '@monorepo/utils'
import type { LoginParams } from '@/types/api-params'

const STORAGE_KEY_TOKEN = 'token'
const STORAGE_KEY_REFRESH_TOKEN = 'refreshToken'
const STORAGE_KEY_ACCOUNT_ID = 'accountId'

let initPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const appStore = useAppStore()

  const accessToken = ref<string | null>(localStorage.getItem(STORAGE_KEY_TOKEN))
  const refreshToken = ref<string | null>(localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN))
  const accountId = ref<string | null>(localStorage.getItem(STORAGE_KEY_ACCOUNT_ID))

  const isLoggedIn = computed(() => !!accessToken.value)

  const role = computed<'admin' | 'user'>(() => {
    const id = appStore.userInfo?.id ?? ''
    return permission.admin.includes(id) ? 'admin' : 'user'
  })

  function _saveTokens(access: string, refresh: string, id: string) {
    accessToken.value = access
    refreshToken.value = refresh
    accountId.value = id
    localStorage.setItem(STORAGE_KEY_TOKEN, access)
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refresh)
    localStorage.setItem(STORAGE_KEY_ACCOUNT_ID, id)
  }

  function _clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    accountId.value = null
    initPromise = null
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEY_ACCOUNT_ID)
  }

  // 還原 userInfo 與帳號可用選單，僅執行一次直到登出；失敗不阻斷導覽（401 已由 axios 攔截器處理）
  function ensureSessionInitialized(): Promise<void> {
    if (!accessToken.value || !accountId.value) return Promise.resolve()
    if (!initPromise) {
      const id = accountId.value
      initPromise = (async () => {
        try {
          const [infoRes, menuRes] = await Promise.all([
            accManagementApi.getAccountInfo(id),
            AccountRole.getAccountMenuTree({ accountId: id }),
          ])
          const info = (infoRes as { data?: UserInfo })?.data
          if (info) appStore.setUserInfo(info)
          const menuData = (menuRes as { data?: unknown })?.data
          appStore.setAccountMenus(flattenMenuTree(menuData))
        } catch {
          // 取得失敗（含 401 重試失敗）不阻斷導覽，交由既有錯誤處理流程
        }
      })()
    }
    return initPromise
  }

  async function login(params: LoginParams) {
    try {
      const res = await authApi.login(params)
      const { accessToken: access, refreshToken: refresh, user } = res.data
      _saveTokens(access, refresh, user.id)
      appStore.setUserInfo(user)
      initPromise = null
      await ensureSessionInitialized()
      ElMessage.success('登入成功')
      router.push('/')
    } catch {
      // 錯誤由 axios 攔截器統一處理
    }
  }

  async function logout() {
    try {
      if (accountId.value && refreshToken.value) {
        await authApi.logout({ accountId: accountId.value, refreshToken: refreshToken.value })
      }
    } catch {
      // 登出 API 失敗仍繼續清除本地狀態
    } finally {
      _clearTokens()
      appStore.clearUserInfo()
      appStore.clearAccountMenus()
      router.push('/login')
    }
  }

  return {
    accessToken,
    refreshToken,
    accountId,
    isLoggedIn,
    role,
    login,
    logout,
    ensureSessionInitialized,
  }
})
