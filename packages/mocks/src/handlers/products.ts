import { http } from 'msw'
import { ok } from '../apiResponse'
import { productsDb } from '../data/products'

function toPagination(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export const productHandlers = [
  http.get('*/v1/products', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const keyword = url.searchParams.get('keyword') ?? undefined
    const category = url.searchParams.get('category') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const result = productsDb.list({ page, pageSize, keyword, category, status })
    return ok({ list: result.list, pagination: toPagination(page, pageSize, result.total) })
  }),

  http.post('*/v1/products', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const created = productsDb.create({
      name: (body.name as string) ?? '',
      category: (body.category as string) ?? '',
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      status: (body.status as 0 | 1) ?? 1,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    return ok(created, '新增成功')
  }),

  http.put('*/v1/products/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const updated = productsDb.update(String(params.id), {
      name: body.name as string | undefined,
      category: body.category as string | undefined,
      price: body.price as number | undefined,
      stock: body.stock as number | undefined,
      status: body.status as 0 | 1 | undefined,
    })
    return ok(updated ?? null, '更新成功')
  }),

  http.delete('*/v1/products/:id', ({ params }) => {
    productsDb.remove(String(params.id))
    return ok(null, '刪除成功')
  }),
]
