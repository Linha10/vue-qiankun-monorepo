import request from './request'
import type { PriceRuleParams, PriceRuleByWeekdayParams } from '@/types/api-params'

export const pricingApi = {
  // ── 日期定價規則 ──

  // 取得日期定價規則列表
  getRoomPriceRulesByDate: (params: PriceRuleParams) =>
    request.get('/v1/price-rule-dates', { params }),

  // 創建日期定價規則
  createRoomPriceRuleByDate: (data: {
    fixedAmount: number
    multiplier: number
    roomTypeId: string
    ruleDate: string
  }) => request.post('/v1/price-rule-dates', data),

  // 查詢指定日期定價規則
  getRoomPriceRule: (id: string) => request.get(`/v1/price-rule-dates/${id}`),

  // 更新指定日期定價規則
  updateRoomPriceRuleByDate: (
    id: string,
    data: Partial<{ fixedAmount: number; multiplier: number; ruleDate: string }>
  ) => request.put(`/v1/price-rule-dates/${id}`, data),

  // 刪除指定日期定價規則
  deleteRoomPriceRuleByDate: (id: string) => request.delete(`/v1/price-rule-dates/${id}`),

  // ── 星期定價規則 ──

  // 取得星期定價規則列表
  getRoomPriceRulesByWeek: (params: PriceRuleByWeekdayParams) =>
    request.get('/v1/price-rule-weeks', { params }),

  // 建立星期定價規則
  createRoomPriceRuleByWeek: (data: PriceRuleByWeekdayParams) =>
    request.post('/v1/price-rule-weeks', data),

  // 查詢指定星期定價規則
  getRoomPriceRuleByWeekDetail: (id: string) => request.get(`/v1/price-rule-weeks/${id}`),

  // 更新指定星期定價規則
  updateRoomPriceRuleByWeek: (id: string, data: Partial<PriceRuleByWeekdayParams>) =>
    request.put(`/v1/price-rule-weeks/${id}`, data),

  // 刪除指定星期定價規則
  deleteRoomPriceRuleByWeek: (id: string) => request.delete(`/v1/price-rule-weeks/${id}`),
}
