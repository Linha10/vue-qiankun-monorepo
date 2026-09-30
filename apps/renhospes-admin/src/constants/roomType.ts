// 房型相關常數：樓層 (floor) 與房型等級 (roomLevel)
// 多語顯示文字直接從常數讀取，不入 i18n 檔，避免兩處同步維護。

export type RoomFloorKey = 4 | 5 | 6
export type RoomLevelKey = 1 | 2 | 3

export interface RoomOptionDef<K extends number> {
  zh: string
  en: string
  key: K
}

export const ROOM_FLOORS: Record<RoomFloorKey, RoomOptionDef<RoomFloorKey>> = {
  4: { zh: '4樓', en: '4th floor', key: 4 },
  5: { zh: '5樓', en: '5th floor', key: 5 },
  6: { zh: '6樓', en: '6th floor', key: 6 },
}

export const ROOM_LEVELS: Record<RoomLevelKey, RoomOptionDef<RoomLevelKey>> = {
  1: { zh: '經典雙人房', en: 'Classic Double Room', key: 1 },
  2: { zh: '豪華雙人房', en: 'Deluxe Double Room', key: 2 },
  3: { zh: '尊榮套房', en: 'Executive Suite', key: 3 },
}

export const ROOM_FLOOR_OPTIONS: RoomOptionDef<RoomFloorKey>[] = Object.values(ROOM_FLOORS)
export const ROOM_LEVEL_OPTIONS: RoomOptionDef<RoomLevelKey>[] = Object.values(ROOM_LEVELS)
