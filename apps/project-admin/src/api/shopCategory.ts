import request from './request'
import type {
  GetCategoryListParams,
  CategoryParams,
  GetCategoryListResponse,
  CategoryItem,
  UpdateCategoryParams,
} from '@/types/api-params'

export const shopCategory = {
  getCategoryList: (params: GetCategoryListParams) => {
    return request.get<GetCategoryListResponse>(`/v1/categories`, { params })
  },
  createCategory: (params: CategoryParams) => {
    return request.post(`/v1/categories`, params)
  },
  getCategory: (categoryId: string, lang = 'zh') => {
    return request.get<CategoryItem>(`/v1/categories/${categoryId}`, { params: { lang } })
  },
  updateCategory: (categoryId: string, data: UpdateCategoryParams) => {
    const fd = new FormData()
    fd.append('id', data.id)
    fd.append('name', JSON.stringify(data.name))
    fd.append('description', JSON.stringify(data.description))
    fd.append('seriesType', data.seriesType)
    fd.append('seriesKey', data.seriesKey)
    fd.append('sort', String(data.sort))
    fd.append('status', String(data.status))
    if (data.image) {
      fd.append('image', data.image)
    }
    return request.put(`/v1/categories/${categoryId}`, fd)
  },
  deleteCategory: (categoryId: string) => {
    return request.delete(`/v1/categories/${categoryId}`)
  },
}
