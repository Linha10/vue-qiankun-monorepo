import request from './request'
import type { HotelItem, HotelImageParams } from '@/types/api-params'

export const hotelApi = {
  // ── 飯店資訊 ──

  // 取得飯店列表
  getHotelList: (params: {
    page?: number
    pageSize?: number
    lang?: 'zh' | 'en'
    search?: string
    status?: 0 | 1
  }) =>
    request.get('/v1/hotels', {
      params: { page: 1, pageSize: 10, lang: 'zh', ...params },
    }),

  // 建立飯店詳細資訊
  createHotel: (data: HotelItem) => request.post('/v1/hotels', data),

  // 更新飯店詳細資訊
  updateHotel: (hotelId: string, data: Partial<HotelItem>) =>
    request.put(`/v1/hotels/${hotelId}`, data),

  // 取得飯店詳細資訊
  getHotelDetail: (hotelId: string) => request.get(`/v1/hotels/${hotelId}`),

  // 刪除飯店
  deleteHotel: (hotelId: string) => request.delete(`/v1/hotels/${hotelId}`),

  // ── 飯店圖片 ──（gallery module 可引入此區塊）

  // 新增飯店圖片
  uploadHotelImage: (data: HotelImageParams) => request.post('/v1/hotel-images', data),

  // 更新飯店圖片
  updateHotelImage: (imgId: string, data: Partial<HotelImageParams>) =>
    request.put(`/v1/hotel-images/${imgId}`, data),

  // 刪除飯店圖片
  deleteHotelImage: (imgId: string) => request.delete(`/v1/hotel-images/${imgId}`),

  // ── 其他 ──

  // Health Check
  healthCheck: () => request.get('/v1/health'),
}
