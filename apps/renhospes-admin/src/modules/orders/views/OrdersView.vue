<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useCRUD, useI18n, usePermission } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { ordersApi } from '@/api/orders'
import { hotelApi } from '@/api/hotel'
import { BOOKING_STATUS } from '@/constants/booking'
import { HcButton, HcTable } from '@monorepo/ui-kit'
import { HcMessageBox } from '@monorepo/utils'
import { statusTag } from '@/utils/bookingStatus'
import OrderDetailDialog from '../components/OrderDetailDialog.vue'
import OrderFormDialog from '../components/OrderFormDialog.vue'
import OrderFilterBar from '../components/OrderFilterBar.vue'
import type { TableColumn } from '@monorepo/ui-kit'
import type { BookingStatus } from '@/types/api-params'

defineOptions({ name: 'OrdersView' })

const { $t } = useI18n()
const appStore = useAppStore()
const queryClient = useQueryClient()
const { canPerformAction } = usePermission()

// ── 飯店下拉 ──────────────────────────────────────────────────
interface HotelOption {
  hotelId: string
  name: string
}
const hotelOptions = ref<HotelOption[]>([])
const selectedHotelId = ref('')
const isHotelLoading = ref(false)

const loadHotels = async () => {
  isHotelLoading.value = true
  try {
    const res = await hotelApi.getHotelList({ pageSize: 100, lang: appStore.locale as 'zh' | 'en' })
    hotelOptions.value = (res as any)?.data?.list ?? []
  } finally {
    isHotelLoading.value = false
  }
}

onMounted(loadHotels)

// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref({
  page: 1,
  pageSize: 10,
  hotelId: '',
  memberId: '',
  status: undefined as BookingStatus | undefined,
  startDate: '',
  endDate: '',
  lang: appStore.locale as 'zh' | 'en',
})

// 日期範圍雙向繫結輔助
const dateRange = computed({
  get: () =>
    filters.value.startDate && filters.value.endDate
      ? [filters.value.startDate, filters.value.endDate]
      : [],
  set: (val: string[]) => {
    filters.value.startDate = val?.[0] ?? ''
    filters.value.endDate = val?.[1] ?? ''
  },
})

watch(selectedHotelId, val => {
  filters.value.hotelId = val
  filters.value.page = 1
})

watch(
  () => appStore.locale,
  locale => {
    filters.value.lang = locale as 'zh' | 'en'
  }
)

// ── 訂單列表（API: getBookingList）────────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: 'bookingList',
  apiFns: { getList: (f: any) => ordersApi.getBookingList(f) },
  filters,
  enabled: computed(() => !!selectedHotelId.value),
})

const bookingList = computed(() => (data.value as any)?.data?.list ?? [])
const total = computed(() => (data.value as any)?.data?.total ?? 0)

// ── 搜尋 / 重置 ───────────────────────────────────────────────
function handleSearch() {
  filters.value.page = 1
}

function handleReset() {
  filters.value.status = undefined
  filters.value.memberId = ''
  filters.value.startDate = ''
  filters.value.endDate = ''
  filters.value.page = 1
}

function handlePageSizeChange(v: number) {
  filters.value = { ...filters.value, pageSize: v, page: 1 }
}

// ── 表格欄位 ──────────────────────────────────────────────────
const columns = computed<TableColumn[]>(() => [
  { prop: 'bookingNo', label: $t('orders.columns.bookingId'), minWidth: 180 },
  { prop: 'contactName', label: $t('orders.columns.contactName'), minWidth: 100 },
  { prop: 'contactPhone', label: $t('orders.columns.contactPhone'), minWidth: 120 },
  { prop: 'checkInDate', label: $t('orders.columns.checkInDate'), minWidth: 110, align: 'center' },
  {
    prop: 'checkOutDate',
    label: $t('orders.columns.checkOutDate'),
    minWidth: 110,
    align: 'center',
  },
  { prop: 'adults', label: $t('orders.columns.adults'), width: 70, align: 'center' },
  { prop: 'children', label: $t('orders.columns.children'), width: 70, align: 'center' },
  { prop: 'roomCount', label: $t('orders.columns.roomCount'), width: 80, align: 'center' },
  { prop: 'bookingStatus', label: $t('orders.columns.status'), width: 110, align: 'center' },
  {
    prop: 'actions',
    label: $t('orders.columns.actions'),
    width: 220,
    align: 'center',
    fixed: 'right',
  },
])

// ── 狀態 Tag 樣式 ──────────────────────────────────────────────
// statusTag 導入自 @/utils/bookingStatus

// ── 查看詳情（API: getBookingDetail — 由 OrderDetailDialog 呼叫）─
const detailDialogVisible = ref(false)
const selectedBookingId = ref<string | null>(null)

function handleView(row: any) {
  selectedBookingId.value = row.id
  detailDialogVisible.value = true
}

