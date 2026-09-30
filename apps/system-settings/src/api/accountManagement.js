import { getRequest } from "@/shared/host-context";
export const accManagementApi = {
    // 取得帳號列表
    getAccountList: (accountListParams) => getRequest().get("/v1/accounts", {
        params: accountListParams,
    }),
    // 建立新帳號(免captcha)
    // password要轉base64
    createAccount: (accountParams) => getRequest().post("/v1/accounts", accountParams),
    // 取得帳號設定
    getAccountInfo: (accountId) => getRequest().get(`/v1/accounts/${accountId}`),
    // 更新帳號設定
    // password要轉base64
    updateAcoount: (accountId, data) => getRequest().put(`/v1/accounts/${accountId}`, data),
    // 刪除指定帳號
    deleteAccount: (accountId) => getRequest().delete(`/v1/accounts/${accountId}`),
    // 重設密碼
    resetAccountPassword: (accountId, newPassword) => getRequest().put(`/v1/accounts/${accountId}/reset-password`, {
        password: newPassword,
    }),
    // 取得帳號擁有角色
    getAccountRoles: (accountId) => {
        return getRequest().get(`/v1/account-roles/${accountId}`);
    },
    // 更新帳號角色
    updateAccountRoles: (params) => {
        return getRequest().put(`/v1/account-roles/${params.accountId}`, {
            roleIds: params.roleIds,
        });
    },
};
