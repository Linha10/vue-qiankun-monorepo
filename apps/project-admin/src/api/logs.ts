import request from './request'
import type {
  GetAccountActionLogs,
  AccountActionLogsResponse,
  LoginLogsParams,
  LoginLogsResponse,
} from '@/types/api-params'

export const logs = {
  // 帳戶操作日誌
  getAccountLogs: (params: GetAccountActionLogs) =>
    request.get<AccountActionLogsResponse>('/v1/account-action-logs', { params }),

  // 帳戶登入登出日誌
  getLoginLogs: (params: LoginLogsParams) => {
    return request.get<LoginLogsResponse>('/v1/auth-login-logs', { params })
  },
}
