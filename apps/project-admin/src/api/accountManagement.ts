import request from './request'
import type { AccountItem } from '@/types/api-params'

// 帳號的新增／刪除／角色指派等 CRUD 已搬到 system-settings 子應用自己的
// accountManagement.ts（它有獨立的一份同名 API），project-admin 這邊只需要
// 登入後還原使用者資訊時用到的 getAccountInfo，其餘方法已移除。
export const accManagementApi = {
  // 取得帳號設定
  getAccountInfo: (accountId: string) => request.get<AccountItem>(`/v1/accounts/${accountId}`),
}
