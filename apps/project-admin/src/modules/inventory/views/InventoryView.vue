<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useCRUD, useI18n, usePermission, useWeekDays } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { roomTypeApi } from '@/api/roomType'
import { inventoryApi } from '@/api/inventory'
import { HcButton } from '@monorepo/ui-kit'
import InventoryDrawer from '../components/InventoryDrawer.vue'
import GenerateInventoryDialog from '../components/GenerateInventoryDialog.vue'

const { $t } = useI18n()
const appStore = useAppStore()
const { canPerformAction } = usePermission()

// ── 房型列表 ──
const roomTypeFilters = ref({
  page: 1,
  pageSize: 100,
  lang: appStore.locale as 'zh' | 'en',
  status: 1,
})

watch(
  () => appStore.locale,
  locale => {
    roomTypeFilters.value.lang = locale as 'zh' | 'en'
  }
)

const { data: roomTypeData, isLoading: isRoomTypeLoading } = useCRUD({
  queryKey: 'roomTypesForInventory',
  apiFns: {
    getList: (f: any) => roomTypeApi.getRoomTypes(f),
  },
  filters: roomTypeFilters,
})

const roomTypes = computed(() => (roomTypeData.value as any)?.data?.list ?? [])
const selectedRoomType = ref<string>('')

watch(
  () => roomTypes.value,
  newList => {
    if (newList.length > 0 && !selectedRoomType.value) {
      selectedRoomType.value = newList[0].roomTypeId
    }
  },
  { immediate: true }
)

const roomTypeOptions = computed(() =>
  roomTypes.value.map((rt: any) => ({
    label: rt.name?.[appStore.locale] || rt.name?.zh || rt.name,
    value: rt.roomTypeId,
  }))
)

// ── 當前選中房型物件（供 GenerateInventoryDialog 使用）──
const selectedRoomTypeObj = computed(
  () => roomTypes.value.find((rt: any) => rt.roomTypeId === selectedRoomType.value) ?? null
)

const selectedRoomTypeName = computed(
  () =>
    selectedRoomTypeObj.value?.name?.[appStore.locale] ||
    selectedRoomTypeObj.value?.name?.zh ||
    selectedRoomTypeObj.value?.name ||
    ''
)

const selectedRoomTypeImages = computed<Array<{ url: string }>>(
  () => selectedRoomTypeObj.value?.images ?? []
)

// ── 月份導航 ──
const currentMonth = ref(dayjs().startOf('month'))

const prevMonth = () => {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}
const nextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

const monthLabel = computed(() =>
  appStore.locale === 'en'
    ? currentMonth.value.format('MMMM YYYY')
    : `${currentMonth.value.year()} 年 ${currentMonth.value.month() + 1} 月`
)

// ── 庫存查詢 ──
const inventoryFilters = ref({
  page: 1,
  pageSize: 100,
  roomTypeId: selectedRoomType.value,
  startDate: currentMonth.value.format('YYYY-MM-DD'),
  endDate: currentMonth.value.endOf('month').format('YYYY-MM-DD'),
  lang: appStore.locale as string,
})

watch(selectedRoomType, val => {
  inventoryFilters.value.roomTypeId = val
  handleDrawerClose()
})

watch(currentMonth, val => {
  inventoryFilters.value.startDate = val.format('YYYY-MM-DD')
  inventoryFilters.value.endDate = val.endOf('month').format('YYYY-MM-DD')
})

watch(
  () => appStore.locale,
  locale => {
    inventoryFilters.value.lang = locale
  }
)

const {
  data: inventoryData,
  isLoading,
  refetch,
} = useCRUD({
  queryKey: 'inventoryList',
  apiFns: {
    getList: (f: any) => inventoryApi.getRoomInventory(f),
  },
  filters: inventoryFilters,
})

const inventoryList = computed(() => (inventoryData.value as any)?.data?.list ?? [])

const inventoryMap = computed(() => {
  const map = new Map<string, any>()
  for (const item of inventoryList.value) {
    map.set(item.targetDate, item)
  }
  return map
})

// ── 月曆網格 ──
const { weekDays } = useWeekDays()

const calendarDays = computed(() => {
  const days: dayjs.Dayjs[] = []
  const end = currentMonth.value.endOf('month')
  let cur = currentMonth.value
  while (!cur.isAfter(end)) {
    days.push(cur)
    cur = cur.add(1, 'day')
  }
  return days
})

