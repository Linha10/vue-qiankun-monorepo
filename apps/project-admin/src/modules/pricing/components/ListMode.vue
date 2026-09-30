<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCRUD, useI18n, usePermission } from '@monorepo/composables'
import { pricingApi } from '@/api/pricing'
import { HcTable, HcButton } from '@monorepo/ui-kit'
import PricingDrawer from './PricingDrawer.vue'
import type { TableColumn } from '@monorepo/ui-kit'

interface Props {
  roomTypeId: string
  roomData: any
}

const props = defineProps<Props>()
const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── 日期範圍篩選 ──
const dateRange = ref<any>(null)

// 初始化日期範圍 (本月)
function initDateRange() {
  dateRange.value = [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
}

initDateRange()

// ── 查詢定價規則 ──
const filters = ref({
  page: 1,
  pageSize: 20,
  roomTypeId: props.roomTypeId,
  startDate: '',
  endDate: '',
})

watch(
  () => dateRange.value,
  newRange => {
    if (newRange) {
      filters.value.startDate = dayjs(newRange[0]).format('YYYY-MM-DD')
      filters.value.endDate = dayjs(newRange[1]).format('YYYY-MM-DD')
      filters.value.page = 1
    }
  },
  { deep: true, immediate: true }
)

const {
  data: pricingData,
  isLoading,
  refetch,
} = useCRUD({
  queryKey: 'pricingRulesList',
  apiFns: {
    getList: f => pricingApi.getRoomPriceRulesByDate(f),
  },
  filters,
})

const list = computed(() => (pricingData.value as any)?.data?.list ?? [])
const pagination = computed(() => (pricingData.value as any)?.data?.pagination ?? {})

// ── 表格列定義 ──
const columns: TableColumn[] = [
  { prop: 'ruleDate', label: $t('pricing.ruleDate'), minWidth: 140, sortable: true },
  {
    prop: 'multiplier',
    label: $t('pricing.multiplier'),
    minWidth: 100,
    align: 'right',
  },
  {
    prop: 'fixedAmount',
    label: $t('pricing.fixedAmount'),
    minWidth: 120,
    align: 'right',
  },
  {
    prop: 'finalPrice',
    label: $t('pricing.finalPrice'),
    minWidth: 120,
    align: 'right',
  },
  { prop: 'actions', label: $t('common.actions'), minWidth: 150, align: 'center', fixed: 'right' },
]

// ── 處理表格數據 ──
const tableData = computed(() =>
  list.value.map((item: any) => ({
    ...item,
    fixedAmount: `NT$ ${item.fixedAmount ?? 0}`,
    multiplier: `${item.multiplier ?? 100} %`,
    finalPrice: `NT$ ${calculateFinalPrice(item)}`,
  }))
)

function calculateFinalPrice(rule: any) {
  const base = props.roomData?.basePrice || 0
  const m = rule.multiplier ?? 100
  const f = rule.fixedAmount ?? 0
  return Math.round((base * (m / 100) + f) * 100) / 100
}

// ── 編輯抽屜 ──
const drawerVisible = ref(false)
const selectedDate = ref<Date | null>(null)
const editingRule = ref<any>(null)

function handleEdit(row: any) {
  editingRule.value = list.value.find((r: any) => r.ruleDate === row.ruleDate) || null
  selectedDate.value = new Date(row.ruleDate + 'T00:00:00')
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
}

watch(
  () => props.roomTypeId,
  newRoomTypeId => {
    filters.value.roomTypeId = newRoomTypeId
    filters.value.page = 1
    handleDrawerClose()
    refetch()
  }
)

// ── 刪除操作 ──
async function handleDelete(row: any) {
  const rule = list.value.find((r: any) => r.ruleDate === row.ruleDate)
  if (!rule?.id) return

  try {
    await ElMessageBox.confirm(
      $t('messages.deleteConfirm', { name: row.ruleDate }),
      $t('dialog.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: $t('dialog.confirmDelete'),
        cancelButtonText: $t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
      }
    )
  } catch {
    return
  }

  try {
    await pricingApi.deleteRoomPriceRuleByDate(rule.id)
    ElMessage.success($t('messages.deleteSuccess'))
    refetch()
  } catch {
    ElMessage.error($t('messages.deleteFailed'))
  }
}

// ── 分頁處理 ──
function handlePageChange(page: number) {
  filters.value.page = page
}

function handlePageSizeChange(pageSize: number) {
  filters.value.pageSize = pageSize
  filters.value.page = 1
}
</script>

<template>
  <div v-loading="isLoading" class="tw-space-y-4">
    <!-- 篩選工具欄 -->
    <div
      class="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-slate-200 tw-flex tw-items-center tw-gap-4"
    >
      <label class="tw-text-slate-700 tw-font-medium">{{ $t('pricing.dateRange') }}:</label>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :range-separator="$t('pricing.rangeSeparator')"
        :start-placeholder="$t('pricing.startDate')"
        :end-placeholder="$t('pricing.endDate')"
        class="tw-flex-1"
      />
    </div>

    <!-- 表格 -->
    <div class="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-overflow-hidden">
      <HcTable
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #actions="{ scope }: any">
          <div class="tw-flex tw-gap-2 tw-justify-center">
            <hc-button
              type="primary"
              size="small"
              v-if="canPerformAction('/pricing', 'update')"
              @click="handleEdit(scope)"
            >
              {{ $t('common.edit') }}
            </hc-button>
            <hc-button
              type="danger"
              size="small"
              v-if="canPerformAction('/pricing', 'delete')"
              @click="handleDelete(scope)"
            >
              {{ $t('common.delete') }}
            </hc-button>
          </div>
        </template>
      </HcTable>
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
