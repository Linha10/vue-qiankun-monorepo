import request from './request'
import type { BookingListParams, BookingItem, BookingContactInfo } from '@/types/api-params'

export const ordersApi = {
  // 取得訂單列表
  getBookingList: (params: BookingListParams) => request.get('/v1/bookings', { params }),

  // 建立預定訂單
  createBooking: (data: BookingItem) => request.post('/v1/bookings', data),

  // 查詢(單筆)訂單詳情
  getBookingDetail: (id: string, lang: string = 'zh') =>
    request.get(`/v1/bookings/${id}`, { params: { lang } }),

  // 更新訂單
  updateBooking: (id: string, data: Partial<BookingContactInfo>) =>
    request.put(`/v1/bookings/${id}`, data),

  // 取消訂單
  cancelBooking: (id: string) => request.delete(`/v1/bookings/${id}`),
}
