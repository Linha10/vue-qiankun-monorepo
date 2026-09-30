import request from './request'
import type {
  ShopOrderParams,
  ShopOrderResponse,
  ClientInfo,
  OrderQuantityParams,
  ShopOrderInfo,
} from '@/types/api-params'

export const shopOrderApi = {
  // 取得所有訂單列表
  getShopOrderList: (params: ShopOrderParams) => {
    return request.get<ShopOrderResponse>('/v1/orders', { params })
  },
  getShopOrderDetailByOrderNumber: (orderNumber: string, lang = 'zh') => {
    return request.get<ShopOrderInfo>(`/v1/orders/number/${orderNumber}`, { params: { lang } })
  },
  getShopOrderDetail: (id: string, lang: 'zh' | 'en') => {
    return request.get<ShopOrderInfo>(`/v1/orders/${id}`, { params: { lang } })
  },
  // 更新買家資訊
  updateShopOrderInfo: (id: string, data: ClientInfo) => {
    return request.put(`/v1/orders/${id}`, data)
  },
  // orderStatus為pending才可取消
  deleteShopOrder: (id: string) => {
    return request.delete(`/v1/orders/${id}`)
  },
  checkoutOrder: (id: string) => {
    return request.put(`/v1/orders/${id}/checkout`)
  },
  // 更新訂單內指定品項購買數量
  updateOrderItemQuantity: (id: string, data: OrderQuantityParams) => {
    return request.put(`/v1/orders/${id}/quantity`, data)
  },
}
