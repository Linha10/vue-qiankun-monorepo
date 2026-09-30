import request from './request'
import type { GetRoomInventoryParams, RoomInventoryItem } from '@/types/api-params'
import { withDefaultParams } from '@/utils/with-default-params'

const defaultRoomInventoryParams = {
  lang: 'zh' as const,
  page: 1,
  pageSize: 10,
} as const

export const inventoryApi = {
  // 取得房況庫存列表
  getRoomInventory: withDefaultParams<GetRoomInventoryParams>(defaultRoomInventoryParams)(
    fullParams => request.get('/v1/room-inventories', { params: fullParams })
  ),

  // 建立房況庫存
  createRoomInventory: withDefaultParams({ restrictions: {} })(data =>
    request.post('/v1/room-inventories', data)
  ),

  // 動態生成房況庫存
  generateRoomInventory: (roomTypeId: string, startDate: string, endDate: string) =>
    request.post('/v1/room-inventories/generate', { roomTypeId, startDate, endDate }),

  // 查詢房況庫存詳情
  // id為庫存id
  getRoomInventoryDetail: (id: string, lang: string = 'zh') =>
    request.get(`/v1/room-inventories/${id}`, { params: { lang } }),

  // 更新房況庫存
  updateRoomInventory: (id: string, data: Partial<Omit<RoomInventoryItem, 'roomTypeId'>>) =>
    request.put(`/v1/room-inventories/${id}`, data),

  // 刪除房況庫存
  deleteRoomInventory: (id: string) => request.delete(`/v1/room-inventories/${id}`),

  // 搜尋可訂房況
  getAvailableRoomInventory: (params: GetRoomInventoryParams) =>
    request.get('/v1/search/room-inventories', {
      params: { ...defaultRoomInventoryParams, ...params },
    }),

  // 查詢預定價格試算
  getPriceCalculation: (params: GetRoomInventoryParams) =>
    request.get('/v1/search/room-price', {
      params: { ...defaultRoomInventoryParams, ...params },
    }),
}
