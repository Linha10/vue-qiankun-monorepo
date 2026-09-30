import { getRequest } from "@/shared/host-context";
import type {
  GetAccountActionLogs,
  AccountActionLogsResponse,
  LoginLogsParams,
  LoginLogsResponse,
} from "@monorepo/types";

export const logs = {
  // 帳戶操作日誌
  getAccountLogs: (params: GetAccountActionLogs) =>
    getRequest().get<AccountActionLogsResponse>("/v1/account-action-logs", {
      params,
    }),

  // 帳戶登入登出日誌
  getLoginLogs: (params: LoginLogsParams) => {
    return getRequest().get<LoginLogsResponse>("/v1/auth-login-logs", {
      params,
    });
  },
};
