import request from './request'
import type { ApiResponse } from '@monorepo/request'
import type {
  PromotionListParams,
  PromotionListResponseItem,
  PromotionDetailResponse,
  Pagination,
} from '@/types/api-params'

export const promotionApi = {
  // 取得促銷活動列表
  getPromotionsList: (
    params: PromotionListParams
  ): Promise<ApiResponse<{ list: PromotionListResponseItem[]; pagination: Pagination }>> =>
    request.get('/v1/promotions', { params }),

  // 創建促銷活動（FormData）
  createPromotion: (data: FormData): Promise<ApiResponse<PromotionDetailResponse>> =>
    request.post('/v1/promotions', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // 查詢促銷活動詳情
  getPromotionDetail: (
    id: string,
    lang: string = 'zh'
  ): Promise<ApiResponse<PromotionDetailResponse>> =>
    request.get(`/v1/promotions/${id}`, { params: { lang } }),

  // 更新促銷活動（FormData）
  updatePromotion: (id: string, data: FormData): Promise<ApiResponse<PromotionDetailResponse>> =>
    request.put(`/v1/promotions/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // 刪除促銷活動
  deletePromotion: (id: string): Promise<ApiResponse<null>> =>
    request.delete(`/v1/promotions/${id}`),
}