// ── 建立 / 編輯訂單（API: createBooking / updateBooking — 由 OrderFormDialog 執行）─
const formDialogVisible = ref(false)
const editingOrder = ref<Record<string, any> | null>(null)

function handleCreate() {
  editingOrder.value = null
  formDialogVisible.value = true
}

function handleEdit(row: any) {
  editingOrder.value = row
  formDialogVisible.value = true
}

// 僅 UNPAID 允許編輯
const editableStatuses = new Set<string>([BOOKING_STATUS.UNPAID])

// ── 取消訂單（API: cancelBooking）────────────────────────────
const { mutate: cancelBooking, isPending: isCancelling } = useMutation({
  mutationFn: (id: string) => ordersApi.cancelBooking(id),
  onSuccess: () => {
    ElMessage.success($t('orders.cancel.success'))
    queryClient.invalidateQueries({ queryKey: ['bookingList'] })
  },
})

async function handleCancel(row: any) {
  try {
    await HcMessageBox.confirm($t('orders.cancel.confirm'), $t('common.tip'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    })
    cancelBooking(row.id)
  } catch {}
}

// 可取消的狀態
const cancellableStatuses = new Set<string>([BOOKING_STATUS.UNPAID, BOOKING_STATUS.PAID])
</script>

<template>
  <section class="tw-p-6">
    <!-- 頁首 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">{{ $t('orders.title') }}</h1>
    </div>

    <!-- 篩選列 -->
    <OrderFilterBar
      :hotel-id="selectedHotelId"
      :hotel-options="hotelOptions"
      :hotel-loading="isHotelLoading"
      :status="filters.status"
      :date-range="dateRange"
      :member-id="filters.memberId"
      :create-disabled="!selectedHotelId"
      @update:hotel-id="val => (selectedHotelId = val)"
      @update:status="val => (filters.status = val)"
      @update:date-range="val => (dateRange = val)"
      @update:member-id="val => (filters.memberId = val)"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <!-- 訂單列表（API: getBookingList）-->
    <div class="tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm">
      <HcTable
        v-loading="isLoading"
        :data="bookingList"
        :columns="columns"
        :total="total"
        v-model:page="filters.page"
        :page-size="filters.pageSize"
        @update:page-size="handlePageSizeChange"
        stripe
        row-key="bookingId"
        v-if="selectedHotelId"
      >
        <!-- 成人 -->
        <template #adults="{ scope }">
          <div>{{ scope.items?.[0]?.adults }}</div>
        </template>
        <!-- 兒童 -->
        <template #children="{ scope }">
          <div>{{ scope.items?.[0]?.children }}</div>
        </template>
        <!-- 狀態 -->
        <template #bookingStatus="{ scope }">
          <el-tag :type="statusTag(scope.bookingStatus)" size="small">
            {{ $t(`orders.status.${scope.bookingStatus}`) }}
          </el-tag>
        </template>
        <template #roomCount="{ scope }">
          <div>{{ scope.items?.[0]?.quantity }}</div>
        </template>

        <!-- 操作 -->
        <template #actions="{ scope }">
          <div class="tw-flex tw-gap-2 tw-justify-center">
            <!-- 查看 — 觸發 API: getBookingDetail（由 OrderDetailDialog 執行）-->
            <HcButton type="primary" link size="small" @click="handleView(scope)">
              {{ $t('orders.view') }}
            </HcButton>
            <!-- 編輯 — API: updateBooking（僅 UNPAID 可見，由 OrderFormDialog 執行）-->
            <HcButton
              v-if="
                editableStatuses.has(scope.bookingStatus) && canPerformAction('/orders', 'update')
              "
              type="primary"
              link
              size="small"
              @click="handleEdit(scope)"
            >
              {{ $t('orders.edit') }}
            </HcButton>
            <!-- 取消 — API: cancelBooking -->
            <HcButton
              v-if="canPerformAction('/orders', 'delete')"
              type="danger"
              link
              size="small"
              :disabled="!cancellableStatuses.has(scope.bookingStatus) || isCancelling"
              @click="handleCancel(scope)"
            >
              {{ $t('orders.cancel.button') }}
            </HcButton>
          </div>
        </template>
      </HcTable>

      <!-- 未選飯店提示 -->
      <div v-else class="tw-py-16 tw-text-center tw-text-gray-400">
        <i class="fa-solid fa-building-columns tw-text-4xl" />
        <p>{{ $t('promotion.noHotelSelected') }}</p>
      </div>
    </div>

    <!-- 訂單詳情 Dialog（API: getBookingDetail）-->
    <OrderDetailDialog v-model="detailDialogVisible" :booking-id="selectedBookingId" />

    <!-- 建立 / 編輯訂單 Dialog（API: createBooking / updateBooking）-->
    <OrderFormDialog
      v-model="formDialogVisible"
      :edit-data="editingOrder"
      :hotel-id="filters.hotelId"
    />
  </section>
</template>