const startDayOffset = computed(() => currentMonth.value.day())

// ── 格子狀態 ──
type CellStatus = 'available' | 'low' | 'full' | 'closed' | 'none'

function getCellStatus(date: dayjs.Dayjs): CellStatus {
  const item = inventoryMap.value.get(date.format('YYYY-MM-DD'))
  if (!item) return 'none'
  if (item.status === 0) return 'closed'
  const avail = (item as any).available ?? item.totalInventory
  const total = item.totalInventory
  if (!total || avail === 0) return 'full'
  if (avail / total <= 0.5) return 'low'
  return 'available'
}

const cellStyleMap: Record<CellStatus, { bg: string; border: string }> = {
  available: { bg: '#f0fdf4', border: '#86efac' },
  low: { bg: '#fff7ed', border: '#fdba74' },
  full: { bg: '#fef2f2', border: '#fca5a5' },
  closed: { bg: '#f1f5f9', border: '#cbd5e1' },
  none: { bg: '#f8fafc', border: '#e2e8f0' },
}

const cellTagTypeMap: Record<CellStatus, 'success' | 'warning' | 'danger' | 'info' | undefined> = {
  available: 'success',
  low: 'warning',
  full: 'danger',
  closed: 'info',
  none: undefined,
}

const cellTagLabelKeyMap: Record<CellStatus, string> = {
  available: 'inventory.statusOpen',
  low: 'inventory.legendLow',
  full: 'inventory.legendFull',
  closed: 'inventory.statusClosed',
  none: 'inventory.legendNone',
}

function getCellCardStyle(date: dayjs.Dayjs) {
  const s = getCellStatus(date)
  return {
    background: cellStyleMap[s].bg,
    '--el-card-border-color': cellStyleMap[s].border,
  }
}

const legendItems = computed(() => [
  { status: 'available' as CellStatus, label: $t('inventory.legendAvailable') },
  { status: 'low' as CellStatus, label: $t('inventory.legendLow') },
  { status: 'full' as CellStatus, label: $t('inventory.legendFull') },
  { status: 'closed' as CellStatus, label: $t('inventory.legendClosed') },
  { status: 'none' as CellStatus, label: $t('inventory.legendNone') },
])

// ── 生成庫存 Dialog ──
const generateDialogVisible = ref(false)

// ── 編輯抽屜 ──
const drawerVisible = ref(false)
const selectedDate = ref<dayjs.Dayjs | null>(null)
const selectedItem = ref<any | null>(null)

function handleDateClick(date: dayjs.Dayjs) {
  selectedDate.value = date
  selectedItem.value = inventoryMap.value.get(date.format('YYYY-MM-DD')) ?? null
  drawerVisible.value = true
}

function handleDrawerClose() {
  drawerVisible.value = false
  selectedDate.value = null
  selectedItem.value = null
}

function handleSaved() {
  drawerVisible.value = false
  refetch()
}
</script>

