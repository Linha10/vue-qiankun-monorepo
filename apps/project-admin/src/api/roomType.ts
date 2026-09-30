import request from './request'
import type { RoomTypeBody, RoomTypeListParams, RoomImageItem } from '@/types/api-params'
import { withDefaultParams } from '@/utils/with-default-params'

const roomTypeParam = {
  lang: 'zh' as const,
  page: 1,
  status: 1,
  pageSize: 10,
} as const

export const roomTypeApi = {
  // 取得床型選項
  getBedOptions: (lang: string = 'zh') => request.get('/v1/bed-options', { params: { lang } }),

  // 取得房型列表
  getRoomTypes: withDefaultParams<RoomTypeListParams>(roomTypeParam)(fullParams =>
    request.get('/v1/room-types', { params: fullParams })
  ),

  // 創建房型
  createRoomType: (data: RoomTypeBody) => request.post('/v1/room-types', data),

  // 查詢房型
  getSpecificRoomType: (id: string, lang: string = 'zh') =>
    request.get(`/v1/room-types/${id}`, { params: { lang } }),

  // 更新房型
  updateSpecificRoomType: (id: string, data: Partial<RoomTypeBody>) =>
    request.put(`/v1/room-types/${id}`, data),

  // 刪除房型
  deleteSpecificRoomType: (id: string) => request.delete(`/v1/room-types/${id}`),

  // ── 房型圖片 ──（gallery module 可引入此區塊）

  // 新增房型圖片
  createRoomImage: (data: RoomImageItem) => request.post('/v1/room-images', data),

  // 更新房型圖片
  updateRoomImage: (imgId: string, data: Partial<RoomImageItem>) =>
    request.put(`/v1/room-images/${imgId}`, data),

  // 刪除房型圖片
  deleteRoomImage: (imgId: string) => request.delete(`/v1/room-images/${imgId}`),
}
