import { getRequest } from "@/shared/host-context";
import type {
  GetAccountListParams,
  GetAccountListResponse,
  CreateAccountParams,
  AccountItem,
  UpdateAccountParams,
  GetAccountRolesList,
  UpdateAccountRoleParams,
} from "@monorepo/types";

export const accManagementApi = {
  // 取得帳號列表
  getAccountList: (accountListParams: GetAccountListParams) =>
    getRequest().get<GetAccountListResponse>("/v1/accounts", {
      params: accountListParams,
    }),
  // 建立新帳號(免captcha)
  // password要轉base64
  createAccount: (accountParams: CreateAccountParams) =>
    getRequest().post("/v1/accounts", accountParams),
  // 取得帳號設定
  getAccountInfo: (accountId: string) =>
    getRequest().get<AccountItem>(`/v1/accounts/${accountId}`),
  // 更新帳號設定
  // password要轉base64
  updateAcoount: (accountId: string, data: UpdateAccountParams) =>
    getRequest().put(`/v1/accounts/${accountId}`, data),

  // 刪除指定帳號
  deleteAccount: (accountId: string) =>
    getRequest().delete(`/v1/accounts/${accountId}`),

  // 重設密碼
  resetAccountPassword: (accountId: string, newPassword: string) =>
    getRequest().put(`/v1/accounts/${accountId}/reset-password`, {
      password: newPassword,
    }),

  // 取得帳號擁有角色
  getAccountRoles: (accountId: string) => {
    return getRequest().get<GetAccountRolesList>(
      `/v1/account-roles/${accountId}`,
    );
  },

  // 更新帳號角色
  updateAccountRoles: (params: UpdateAccountRoleParams) => {
    return getRequest().put(`/v1/account-roles/${params.accountId}`, {
      roleIds: params.roleIds,
    });
  },
};
