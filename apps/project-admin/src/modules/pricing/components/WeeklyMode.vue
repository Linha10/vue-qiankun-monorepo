<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from '@monorepo/composables'
import { pricingApi } from '@/api/pricing'
import PricingDrawer from './PricingDrawer.vue'

interface Props {
  roomTypeId: string
  roomData: any
}

const props = defineProps<Props>()
const { $t } = useI18n()

// ── 星期定義（響應 locale 變更）──
const weekDays = computed(() => [
  { value: 0, label: $t('pricing.sunday') },
  { value: 1, label: $t('pricing.monday') },
  { value: 2, label: $t('pricing.tuesday') },
  { value: 3, label: $t('pricing.wednesday') },
  { value: 4, label: $t('pricing.thursday') },
  { value: 5, label: $t('pricing.friday') },
  { value: 6, label: $t('pricing.saturday') },
])

// ── 查詢星期定價規則 ──
const weeklyRulesMap = ref<Map<number, any>>(new Map())
const isLoading = ref(false)

async function loadWeeklyRules() {
  isLoading.value = true
  weeklyRulesMap.value.clear()
  try {
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
        }
      }
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadWeeklyRules()
})

watch(
  () => props.roomTypeId,
  () => {
    handleDrawerClose()
    weeklyRulesMap.value.clear()
    loadWeeklyRules()
  }
)

// ── 獲取星期規則 ──
function getRuleForDay(dayOfWeek: number) {
  return weeklyRulesMap.value.get(dayOfWeek) || null
}

function getDisplayPrice(dayOfWeek: number) {
  const rule = getRuleForDay(dayOfWeek)
  if (!rule) return props.roomData?.basePrice || 0
  const base = props.roomData?.basePrice || 0
  const m = rule.multiplier ?? 100
  const f = rule.fixedAmount ?? 0
  return Math.round((base * (m / 100) + f) * 100) / 100
}

function getPriceTypeLabel(dayOfWeek: number) {
  const rule = getRuleForDay(dayOfWeek)
  if (!rule) return $t('pricing.useBasicPrice')
  if (rule.fixedAmount) return $t('pricing.priceFixed')
  return $t('pricing.priceMultiplier')
}

// ── 編輯抽屜 ──
const drawerVisible = ref(false)
const selectedDay = ref<number | null>(null)
const selectedDate = ref<Date | null>(null)
const editingRule = ref<any>(null)

function handleCardClick(dayOfWeek: number) {
  selectedDay.value = dayOfWeek
  editingRule.value = getRuleForDay(dayOfWeek) || null

  // 計算該星期的一個日期（用於顯示在抽屜中）
  selectedDate.value = dayjs().day(dayOfWeek).toDate()

  drawerVisible.value = true
}

function handleDrawerClose() {
  drawerVisible.value = false
  selectedDay.value = null
  selectedDate.value = null
  editingRule.value = null
}

function handleRuleSaved() {
  handleDrawerClose()
  loadWeeklyRules()
}
</script>

<template>
  <div v-loading="isLoading" class="tw-space-y-6">
    <!-- 週規則卡片網格 -->
    <div class="tw-grid tw-grid-cols-7 tw-gap-4">
      <el-card
        v-for="day in weekDays"
        :key="day.value"
        shadow="hover"
        class="tw-cursor-pointer tw-transition-all"
        @click="handleCardClick(day.value)"
      >
        <!-- 星期標題 -->
        <div class="tw-text-lg tw-font-bold tw-text-slate-800 tw-mb-4">{{ day.label }}</div>

        <!-- 價格顯示 -->
        <div class="tw-mb-3">
          <div class="tw-text-sm tw-text-slate-600 tw-mb-1">{{ $t('pricing.finalPrice') }}</div>
          <div class="tw-text-2xl tw-font-bold tw-text-color-primary-800">
            NT$ {{ getDisplayPrice(day.value) }}
          </div>
        </div>

        <!-- 規則類型 -->
        <div class="tw-flex tw-items-center tw-gap-2 tw-pt-3 tw-border-t tw-border-slate-200">
          <div
            :class="[
              'tw-w-2 tw-h-2 tw-rounded-full',
              getRuleForDay(day.value) ? 'tw-bg-green-500' : 'tw-bg-slate-300',
            ]"
          />
          <span class="tw-text-xs tw-text-slate-600">{{ getPriceTypeLabel(day.value) }}</span>
        </div>
      </el-card>
    </div>

    <!-- WeeklyMode 用的 PricingDrawer -->
    <PricingDrawer
      v-model="drawerVisible"
      :roomTypeId="roomTypeId"
      :roomData="roomData"
      :selectedDate="selectedDate"
      :editingRule="editingRule"
      :dayOfWeek="selectedDay ?? undefined"
      @rule-saved="handleRuleSaved"
      @close="handleDrawerClose"
    />
  </div>
</template>
