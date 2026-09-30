import { getRequest } from "@/shared/host-context";
export const AccountRole = {
    getRoleList: (params) => getRequest().get("/v1/roles", { params }),
    createRole: (data) => getRequest().post("/v1/roles", data),
    getSpecificRole: (roleId) => {
        return getRequest().get(`/v1/roles/${roleId}`);
    },
    updateSpecificRole: (params) => {
        const { roleId, ...rest } = params;
        return getRequest().put(`/v1/roles/${roleId}`, rest);
    },
    deleteSpecificRole: (roleId) => getRequest().delete(`/v1/roles/${roleId}`),
    // 取得指定角色下的可用權限
    getRoleMenu: (roleId) => {
        return getRequest().get(`/v1/role-menus/${roleId}`);
    },
    // 更新角色可用權限
    updateRoleMenu: (params) => {
        const { roleId, ...rest } = params;
        return getRequest().put(`/v1/role-menus/${roleId}`, rest);
    },
    getMenuList: (params) => {
        return getRequest().get("/v1/menus", { params });
    },
    // 建立頁面權限
    createMenu: (params) => {
        return getRequest().post("/v1/menus", params);
    },
    // 取得可用權限by Account
    getAccountMenuTree: (params) => {
        return getRequest().get("/v1/menus/account-tree", {
            params,
        });
    },
    // 取得可用權限by Role
    // roleIds: '1,2,3'
    getRoleMenuTree: (params) => {
        return getRequest().get("/v1/menus/role-tree", {
            params,
        });
    },
    // 取得樹狀選單資料結構 treeId作為節點rootId開始生成
    getMenuTree: (params) => {
        return getRequest().get("/v1/menus/tree", { params });
    },
    // 取得指定權限內容
    getSpecificMenu: (menuId) => {
        return getRequest().get(`/v1/menus/${menuId}`);
    },
    // 更新權限內容
    updateMenu: (params) => {
        const { menuId, ...rest } = params;
        return getRequest().put(`/v1/menus/${menuId}`, rest);
    },
    // 移除權限內容
    deleteMenu: (menuId) => {
        return getRequest().delete(`/v1/menus/${menuId}`);
    },
};
