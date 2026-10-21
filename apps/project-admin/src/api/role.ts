import request from './request'
import type { MenuType, GetMenuTreeResponse } from '@/types/api-params'

// 角色／選單的 CRUD 已搬到 system-settings 子應用自己的 role.ts（它有獨立的一份同名 API），
// project-admin 這邊只需要登入後還原帳號可用選單樹時用到的 getAccountMenuTree，其餘方法已移除。
export const AccountRole = {
  // 取得可用權限by Account
  getAccountMenuTree: (params: { accountId: string; menuType?: MenuType }) => {
    return request.get<GetMenuTreeResponse>('/v1/menus/account-tree', { params })
  },
}
