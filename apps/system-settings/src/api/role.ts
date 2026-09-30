import { getRequest } from "@/shared/host-context";
import type {
  RoleListParams,
  RoleListResponse,
  CreateRole,
  SpecificRoleResponse,
  UpdateSpecificRoleParams,
  GetRoleMenusResponse,
  UpdateRoleMenuParams,
  GetMenuListParams,
  GetMenuListResponse,
  CreateMenuParams,
  MenuType,
  GetMenuTreeResponse,
  Menu,
  UpdateMenuParams,
} from "@monorepo/types";

export const AccountRole = {
  getRoleList: (params: RoleListParams) =>
    getRequest().get<RoleListResponse>("/v1/roles", { params }),

  createRole: (data: CreateRole) => getRequest().post("/v1/roles", data),

  getSpecificRole: (roleId: string) => {
    return getRequest().get<SpecificRoleResponse>(`/v1/roles/${roleId}`);
  },

  updateSpecificRole: (params: UpdateSpecificRoleParams) => {
    const { roleId, ...rest } = params;
    return getRequest().put(`/v1/roles/${roleId}`, rest);
  },

  deleteSpecificRole: (roleId: string) =>
    getRequest().delete(`/v1/roles/${roleId}`),

  // 取得指定角色下的可用權限
  getRoleMenu: (roleId: string) => {
    return getRequest().get<GetRoleMenusResponse>(`/v1/role-menus/${roleId}`);
  },

  // 更新角色可用權限
  updateRoleMenu: (params: UpdateRoleMenuParams) => {
    const { roleId, ...rest } = params;
    return getRequest().put(`/v1/role-menus/${roleId}`, rest);
  },

  getMenuList: (params: GetMenuListParams) => {
    return getRequest().get<GetMenuListResponse>("/v1/menus", { params });
  },

  // 建立頁面權限
  createMenu: (params: CreateMenuParams) => {
    return getRequest().post("/v1/menus", params);
  },

  // 取得可用權限by Account
  getAccountMenuTree: (params: { accountId: string; menuType?: MenuType }) => {
    return getRequest().get<GetMenuTreeResponse>("/v1/menus/account-tree", {
      params,
    });
  },

  // 取得可用權限by Role
  // roleIds: '1,2,3'
  getRoleMenuTree: (params: { roleIds: string; menuType?: MenuType }) => {
    return getRequest().get<GetMenuTreeResponse>("/v1/menus/role-tree", {
      params,
    });
  },

  // 取得樹狀選單資料結構 treeId作為節點rootId開始生成
  getMenuTree: (params: {
    treeId?: string;
    status?: 0 | 1;
    menuType?: MenuType;
  }) => {
    return getRequest().get<GetMenuTreeResponse>("/v1/menus/tree", { params });
  },

  // 取得指定權限內容
  getSpecificMenu: (menuId: string) => {
    return getRequest().get<Menu>(`/v1/menus/${menuId}`);
  },

  // 更新權限內容
  updateMenu: (params: UpdateMenuParams) => {
    const { menuId, ...rest } = params;
    return getRequest().put(`/v1/menus/${menuId}`, rest);
  },

  // 移除權限內容
  deleteMenu: (menuId: string) => {
    return getRequest().delete(`/v1/menus/${menuId}`);
  },
};
