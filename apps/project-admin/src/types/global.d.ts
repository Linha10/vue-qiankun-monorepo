// 展開 intersection type，讓 VSCode hover 顯示完整屬性
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// 使用者資訊（對應 LoginResponse.user，或 getAccountInfo 回傳的完整帳號資料）
interface UserInfo {
  id: string
  accountName: string
  code: string
  role?: string
  email?: string
  phone?: string
  status?: number
  loginAt?: string
  loginIp?: string
}

// 分頁參數
interface PaginationParams {
  page: number
  pageSize: number
}

// 分頁回應
interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
