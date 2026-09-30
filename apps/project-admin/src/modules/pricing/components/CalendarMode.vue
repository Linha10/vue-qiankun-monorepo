<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useCRUD, useI18n, useWeekDays } from '@monorepo/composables'
import { pricingApi } from '@/api/pricing'
import PricingDrawer from './PricingDrawer.vue'

interface Props {
  roomTypeId: string
  roomData: any
}

const props = defineProps<Props>()
const { $t } = useI18n()

// ── 日期範圍選擇 ──
const dateRange = ref<any>(null)
const shortcuts = computed(() => [
  {
    text: $t('pricing.thisMonth'),
    value: () => [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  },
  {
    text: $t('pricing.nextMonth'),
    value: () => [
      dayjs().add(1, 'month').startOf('month').toDate(),
      dayjs().add(1, 'month').endOf('month').toDate(),
    ],
  },
])

// 初始化日期範圍 (本月)
function initDateRange() {
  dateRange.value = [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
}

initDateRange()

// ── 查詢定價規則 ──
const pricingFilters = ref({
  page: 1,
  pageSize: 1000,
  roomTypeId: props.roomTypeId,
  startDate: '',
  endDate: '',
})

watch(
  () => dateRange.value,
  newRange => {
    if (newRange) {
      pricingFilters.value.startDate = dayjs(newRange[0]).format('YYYY-MM-DD')
      pricingFilters.value.endDate = dayjs(newRange[1]).format('YYYY-MM-DD')
    }
  },
  { deep: true, immediate: true }
)

const {
  data: pricingData,
  isLoading,
  refetch,
} = useCRUD({
  queryKey: 'pricingRules',
  apiFns: {
    getList: f => pricingApi.getRoomPriceRulesByDate(f),
  },
  filters: pricingFilters,
})

const pricingRules = computed(() => (pricingData.value as any)?.data?.list ?? [])

// ── 週規則載入 ──
const weeklyRulesMap = ref<Map<number, any>>(new Map())
const isSwitchingRoomType = ref(false)

async function loadWeeklyRules() {
  const results = await Promise.allSettled(
    Array.from({ length: 7 }, (_, day) =>
      pricingApi.getRoomPriceRulesByWeek({
        page: 1,
        pageSize: 1,
        roomTypeId: props.roomTypeId,
        dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      })
    )
  )
  results.forEach((result, day) => {
    if (result.status === 'fulfilled') {
      const rules = (result.value as any)?.data?.list ?? []
      if (rules.length > 0) {
        weeklyRulesMap.value.set(day, rules[0])
      } else {
        weeklyRulesMap.value.delete(day)
      }
    }
  })
}

onMounted(() => {
  loadWeeklyRules()
})

// ── 日曆網格生成 ──
const calendarDays = computed(() => {
  if (!dateRange.value) return []
  const [start, end] = dateRange.value
  const days = []
  let current = dayjs(start)
  const endDay = dayjs(end)

  while (!current.isAfter(endDay)) {
    days.push(current.toDate())
    current = current.add(1, 'day')
  }

  return days
})

// ── 規則查詢輔助函數 ──
function getDateRule(date: Date) {
  const dateStr = dayjs(date).format('YYYY-MM-DD')
  return pricingRules.value.find((rule: any) => rule.ruleDate === dateStr) ?? null
}

function getWeeklyRule(date: Date) {
  return weeklyRulesMap.value.get(dayjs(date).day()) ?? null
}

function calcPrice(base: number, rule: any) {
  const m = rule.multiplier ?? 100
  const f = rule.fixedAmount ?? 0
  return Math.round((base * (m / 100) + f) * 100) / 100
}

function getDisplayPrice(date: Date) {
  const base = props.roomData?.basePrice || 0
  const dateRule = getDateRule(date)
  if (dateRule) return calcPrice(base, dateRule)
  const weekRule = getWeeklyRule(date)
  if (weekRule) return calcPrice(base, weekRule)
  return base
}

// 'date' = 日期規則(綠), 'week' = 週規則(藍), 'basic' = 無規則
function getPriceSource(date: Date): 'date' | 'week' | 'basic' {
  if (getDateRule(date)) return 'date'
  if (getWeeklyRule(date)) return 'week'
  return 'basic'
}

const priceSourceStyleMap = {
  date: { border: '#86efac', bg: '#f0fdf4' },
  week: { border: '#93c5fd', bg: '#eff6ff' },
  basic: { border: undefined, bg: '#f8fafc' },
} as const

// ── 編輯抽屜 ──
const drawerVisible = ref(false)
const selectedDate = ref<Date | null>(null)
const editingRule = ref<any>(null)

function handleDateClick(date: Date) {
  selectedDate.value = new Date(date)
  editingRule.value = getDateRule(date) || null
  drawerVisible.value = true
}

function handleDrawerClose() {
  drawerVisible.value = false
  selectedDate.value = null
  editingRule.value = null
}

function handleRuleSaved() {
  drawerVisible.value = false
  refetch()
  loadWeeklyRules()
}

watch(
  () => props.roomTypeId,
  async newRoomTypeId => {
    isSwitchingRoomType.value = true
    pricingFilters.value.roomTypeId = newRoomTypeId
    pricingFilters.value.page = 1
    handleDrawerClose()
    try {
      await Promise.all([refetch(), loadWeeklyRules()])
    } finally {
      isSwitchingRoomType.value = false
    }
  }
)

const { weekDays } = useWeekDays()

// 起始日期是星期幾 (0=日, 1=一, ...) → 用於前面補空白格
const startDayOffset = computed(() => {
  if (!calendarDays.value.length) return 0
  return dayjs(calendarDays.value[0]).day()
})
</script>

<template>
  <div
    v-loading="isLoading || isSwitchingRoomType"
    class="tw-bg-white tw-rounded-lg tw-p-6 tw-border tw-border-slate-200"
  >
    <!-- 日期範圍選擇 -->
    <div class="tw-mb-6">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :range-separator="'-'"
        :start-placeholder="$t('pricing.startDate')"
        :end-placeholder="$t('pricing.endDate')"
        :shortcuts="shortcuts"
        style="width: 100%"
      />
    </div>

    <!-- 日曆網格 -->
    <div class="tw-space-y-4">
      <!-- 週標題 -->
      <div class="tw-grid tw-grid-cols-7 tw-gap-2 tw-mb-4">
        <div
          v-for="day in weekDays"
          :key="day"
          class="tw-text-center tw-font-bold tw-text-slate-700 tw-py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期網格 -->
      <div class="tw-grid tw-grid-cols-7 tw-gap-2">
        <!-- 起始日期前的空白偏移格 -->
        <div v-for="n in startDayOffset" :key="'offset-' + n" />

        <el-card
          v-for="day in calendarDays"
          :key="day.toISOString()"
          shadow="hover"
          @click="handleDateClick(day)"
          :body-style="{ padding: '10px', height: '100%', boxSizing: 'border-box' }"
          class="tw-cursor-pointer"
          style="height: 110px"
          :style="{
            '--el-card-border-color': priceSourceStyleMap[getPriceSource(day)].border,
            background: priceSourceStyleMap[getPriceSource(day)].bg,
          }"
        >
          <div class="tw-text-xs tw-font-semibold tw-text-slate-500">{{ day.getDate() }}</div>
          <div class="tw-text-xs tw-text-slate-400 tw-mt-1">
            {{ $t('pricing.basePriceShort') }} NT$ {{ roomData.basePrice || 0 }}
          </div>
          <div class="tw-text-sm tw-font-bold tw-text-slate-800 tw-mt-1">
            NT$ {{ getDisplayPrice(day) }}
          </div>
        </el-card>
      </div>
    </div>

    <!-- 編輯抽屜 -->
    <PricingDrawer
      v-model="drawerVisible"
      :roomTypeId="roomTypeId"
      :roomData="roomData"
      :selectedDate="selectedDate"
      :editingRule="editingRule"
      @rule-saved="handleRuleSaved"
      @close="handleDrawerClose"
    />
  </div>
</template>
