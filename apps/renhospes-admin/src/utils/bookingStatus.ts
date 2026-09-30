import { BOOKING_STATUS } from '@/constants/booking'

export type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'

export const statusTagMap: Record<string, TagType> = {
  [BOOKING_STATUS.PAID]: 'success',
  [BOOKING_STATUS.UNPAID]: 'warning',
  [BOOKING_STATUS.CANCELLED]: 'danger',
  [BOOKING_STATUS.REFUNDED]: 'danger',
  [BOOKING_STATUS.CHECKED_IN]: 'primary',
  [BOOKING_STATUS.CHECKED_OUT]: 'info',
  [BOOKING_STATUS.UNKNOWN]: 'info',
}

export function statusTag(status: string): TagType {
  return statusTagMap[status] ?? 'info'
}