<template>
  <section class="tw-p-6">
    <!-- 標題 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">{{ $t('inventory.title') }}</h1>
    </div>

    <!-- 工具欄 -->
    <div
      class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
    >
      <!-- 房型選擇 -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-xs tw-text-slate-500">{{ $t('inventory.selectRoom') }}</span>
        <el-select
          v-model="selectedRoomType"
          :placeholder="$t('inventory.selectRoom')"
          :loading="isRoomTypeLoading"
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="opt in roomTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 分隔線 -->
      <div class="tw-h-6 tw-w-px tw-bg-slate-300" />

      <!-- 月份導航 -->
      <div class="tw-flex tw-items-center tw-gap-2">
        <hc-button type="primary" circle size="small" @click="prevMonth">
          <el-icon><ArrowLeft /></el-icon>
        </hc-button>
        <span class="tw-text-slate-800 tw-font-semibold tw-w-32 tw-text-center">{{
          monthLabel
        }}</span>
        <hc-button type="primary" circle size="small" @click="nextMonth">
          <el-icon><ArrowRight /></el-icon>
        </hc-button>
      </div>

      <!-- 生成庫存 -->
      <HcButton
        type="primary"
        v-if="canPerformAction('/inventory', 'update')"
        :disabled="!selectedRoomType"
        class="tw-ml-auto"
        @click="generateDialogVisible = true"
      >
        {{ $t('inventory.generate') }}
      </HcButton>
    </div>

    <!-- 月曆 -->
    <div
      v-if="selectedRoomType"
      v-loading="isLoading"
      class="tw-bg-white tw-rounded-lg tw-p-6 tw-border tw-border-slate-200"
    >
      <!-- 圖例 -->
      <div class="tw-flex tw-flex-wrap tw-gap-4 tw-mb-5 tw-justify-end">
        <div
          v-for="leg in legendItems"
          :key="leg.status"
          class="tw-flex tw-items-center tw-gap-1.5"
        >
          <div
            class="tw-w-3.5 tw-h-3.5 tw-rounded"
            :style="{
              background: cellStyleMap[leg.status].bg,
              border: `2px solid ${cellStyleMap[leg.status].border}`,
            }"
          />
          <span class="tw-text-xs tw-text-slate-500">{{ leg.label }}</span>
        </div>
      </div>

      <!-- 週標題 -->
      <div class="tw-grid tw-grid-cols-7 tw-gap-2 tw-mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="tw-text-center tw-font-bold tw-text-slate-500 tw-text-sm tw-py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期格 -->
      <div class="tw-grid tw-grid-cols-7 tw-gap-2">
        <!-- 起始偏移 -->
        <div v-for="n in startDayOffset" :key="'offset-' + n" />

        <el-card
          v-for="day in calendarDays"
          :key="day.toISOString()"
          shadow="hover"
          :body-style="{ padding: '10px', height: '100%', boxSizing: 'border-box' }"
          :style="getCellCardStyle(day)"
          class="tw-cursor-pointer"
          style="min-height: 100px"
          @click="handleDateClick(day)"
        >
          <template #default="{}">
            <!-- 使用 v-memo-like 局部變數避免重複 get -->
            <template v-if="inventoryMap.get(day.format('YYYY-MM-DD')) as any">
              <!-- eslint-disable-next-line vue/no-template-shadow -->
              <template
                v-for="cell in [inventoryMap.get(day.format('YYYY-MM-DD')) as any]"
                :key="0"
              >
                <!-- 日期 -->
                <div class="tw-text-xs tw-font-semibold tw-text-slate-500">{{ day.date() }}</div>
                <!-- 價格 -->
                <div v-if="cell.price != null" class="tw-text-xs tw-text-slate-600 tw-mt-0.5">
                  ${{ cell.price }}
                </div>
                <!-- 可用 / 總數 -->
                <div class="tw-text-sm tw-font-bold tw-text-slate-800 tw-mt-1">
                  {{ cell.available ?? cell.totalInventory }}
                  <span class="tw-text-xs tw-font-normal tw-text-slate-400">
                    / {{ cell.totalInventory }}
                  </span>
                </div>

                <!-- 狀態 tag -->
                <el-tag class="tw-mt-1" size="small" :type="cellTagTypeMap[getCellStatus(day)]">
                  {{ $t(cellTagLabelKeyMap[getCellStatus(day)]) }}
                </el-tag>
              </template>
            </template>

            <!-- 未生成提示 -->
            <template v-else>
              <div class="tw-text-xs tw-font-semibold tw-text-slate-500">{{ day.date() }}</div>
              <div class="tw-text-xs tw-text-slate-300 tw-mt-2 tw-text-center">—</div>
            </template>
          </template>
        </el-card>
      </div>

      <!-- 無資料提示 -->
      <div v-if="!isLoading && inventoryList.length === 0" class="tw-mt-6 tw-text-center">
        <p class="tw-text-slate-400 tw-text-sm">{{ $t('inventory.noInventory') }}</p>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="tw-text-center tw-py-12">
      <p class="tw-text-slate-500 tw-text-lg">{{ $t('common.noData') }}</p>
    </div>

    <!-- 編輯抽屜 -->
    <InventoryDrawer
      v-model="drawerVisible"
      :roomTypeId="selectedRoomType"
      :date="selectedDate"
      :item="selectedItem"
      @saved="handleSaved"
      @close="handleDrawerClose"
    />

    <!-- 生成庫存 Dialog -->
    <GenerateInventoryDialog
      v-model="generateDialogVisible"
      :roomTypeId="selectedRoomType"
      :roomTypeName="selectedRoomTypeName"
      :images="selectedRoomTypeImages"
      @saved="refetch"
    />
  </section>
</template>
