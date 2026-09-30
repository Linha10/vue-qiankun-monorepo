import request from './request'
import type {
  GetAccountListParams,
  GetAccountListResponse,
  CreateAccountParams,
  AccountItem,
  UpdateAccountParams,
  GetAccountRolesList,
  UpdateAccountRoleParams,
} from '@/types/api-params'

export const accManagementApi = {
  // 取得帳號列表
  getAccountList: (accountListParams: GetAccountListParams) =>
    request.get<GetAccountListResponse>('/v1/accounts', { params: accountListParams }),
  // 建立新帳號(免captcha)
  // password要轉base64
  createAccount: (accountParams: CreateAccountParams) =>
    request.post('/v1/accounts', accountParams),
  // 取得帳號設定
  getAccountInfo: (accountId: string) => request.get<AccountItem>(`/v1/accounts/${accountId}`),
  // 更新帳號設定
  // password要轉base64
  updateAcoount: (accountId: string, data: UpdateAccountParams) =>
    request.put(`/v1/accounts/${accountId}`, data),

  // 刪除指定帳號
  deleteAccount: (accountId: string) => request.delete(`/v1/accounts/${accountId}`),

  // 重設密碼
  resetAccountPassword: (accountId: string, newPassword: string) =>
    request.put(`/v1/accounts/${accountId}/reset-password`, { password: newPassword }),

  // 取得帳號擁有角色
  getAccountRoles: (accountId: string) => {
    return request.get<GetAccountRolesList>(`/v1/account-roles/${accountId}`)
  },

  // 更新帳號角色
  updateAccountRoles: (params: UpdateAccountRoleParams) => {
    const { accountId, ...rest } = params
    return request.put(`/v1/account-roles/${accountId}`, rest)
  },
}
