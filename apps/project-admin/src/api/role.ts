import request from './request'
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
} from '@/types/api-params'

export const AccountRole = {
  getRoleList: (params: RoleListParams) => request.get<RoleListResponse>('/v1/roles', { params }),

  createRole: (data: CreateRole) => request.post('/v1/roles', data),

  getSpecificRole: (roleId: string) => {
    return request.get<SpecificRoleResponse>(`/v1/roles/${roleId}`)
  },

  updateSpecificRole: (params: UpdateSpecificRoleParams) => {
    const { roleId, ...rest } = params
    return request.put(`/v1/roles/${roleId}`, rest)
  },

  deleteSpecificRole: (roleId: string) => request.delete(`/v1/roles/${roleId}`),

  // 取得指定角色下的可用權限
  getRoleMenu: (roleId: string) => {
    return request.get<GetRoleMenusResponse>(`/v1/role-menus/${roleId}`)
  },

  // 更新角色可用權限
  updateRoleMenu: (params: UpdateRoleMenuParams) => {
    const { roleId, ...rest } = params
    return request.put(`/v1/role-menus/${roleId}`, rest)
  },

  getMenuList: (params: GetMenuListParams) => {
    return request.get<GetMenuListResponse>('/v1/menus', { params })
  },

  // 建立頁面權限
  createMenu: (params: CreateMenuParams) => {
    return request.post('/v1/menus', params)
  },

  // 取得可用權限by Account
  getAccountMenuTree: (params: { accountId: string; menuType?: MenuType }) => {
    return request.get<GetMenuTreeResponse>('/v1/menus/account-tree', { params })
  },

  // 取得可用權限by Role
  // roleIds: '1,2,3'
  getRoleMenuTree: (params: { roleIds: string; menuType?: MenuType }) => {
    return request.get<GetMenuTreeResponse>('/v1/menus/role-tree', { params })
  },

  // 取得樹狀選單資料結構 treeId作為節點rootId開始生成
  getMenuTree: (params: { treeId?: string; status?: 0 | 1; menuType?: MenuType }) => {
    return request.get<GetMenuTreeResponse>('/v1/menus/tree', { params })
  },

  // 取得指定權限內容
  getSpecificMenu: (menuId: string) => {
    return request.get<Menu>(`/v1/menus/${menuId}`)
  },

  // 更新權限內容
  updateMenu: (params: UpdateMenuParams) => {
    const { menuId, ...rest } = params
    return request.put(`/v1/menus/${menuId}`, rest)
  },

  // 移除權限內容
  deleteMenu: (menuId: string) => {
    return request.delete(`/v1/menus/${menuId}`)
  },
}
