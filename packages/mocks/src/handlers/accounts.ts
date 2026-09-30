import { http } from 'msw'
import { ok } from '../apiResponse'
import { accountsDb, accountRoleAssignments } from '../data/accounts'

export const accountHandlers = [
  http.get('*/v1/accounts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const search = url.searchParams.get('search') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const result = accountsDb.list({ page, pageSize, keyword: search, status })
    return ok({
      list: result.list,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      },
    })
  }),

  http.post('*/v1/accounts', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const created = accountsDb.create({
      code: `A${String(Date.now()).slice(-6)}`,
      accountName: (body.accountName as string) ?? '',
      email: (body.email as string) ?? '',
      phone: (body.phone as string) ?? '',
      status: (body.status as 0 | 1) ?? 1,
      loginAt: '',
      loginIp: '',
    })
    return ok(created, '新增成功')
  }),

  http.get('*/v1/accounts/:accountId', ({ params }) => {
    const account = accountsDb.getById(String(params.accountId))
    return ok(account ?? null)
  }),

  http.put('*/v1/accounts/:accountId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const updated = accountsDb.update(String(params.accountId), {
      email: body.email as string | undefined,
      phone: body.phone as string | undefined,
      status: body.status as 0 | 1 | undefined,
    })
    return ok(updated ?? null, '更新成功')
  }),

  http.delete('*/v1/accounts/:accountId', ({ params }) => {
    accountsDb.remove(String(params.accountId))
    accountRoleAssignments.delete(String(params.accountId))
    return ok(null, '刪除成功')
  }),

  http.put('*/v1/accounts/:accountId/reset-password', () => ok(null, '密碼已重設')),

  http.get('*/v1/account-roles/:accountId', ({ params }) => {
    const roleIds = accountRoleAssignments.get(String(params.accountId)) ?? []
    return ok({ roleIds })
  }),

  http.put('*/v1/account-roles/:accountId', async ({ params, request }) => {
    const body = (await request.json()) as { roleIds?: number[] }
    accountRoleAssignments.set(String(params.accountId), body.roleIds ?? [])
    return ok(null, '更新成功')
  }),
]
