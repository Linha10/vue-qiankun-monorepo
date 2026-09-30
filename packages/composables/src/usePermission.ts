import { inject, ref } from 'vue'
import { PERMISSION_KEY, type PermissionContext } from './context/keys'

// 沒有人 provide 時預設全部放行，跟原本專案「尚未取得選單資料時預設放行」的精神一致
const fallback: PermissionContext = {
  role: ref('admin'),
  isAdmin: ref(true),
  canAccessMenu: () => true,
  canPerformAction: () => true,
}

export function usePermission(): PermissionContext {
  return inject(PERMISSION_KEY, fallback)
}
