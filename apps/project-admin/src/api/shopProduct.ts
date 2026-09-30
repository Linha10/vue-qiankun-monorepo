import request from './request'
import type {
  ShopProductListParams,
  ShopProductListResponse,
  ShopItem,
  CreateProductImageParams,
  CreateProductImageResponse,
  UpdateProductImageParams,
} from '@/types/api-params'

export const shopProductApi = {
  getProductList: (params: ShopProductListParams) => {
    return request.get<ShopProductListResponse>(`/v1/products`, { params })
  },
  createProduct: (data: FormData) => {
    return request.post(`/v1/products`, data)
  },
  getProductDetail: (productId: string, lang = 'zh') => {
    return request.get<ShopItem>(`/v1/products/${productId}`, { params: { lang } })
  },
  updateProduct: (productId: string, data: FormData) => {
    return request.put(`/v1/products/${productId}`, data)
  },
  updateProductActive: (productId: string, { isActive = false }: { isActive: boolean }) => {
    return request.put(`/v1/products/${productId}/active`, { isActive })
  },
  // ## product-images
  createProductImages: (data: CreateProductImageParams) => {
    const fd = new FormData()
    fd.append('productId', data.productId)
    fd.append('image', data.image)
    if (data.sort !== undefined) fd.append('sort', String(data.sort))
    if (data.status !== undefined) fd.append('status', String(data.status))
    if (data.caption) fd.append('caption', JSON.stringify(data.caption))
    return request.post<CreateProductImageResponse>(`/v1/product-images`, fd)
  },
  getProductImages: (imageId: string) => {
    return request.get(`/v1/product-images/${imageId}`)
  },
  updateProductImages: (imageId: string, data: UpdateProductImageParams) => {
    const fd = new FormData()
    fd.append('id', data.id)
    if (data.image) fd.append('image', data.image)
    if (data.sort !== undefined) fd.append('sort', String(data.sort))
    if (data.status !== undefined) fd.append('status', String(data.status))
    if (data.caption) fd.append('caption', JSON.stringify(data.caption))
    return request.put(`/v1/product-images/${imageId}`, fd)
  },
  deleteProductImages: (imageId: string) => {
    return request.delete(`/v1/product-images/${imageId}`)
  },
}
