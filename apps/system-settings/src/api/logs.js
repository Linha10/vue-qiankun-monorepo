import { getRequest } from "@/shared/host-context";
export const logs = {
    // 帳戶操作日誌
    getAccountLogs: (params) => getRequest().get("/v1/account-action-logs", {
        params,
    }),
    // 帳戶登入登出日誌
    getLoginLogs: (params) => {
        return getRequest().get("/v1/auth-login-logs", {
            params,
        });
    },
};
