import { createMockDb } from '../createMockDb'

// Role.id 在型別上是 number，但共用的 createMockDb 要求 id 為 string，
// 這裡內部用字串儲存，交給 handlers 在組回應時 Number(id) 轉型即可。
export interface RoleRecord {
  id: string
  roleName: string
  roleKey: string
  sort: number
  status: 0 | 1
  createdAt: string
  updateAt: string
}

const now = new Date().toISOString()

const seed: RoleRecord[] = [
  {
    id: '1',
    roleName: '系統管理員',
    roleKey: 'admin',
    sort: 1,
    status: 1,
    createdAt: now,
    updateAt: now,
  },
  {
    id: '2',
    roleName: '一般使用者',
    roleKey: 'user',
    sort: 2,
    status: 1,
    createdAt: now,
    updateAt: now,
  },
  {
    id: '3',
    roleName: '訪客',
    roleKey: 'guest',
    sort: 3,
    status: 0,
    createdAt: now,
    updateAt: now,
  },
]

export const rolesDb = createMockDb<RoleRecord>(seed, {
  idPrefix: 'role',
  keywordFields: ['roleName', 'roleKey'],
  matchFields: ['status'],
})

// roleId(字串) -> 已勾選的選單/按鈕 id 清單
export const roleMenuAssignments = new Map<string, number[]>([
  ['1', [100, 101, 1011, 1012, 1013, 200, 201, 2011, 2012, 2013, 300, 301, 3011, 3012, 3013, 3014, 302, 303, 304, 3041, 3042, 3043]],
  ['2', [100, 101, 200, 201]],
  ['3', [100, 101]],
])
