import request from './request'
import type { ApiResponse } from '@monorepo/request'
import type {
  FacilitiesParams,
  FacilityItem,
  FacilityCategoryItem,
  Pagination,
} from '@/types/api-params'

export const facilitiesApi = {
  // 取得設施列表
  getFacilitiesList: (
    params: FacilitiesParams
  ): Promise<ApiResponse<{ list: FacilityCategoryItem[]; pagination: Pagination }>> =>
    request.get('/v1/facilities', { params }),
  // 創建設施
  createFacility: (data: FacilityItem) => request.post('/v1/facilities', data),

  // 查詢指定設施
  // id對應facilityId
  getFacilityDetail: (id: string): Promise<ApiResponse<FacilityCategoryItem>> =>
    request.get(`/v1/facilities/${id}`),

  // 更新指定設施
  updateFacility: (
    id: string,
    data: Partial<FacilityItem>
  ): Promise<ApiResponse<FacilityCategoryItem>> => request.put(`/v1/facilities/${id}`, data),

  // 刪除指定設施
  deleteFacility: (id: string) => request.delete(`/v1/facilities/${id}`),
}
