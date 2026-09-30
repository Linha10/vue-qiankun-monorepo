import request from './request'

export interface ProductItem {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 0 | 1
  createdAt: string
}

export interface GetProductListParams {
  page: number
  pageSize: number
  keyword?: string
  category?: string
  status?: 0 | 1
}

export interface ProductListResponse {
  list: ProductItem[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export type ProductPayload = Omit<ProductItem, 'id' | 'createdAt'>

export const productApi = {
  getList: (params: GetProductListParams) => {
    return request.get<ProductListResponse>('/v1/products', { params })
  },
  create: (data: ProductPayload) => {
    return request.post('/v1/products', data)
  },
  update: (id: string, data: Partial<ProductPayload>) => {
    return request.put(`/v1/products/${id}`, data)
  },
  delete: (id: string) => {
    return request.delete(`/v1/products/${id}`)
  },
}
