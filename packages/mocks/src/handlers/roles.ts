import { http } from 'msw'
import { ok } from '../apiResponse'
import { rolesDb, roleMenuAssignments, type RoleRecord } from '../data/roles'

function toRole(record: RoleRecord) {
  return { ...record, id: Number(record.id) }
}

export const roleHandlers = [
  http.get('*/v1/roles', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const search = url.searchParams.get('search') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const result = rolesDb.list({ page, pageSize, keyword: search, status })
    return ok({
      list: result.list.map(toRole),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      },
    })
  }),

  http.post('*/v1/roles', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()
    const created = rolesDb.create({
      roleName: (body.roleName as string) ?? '',
      roleKey: (body.roleKey as string) ?? '',
      sort: Number(body.sort ?? 0),
      status: (body.status as 0 | 1) ?? 1,
      createdAt: now,
      updateAt: now,
    })
    return ok(toRole(created), '新增成功')
  }),

  http.get('*/v1/roles/:roleId', ({ params }) => {
    const record = rolesDb.getById(String(params.roleId))
    if (!record) return ok(null)
    const menuIds = roleMenuAssignments.get(String(params.roleId)) ?? []
    return ok({
      ...toRole(record),
      menus: menuIds.map(id => ({ id })),
    })
  }),

  http.put('*/v1/roles/:roleId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const updated = rolesDb.update(String(params.roleId), {
      roleName: body.roleName as string | undefined,
      roleKey: body.roleKey as string | undefined,
      sort: body.sort as number | undefined,
      status: body.status as 0 | 1 | undefined,
      updateAt: new Date().toISOString(),
    })
    return ok(updated ? toRole(updated) : null, '更新成功')
  }),

  http.delete('*/v1/roles/:roleId', ({ params }) => {
    rolesDb.remove(String(params.roleId))
    roleMenuAssignments.delete(String(params.roleId))
    return ok(null, '刪除成功')
  }),

  // 取得角色可用權限（menu id 清單）
  http.get('*/v1/role-menus/:roleId', ({ params }) => {
    const menuIds = roleMenuAssignments.get(String(params.roleId)) ?? []
    return ok(menuIds)
  }),

  // 更新角色可用權限
  http.put('*/v1/role-menus/:roleId', async ({ params, request }) => {
    const body = (await request.json()) as { menuIds?: number[] }
    roleMenuAssignments.set(String(params.roleId), body.menuIds ?? [])
    return ok(null, '更新成功')
  }),
]
