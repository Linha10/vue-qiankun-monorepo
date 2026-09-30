<script setup lang="ts">
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ordersApi } from '@/api/orders'
import { inventoryApi } from '@/api/inventory'
import { BOOKING_STATUS } from '@/constants/booking'
import { useAppStore } from '@/stores/app'
import { useI18n } from '@monorepo/composables'
import type { BookingStatus } from '@/types/api-params'

const router = useRouter()
const appStore = useAppStore()
const { $t } = useI18n()
const today = dayjs().format('YYYY-MM-DD')
// 七天後的日期
const sevenDaysLater = dayjs().add(7, 'day').format('YYYY-MM-DD')

// ── 資料狀態 ──
const isLoading = ref(true)

// KPI
const weeklyCheckIns = ref(0)
const pendingOrders = ref(0)
const checkInToday = ref(0)
const checkOutToday = ref(0)

// 近期訂單
interface OrderRow {
  id: string
  contactName: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  bookingStatus: (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]
}
const recentOrders = ref<OrderRow[]>([])

// 今日房況
interface InventoryRow {
  roomTypeId: string
  roomTypeName: string
  available: number
  total: number
}
const inventoryRows = ref<InventoryRow[]>([])

// ── 快捷連結 ──
const quickLinks = computed(() => [
  {
    label: $t('dashboard.quickLinks.createRoomType'),
    icon: 'solar:bed-bold-duotone',
    path: '/room-type',
  },
  {
    label: $t('dashboard.quickLinks.viewInventory'),
    icon: 'solar:calendar-bold-duotone',
    path: '/inventory',
  },
  {
    label: $t('dashboard.quickLinks.managePricing'),
    icon: 'solar:tag-price-bold-duotone',
    path: '/pricing',
  },
  {
    label: $t('dashboard.quickLinks.manageFacilities'),
    icon: 'solar:slider-vertical-bold-duotone',
    path: '/facilities',
  },
])

// ── 訂單狀態 label ──
const statusMap = computed<
  Record<string, { label: string; type: 'info' | 'success' | 'warning' | 'danger' }>
>(() => ({
  [BOOKING_STATUS.UNPAID]: { label: $t('dashboard.bookingStatus.unpaid'), type: 'warning' },
  [BOOKING_STATUS.PAID]: { label: $t('dashboard.bookingStatus.paid'), type: 'success' },
  [BOOKING_STATUS.CANCELLED]: { label: $t('dashboard.bookingStatus.cancelled'), type: 'danger' },
  [BOOKING_STATUS.CHECKED_OUT]: { label: $t('dashboard.bookingStatus.checkedOut'), type: 'info' },
  [BOOKING_STATUS.CHECKED_IN]: { label: $t('dashboard.bookingStatus.checkedIn'), type: 'info' },
  [BOOKING_STATUS.REFUNDED]: { label: $t('dashboard.bookingStatus.refunded'), type: 'info' },
  [BOOKING_STATUS.UNKNOWN]: { label: $t('dashboard.bookingStatus.unknown'), type: 'info' },
}))
const getStatusTag = (status: keyof typeof BOOKING_STATUS = BOOKING_STATUS.UNKNOWN) =>
  statusMap.value[status]

// ── 庫存顏色 ──
const inventoryColor = (available: number, total: number) => {
  const ratio = total > 0 ? available / total : 0
  if (ratio <= 0.2) return '#ef4444'
  if (ratio <= 0.5) return '#f59e0b'
  return '#0c8a98'
}

const inventoryPct = computed(() =>
  inventoryRows.value.map(r => ({
    ...r,
    pct: r.total > 0 ? Math.round((r.available / r.total) * 100) : 0,
  }))
)

// ── DEV MOCK：切換成 false 即可改回真實 API ──
const USE_MOCK = false

