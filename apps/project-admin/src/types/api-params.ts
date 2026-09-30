import { BOOKING_STATUS } from '@/constants/booking'

// ─── 共用基礎型別 ─────────────────────────────────────────────────────────
// 抽出重複使用的 union type，避免各處各自定義、容易不一致

export type Lang = 'zh' | 'en'
export type LocaleText = Record<Lang, string>

// 啟用狀態（0:停用 1:啟用）— 用於房型、設施等管理類 API
export type EnableStatus = 0 | 1
// 上下架狀態（1:上架 2:下架）— 用於優惠活動等前台展示類 API
export type PublishStatus = 1 | 2

// 商店相關
export type PickupMethod = 'delivery' | 'pickup'
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

// ─── 共用分頁型別 ─────────────────────────────────────────────────────────
export type PageParams = {
  page: number
  pageSize: number
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// ─── 房型 ─────────────────────────────────────────────────────────────────
export type FloorNumber = 4 | 5 | 6
export type RoomLevel = 1 | 2 | 3

type BedConfig = {
  type: string
  num: number
}

// 查詢房型列表參數
export type RoomTypeListParams = Prettify<
  PageParams & {
    hotelId: string
    lang: Lang
    search?: string | null
    floor?: FloorNumber
    roomLevel?: RoomLevel
    status: EnableStatus
  }
>

// 創建房型
export type RoomTypeBody = {
  hotelId: string
  name: LocaleText
  description: LocaleText
  roomSizeM2: number
  maxAdults: number
  maxChildren: number
  quantity: number
  basePrice: number
  bedConfig?: BedConfig[]
  facilityIds?: string[]
  sort?: number
  status?: EnableStatus
  img?: string[]
  floor: FloorNumber
  roomLevel: RoomLevel
}

// ─── 房型庫存 ─────────────────────────────────────────────────────────────
export type GetRoomInventoryParams = Prettify<
  PageParams & {
    roomTypeId: string
    startDate: string
    endDate: string
    status: number
    maxPrice: number
    minPrice: number
    availableOnly: boolean
    adults: number
    children: number
    lang: Lang
  }
>

export type RoomInventoryItem = {
  maxAdults: number
  maxChildren: number
  price: number
  restrictions: string[]
  roomTypeId: string
  status: number
  targetDate: string
  totalInventory: number
}

// ─── 房型圖片 ─────────────────────────────────────────────────────────────
export type RoomImageItem = {
  id: string
  image: string
  sort: number
  status: EnableStatus
  caption: LocaleText
}

export type ImageItem = {
  imageId: string
  url: string
  caption: LocaleText
  sort: number
  status: EnableStatus
}

// ─── 價格規則 ─────────────────────────────────────────────────────────────
export type PriceRuleParams = Prettify<
  PageParams & {
    roomTypeId: string
    startDate: string
    endDate: string
  }
>

export type PriceRuleByWeekdayParams = Prettify<
  PageParams & {
    roomTypeId: string
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  }
>

// ─── 訂房（Booking） ──────────────────────────────────────────────────────
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export type BookingListParams = Prettify<
  PageParams & {
    hotelId: string
    memberId: string
    status?: BookingStatus
    startDate: string
    endDate: string
    lang: Lang
  }
>

export type BookingItem = {
  adults?: number
  checkInDate?: string
  checkOutDate?: string
  children?: number
  contactEmail?: string
  contactName?: string
  contactPhone?: string
  hotelId?: string
  // TODO(restore-required): 會員 ID 目前非必填
  memberId?: string
  roomCount?: number
  roomTypeId: string
  specialRequest?: string
}

export type BookingContactInfo = {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  specialRequest?: string
}

// ─── 設施 ─────────────────────────────────────────────────────────────────
export type FacilitiesParams = Prettify<
  PageParams & {
    code?: string
    lang?: Lang
    search?: string | null
    status?: EnableStatus
  }
>

export type FacilityItem = {
  category: LocaleText
  code: string
  icon: string
  name: LocaleText
  status: EnableStatus
}

export type FacilityCategoryItem = {
  facilityId: string
  code: string
  name: string
  jsonName: LocaleText
  jsonCategory: LocaleText
  category: string
  icon: string
  status: EnableStatus
}

// ─── 飯店 ─────────────────────────────────────────────────────────────────
type LocationInfo<T extends string = string> = Partial<Record<T, LocaleText>>

export type HotelItem = {
  name: LocaleText
  description: LocaleText
  latitude: number | null
  longitude: number | null
  locationInfo: LocationInfo
  facilityIds: string[]
  status: EnableStatus
  images?: string[]
}

export type HotelImageParams = {
  id: string
  images: string[]
  sort: number
  status: EnableStatus
  caption?: LocaleText
}

// ─── 優惠活動（Promotion） ────────────────────────────────────────────────

export type PromotionListParams = Prettify<
  PageParams & {
    hotelId?: string
    search?: string
    // 0:全部 1:活動消息 2:年度方案 3:限時優惠
    typeId?: 0 | 1 | 2 | 3
    lang?: Lang
    // 0:全部 1:上架中 2:已下架
    status?: 0 | PublishStatus
  }
>

// 列表單筆資料
export type PromotionListResponseItem = {
  id: string
  title: string
  subtitle: string
  content: string
  metaTitle: string
  metaDescription: string
  imageAlt: string
  tag: string
  createdAt: string
  startTime: string
  endTime: string
  image: string
  url: string
  typeId: number
  top: EnableStatus
  sort: number
  overview?: string
  status: PublishStatus
}

// 詳情（含各語系 json 欄位）

export type PromotionDetailResponse = Prettify<
  PromotionListResponseItem & {
    jsonTitle: LocaleText
    jsonSubtitle: LocaleText
    jsonContent: LocaleText
    jsonTag: LocaleText
    jsonImageAlt: LocaleText
    jsonMetaTitle: LocaleText
    jsonMetaDescription: LocaleText
    jsonOverview: LocaleText
  }
>

// 建立 / 更新送出格式（含 File，需組成 FormData）
export type PromotionBody = {
  title: LocaleText
  subtitle?: LocaleText
  content: LocaleText
  tag?: LocaleText
  metaTitle?: LocaleText
  metaDescription?: LocaleText
  imageAlt?: LocaleText
  typeId: number
  top?: EnableStatus
  sort?: number
  status?: PublishStatus
  startTime: string
  endTime: string
  url?: string
  image?: File
  overview?: LocaleText
}

export type UpdatePromotionBody = Prettify<
  PromotionBody & {
    id: string
  }
>

// ─── 商店訂單（Shop Order） ───────────────────────────────────────────────
export type ShopOrderParams = Prettify<
  PageParams & {
    orderStatus?: OrderStatus
    phone?: string
    search?: string
    lang: Lang
  }
>

// 訂單明細內的商品項目
export type OrderItem = {
  itemId: string
  jsonName: LocaleText
  productId: string
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
  imageUrl: string
}

// 訂單列表單筆資料
export type ShopOrderInfo = {
  address: string
  city: string
  createdAt: string
  district: string
  email: string
  expiresAt: string
  id: string
  name: string
  notes: string
  orderItems: OrderItem[]
  orderNumber: string
  orderStatus: OrderStatus
  paidAt: string
  phone: string
  phonePrefix?: string
  areaCode?: string
  landline?: string
  pickupMethod: PickupMethod
  roomNumber: string
  totalAmount: number
  zipCode: string
}

// 訂單列表 API response
export type ShopOrderResponse = {
  list: ShopOrderInfo[]
  pagination: Pagination
}

export type ClientInfo = {
  address: string
  city: string
  district: string
  email: string
  name: string
  notes: string
  phone: string
  phonePrefix?: string
  areaCode?: string
  landline?: string
  pickupMethod: PickupMethod
  roomNumber: string
  zipCode: string
}

export type OrderQuantityParams = {
  orderItemId: string
  quantity: number
}

// ─── 商店商品 ──────────────────

export type SeriesId = 'series-saffron' | 'series-machu-picchu' | 'series-marrakesh'

export type ShopProductParams = {
  categoryId: string
  seriesId: SeriesId
  name: LocaleText
  description: LocaleText
  price: number
  stock: number
  isActive: boolean
  status: 0 | 1
  size?: string
  images: File[]
}

export type ShopProductListParams = Prettify<
  PageParams & {
    categoryId?: string
    seriesId?: SeriesId
    search?: string
    isActive?: boolean
    lang: Lang
  }
>
export type Image = Prettify<
  CreateProductImageParams & {
    imageId: string
    url: string
    jsonCaption: LocaleText
    createAt: string
  }
>

export type ShopItem = Prettify<
  Omit<ShopProductParams, 'images'> & {
    productId: string
    productCode: string
    sort: number
    name: string
    createdAt: string
    jsonName: LocaleText
    jsonDesc: LocaleText
    images: Image[]
  }
>

export type ShopProductListResponse = {
  list: ShopItem[]
  pagination: Pagination
}

// ─── 商品圖片 ─────────────────────────────────────────────────────────────
export type CreateProductImageParams = {
  productId: string
  image: File
  sort?: number
  // 1 = 開啟, 2 = 關閉
  status?: 1 | 2
  caption?: LocaleText
}

export type CreateProductImageResponse = Prettify<
  Omit<CreateProductImageParams, 'image'> & {
    createAt: string
    imageId: string
    url: string
  }
>

export type UpdateProductImageParams = Prettify<
  Omit<CreateProductImageParams, 'productId' | 'image'> & {
    id: string
    image?: File
  }
>

// ─── 分類 ─────────────────────────────────────────────────────────────

export type GetCategoryListParams = Prettify<
  PageParams & {
    lang: Lang
    search: string
    status: 0 | 1
    seriesType: SeriesId
  }
>

export type GetCategoryListResponse = {
  list: CategoryItem[]
  pagination: Pagination
}

export type CategoryParams = {
  name: LocaleText
  description: LocaleText
  seriesType: string
  seriesKey: string
  sort: number
  status: 0 | 1
  image?: File
}

export type UpdateCategoryParams = Prettify<
  CategoryParams & {
    id: string
  }
>

export type CategoryItem = {
  categoryId: string
  description: string
  image: string
  name: string
  seriesKey: string
  seriesType: string
  sort: number
  status: 0 | 1
  jsonDesc: LocaleText
  jsonName: LocaleText
}

// ─── 登入及帳號 ──────────────

export type Enabled = {
  status: 0 | 1
}

export type LoginLoacted = {
  loginAt: string
  loginIp: string
}

export type AccountInfo = {
  accountName: string
  email: string
  phone: string
}

export type CreateAccountParams = Prettify<
  Enabled &
    AccountInfo & {
      password: string
    }
>

export type GetAccountListParams = Prettify<
  PageParams & {
    search?: string
    status?: 0 | 1
  }
>

export type AccountItem = Prettify<
  AccountInfo & Enabled & LoginLoacted & { code: string; id: string }
>

export type GetAccountListResponse = {
  list: AccountItem[]
  pagination: Pagination
}

export type UpdateAccountParams = Prettify<
  Omit<CreateAccountParams, 'accountName' | 'password'> & {
    password?: string
  }
>

export type LoginParams = {
  accountName: string
  password: string
  captcha: string
  captchaId: string
}

export type LoginResponse = {
  accessExpiresIn: number
  accessToken: string
  refreshExpiresIn: number
  refreshToken: string
  tokenType: string
  user: {
    accountName: string
    code: string
    id: string
    role: string
  }
}

export type CaptchaResponse = {
  captchaId: string
  captchaLength: number
  captchaValue: string
  expiredTime: string
  picPath: string
}

// ─── 帳號Logs ───────

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type GetAccountActionLogs = Prettify<
  PageParams & {
    accountName?: string
    accountId?: string
    requestMethod?: RequestMethod
    errorCode?: number
    startDate?: string
    endDate?: string
    search?: string
  }
>

// TODO 待定
export type Action = {
  id: string
  name: string
}

export type RequestLog = {
  action: Action
  latency: string
  referer: string
  user_agent: string
  request_body: string
  response_msg: string
  response_body: string
  response_code: number
}

export type AccountActionLog = {
  id: string
  accountId: string
  accountName: string
  requestUrl: string
  requestMethod: string
  requestIp: string
  requestLog: RequestLog
  errorCode: number
  costTimeMs: number
  createdAt: string
}

export type AccountActionLogsResponse = {
  list: AccountActionLog[]
  pagination: Pagination
}

export type Provider = 'backend' | 'system'
export type LogAction = 'login' | 'logout'

export type LoginLogsParams = Prettify<
  PageParams & {
    provider?: Provider
    action?: LogAction
    loginId?: string
    startDate?: string
    endDate?: string
  }
>

export type LoginLogsItem = {
  id: string
  loginId: string
  loginName: string
  action: LogAction
  provider: Provider
  providerUid: string | null
  loginIp: string
  deviceInfo: string
  createdAt: string
}

export type LoginLogsResponse = {
  list: LoginLogsItem[]
  pagination: Pagination
}

export type RoleListParams = Prettify<
  PageParams & {
    search?: string
    status?: EnableStatus
  }
>

export type Role = {
  id: number
  roleName: string
  roleKey: string
  sort: number
  status: EnableStatus
  createdAt: string
  updateAt: string
}

export type RoleListResponse = {
  list: Role[]
  pagination: Pagination
}

export type CreateRole = Prettify<Omit<Role, 'createdAt' | 'updatedAt' | 'id'>>

export type Menu = {
  action: string
  children?: Menu[]
  icon: string
  id: number
  level: number
  menuName: string
  menuType: MenuType
  parent: string
  parentId: number | null
  path: string
  permission: string
  sort: number
  status: EnableStatus
  title: string
  url: string
  updatedAt: string
  createdAt: string
}

export type SpecificRoleResponse = {
  id: string
  menus: Menu[]
  roleKey: string
  roleName: string
  sort: number
  status: EnableStatus
  createdAt: string
  updatedAt: string
}

export type UpdateSpecificRoleParams = {
  roleId: string
  roleKey: string
  roleName: string
  sort: number
  status: EnableStatus
}

export type GetRoleMenusResponse = number[]

export type UpdateRoleMenuParams = {
  roleId: string
  menuIds: number[]
}

export type MenuType = 'DIR' | 'MENU' | 'BTN' | 'API'

export type GetMenuListParams = {
  menuId?: string
  parentId?: number
  level?: number
  status?: EnableStatus
  menuType?: MenuType
  title?: string
}

export type FlatMenu = Prettify<Omit<Menu, 'children' | 'parent'>>

export type GetMenuListResponse = FlatMenu[]

// id 由後端建立時產生，不由前端指定
export type CreateMenuParams = Prettify<
  Omit<FlatMenu, 'id' | 'createdAt' | 'updatedAt' | 'level' | 'path'>
>

export type GetMenuTreeResponse = Menu[]

export type UpdateMenuParams = {
  menuId: string
  action: string
  icon: string
  menuName: string
  menuType: MenuType
  parentId: number | null
  permission: string
  sort: number
  status: number
  title: string
  url: string
}

export type GetAccountRolesList = {
  roleIds: number[]
}

export type UpdateAccountRoleParams = {
  accountId: string
  roleIds: number[]
}