function loadMock() {
  weeklyCheckIns.value = 18
  pendingOrders.value = 3
  checkInToday.value = 7
  checkOutToday.value = 5

  recentOrders.value = [
    {
      id: '1',
      contactName: '王小明',
      roomTypeId: 'rt-1',
      checkInDate: today,
      checkOutDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.UNPAID,
    },
    {
      id: '2',
      contactName: '李美華',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.PAID,
    },
    {
      id: '3',
      contactName: '張大偉',
      roomTypeId: 'rt-1',
      checkInDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      checkOutDate: dayjs().add(4, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.PAID,
    },
    {
      id: '4',
      contactName: '陳雅婷',
      roomTypeId: 'rt-3',
      checkInDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      checkOutDate: today,
      bookingStatus: BOOKING_STATUS.CHECKED_OUT,
    },
    {
      id: '5',
      contactName: '林俊宏',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.CHECKED_IN,
    },
    {
      id: '6',
      contactName: '羅貫中',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.CHECKED_IN,
    },
    {
      id: '7',
      contactName: '周杰倫',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.CHECKED_IN,
    },
    {
      id: '8',
      contactName: '徐熙娣',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.UNPAID,
    },
    {
      id: '9',
      contactName: '天柔',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.CANCELLED,
    },
    {
      id: '10',
      contactName: '納豆',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.UNPAID,
    },
    {
      id: '11',
      contactName: '天心',
      roomTypeId: 'rt-2',
      checkInDate: today,
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      bookingStatus: BOOKING_STATUS.CANCELLED,
    },
  ]

  inventoryRows.value = [
    { roomTypeId: 'rt-1', roomTypeName: '豪華雙人房', available: 2, total: 10 },
    { roomTypeId: 'rt-2', roomTypeName: '標準單人房', available: 8, total: 15 },
    { roomTypeId: 'rt-3', roomTypeName: '景觀套房', available: 1, total: 5 },
    { roomTypeId: 'rt-4', roomTypeName: '家庭雙人房', available: 4, total: 8 },
    { roomTypeId: 'rt-1', roomTypeName: '豪華雙人房', available: 2, total: 10 },
    { roomTypeId: 'rt-5', roomTypeName: '標準雙人房', available: 8, total: 15 },
    { roomTypeId: 'rt-6', roomTypeName: '景觀六人套房', available: 1, total: 5 },
    { roomTypeId: 'rt-7', roomTypeName: '家庭十人房', available: 4, total: 8 },
  ]

  isLoading.value = false
}

// ── 資料載入 ──
const loadDashboard = async () => {
  isLoading.value = true
  const baseParams = {
    page: 1,
    pageSize: 5,
    hotelId: '',
    memberId: '',
    lang: appStore.locale as 'zh' | 'en',
  }

  const [ordersRes, checkOutRes, inventoryRes] = await Promise.allSettled([
    // 七日內所有訂單（用於 totalTodayOrders + pending + 今日入住 filter）
    ordersApi.getBookingList({
      ...baseParams,
      startDate: today,
      endDate: sevenDaysLater,
      pageSize: 100,
    }),
    // 今日退房
    ordersApi.getBookingList({
      ...baseParams,
      startDate: today,
      endDate: today,
      status: BOOKING_STATUS.CHECKED_OUT,
    }),
    // 今日庫存（已包含 roomInfo.name）
    inventoryApi.getRoomInventory({ startDate: today, endDate: today } as never),
  ])

  // 本週預計入住 + 待確認 + 今日入住 KPI
  if (ordersRes.status === 'fulfilled') {
    const data = (ordersRes.value as any).data as { total?: number; list?: OrderRow[] }
    const list = data.list ?? []
    const confirmedStatuses = new Set<BookingStatus>([
      BOOKING_STATUS.PAID,
      BOOKING_STATUS.CHECKED_IN,
    ])
    weeklyCheckIns.value = list.filter(item => confirmedStatuses.has(item.bookingStatus)).length
    pendingOrders.value = list.filter(item => item.bookingStatus === BOOKING_STATUS.UNPAID).length
    checkInToday.value = list.filter(
      item => item.checkInDate === today && confirmedStatuses.has(item.bookingStatus)
    ).length
    recentOrders.value = data.list ?? []
  }

  if (checkOutRes.status === 'fulfilled') {
    checkOutToday.value = ((checkOutRes.value as any).data as { total?: number }).total ?? 0
  }

  // 房況庫存
  if (inventoryRes.status === 'fulfilled') {
    const inventoryList: RoomInventoryItem[] =
      ((inventoryRes.value as any).data as { list?: RoomInventoryItem[] }).list ?? []

    inventoryRows.value = inventoryList.map(item => ({
      roomTypeId: item.roomTypeId,
      roomTypeName: item.roomInfo?.name?.[appStore.locale as 'zh' | 'en'] ?? item.roomTypeId,
      available: item.available,
      total: item.totalInventory,
    }))
  }

  isLoading.value = false
}

// 定義 RoomInventoryItem 型別（本地使用）
interface RoomInventoryItem {
  roomTypeId: string
  totalInventory: number
  available: number
  roomInfo?: {
    name: { zh: string; en: string }
  }
}

USE_MOCK ? loadMock() : loadDashboard()

watch(
  () => appStore.locale,
  () => {
    if (!USE_MOCK) loadDashboard()
  }
)
</script>

<template>
  <section class="dashboard">
    <!-- ── 第一排：KPI 卡片 ── -->
    <div class="kpi-grid">
      <el-card v-loading="isLoading" class="kpi-card" shadow="never">
        <div class="kpi-card__icon kpi-card__icon--blue">
          <Icon icon="solar:calendar-mark-bold-duotone" width="22" />
        </div>
        <el-statistic :title="$t('dashboard.kpi.weeklyCheckIns')" :value="weeklyCheckIns" />
      </el-card>

      <el-card v-loading="isLoading" class="kpi-card" shadow="never">
        <div class="kpi-card__icon kpi-card__icon--amber">
          <Icon icon="solar:bell-bold-duotone" width="22" />
        </div>
        <el-statistic :title="$t('dashboard.kpi.pendingOrders')" :value="pendingOrders" />
      </el-card>

      <el-card v-loading="isLoading" class="kpi-card" shadow="never">
        <div class="kpi-card__icon kpi-card__icon--green">
          <Icon icon="solar:login-bold-duotone" width="22" />
        </div>
        <el-statistic :title="$t('dashboard.kpi.checkInToday')" :value="checkInToday" />
      </el-card>

      <el-card v-loading="isLoading" class="kpi-card" shadow="never">
        <div class="kpi-card__icon kpi-card__icon--slate">
          <Icon icon="solar:logout-bold-duotone" width="22" />
        </div>
        <el-statistic :title="$t('dashboard.kpi.checkOutToday')" :value="checkOutToday" />
      </el-card>
    </div>

    <!-- ── 第二排：近期訂單 + 今日房況 ── -->
    <div class="panel-grid">
      <!-- 近期訂單 -->
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-card__header">
            <span>{{ $t('dashboard.recentOrders.title') }}</span>
            <el-button text size="small" @click="router.push('/orders')">
              {{ $t('dashboard.recentOrders.viewAll') }}
              <Icon icon="solar:alt-arrow-right-line-duotone" width="14" />
            </el-button>
          </div>
        </template>

        <el-table
          :data="recentOrders"
          v-loading="isLoading"
          size="small"
          :show-header="true"
          max-height="240"
        >
          <el-table-column
            prop="contactName"
            :label="$t('dashboard.recentOrders.columns.contact')"
            min-width="80"
          />
          <el-table-column :label="$t('dashboard.recentOrders.columns.checkIn')" min-width="90">
            <template #default="{ row }">
              {{ row.checkInDate ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('dashboard.recentOrders.columns.checkOut')" min-width="90">
            <template #default="{ row }">
              {{ row.checkOutDate ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('dashboard.recentOrders.columns.status')"
            width="80"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.bookingStatus).type" size="small" effect="light">
                {{ getStatusTag(row.bookingStatus).label }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!isLoading && recentOrders.length > 0" class="panel-table-footer">
          {{ $t('dashboard.recentOrders.footer') }}
        </div>

        <el-empty
          v-if="!isLoading && recentOrders.length === 0"
          :description="$t('dashboard.recentOrders.empty')"
          :image-size="60"
        />
      </el-card>

      <!-- 今日房況 -->
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-card__header">
            <span>{{ $t('dashboard.inventory.title') }}</span>
            <el-button text size="small" @click="router.push('/inventory')">
              {{ $t('dashboard.inventory.viewAll') }}
              <Icon icon="solar:alt-arrow-right-line-duotone" width="14" />
            </el-button>
          </div>
        </template>

        <div v-loading="isLoading" class="inventory-list">
          <div v-for="row in inventoryPct" :key="row.roomTypeId" class="inventory-item">
            <div class="inventory-item__label">
              <span>{{ row.roomTypeName }}</span>
              <span class="inventory-item__count">{{ row.available }} / {{ row.total }}</span>
            </div>
            <el-progress
              :percentage="row.pct"
              :color="inventoryColor(row.available, row.total)"
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <el-empty
            v-if="!isLoading && inventoryRows.length === 0"
            :description="$t('dashboard.inventory.empty')"
            :image-size="60"
          />
        </div>
      </el-card>
    </div>

    <!-- ── 第三排：快捷操作 ── -->
    <div class="quick-links">
      <el-card
        v-for="link in quickLinks"
        :key="link.path"
        class="quick-link-card"
        shadow="hover"
        @click="router.push(link.path)"
      >
        <Icon :icon="link.icon" width="28" class="quick-link-card__icon" />
        <span class="quick-link-card__label">{{ link.label }}</span>
      </el-card>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── KPI ──
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi-card {
  border-radius: 12px;
  border: 1px solid $color-border;

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  :deep(.el-statistic__head) {
    font-size: 12px;
    color: $color-text-muted;
    margin-bottom: 4px;
  }

  :deep(.el-statistic__content) {
    font-size: 28px;
    font-weight: 700;
    color: $color-text-primary;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &--blue {
      background: $color-primary-100;
      color: $color-primary-800;
    }
    &--amber {
      background: $color-secondary-light;
      color: $color-secondary-700;
    }
    &--green {
      background: #dcfce7;
      color: $color-success;
    }
    &--slate {
      background: $color-neutral-100;
      color: $color-neutral-600;
    }
  }
}

// ── 二欄面板 ──
.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.panel-card {
  border-radius: 12px;
  border: 1px solid $color-border;
  max-height: 360px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid $color-border-subtle;
    flex-shrink: 0;
  }

  :deep(.el-card__body) {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
    color: $color-text-primary;
  }
}

// ── 庫存列表 ──
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 80px;
  overflow-y: auto;
  flex: 1;
  padding-right: 8px;
}

.inventory-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: $color-text-secondary;
  }

  &__count {
    color: $color-text-muted;
    font-variant-numeric: tabular-nums;
  }
}

// ── 近期訂單 footer ──
.panel-table-footer {
  padding: 10px 0 2px;
  font-size: 12px;
  color: $color-text-disabled;
  text-align: center;
  border-top: 1px solid $color-border-subtle;
  flex-shrink: 0;
  margin-top: 8px;
}

// ── 快捷操作 ──
.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quick-link-card {
  border-radius: 12px;
  border: 1px solid $color-border;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: $color-primary;
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px 12px;
  }

  &__icon {
    color: $color-primary;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-secondary;
  }
}
</style>
