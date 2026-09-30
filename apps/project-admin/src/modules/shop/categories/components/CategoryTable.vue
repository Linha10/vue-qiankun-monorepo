<script setup lang="ts">
import { useI18n, usePermission } from '@monorepo/composables'
import type { CategoryItem } from '@/types/api-params'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: CategoryItem[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  view: [row: CategoryItem]
  edit: [row: CategoryItem]
  delete: [row: CategoryItem]
  statusChange: [row: CategoryItem, val: 0 | 1]
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── Table columns ──────────────────────────────────────────────
const columns = computed(() => [
  { prop: 'actions', label: $t('common.actions'), width: 150, fixed: true },
  { prop: 'name', label: $t('shop.category.table.name'), minWidth: 120 },
  { prop: 'description', label: $t('shop.category.table.description'), minWidth: 120 },
  { prop: 'seriesType', label: $t('shop.category.table.seriesType'), minWidth: 160 },
  { prop: 'seriesKey', label: $t('shop.category.table.seriesKey'), minWidth: 130 },
  { prop: 'sort', label: $t('shop.category.table.sort'), width: 80, align: 'center' as const },
  {
    prop: 'status',
    label: $t('shop.category.table.status'),
    width: 100,
    align: 'center' as const,
  },
])

const SERIES_LABEL_KEY: Record<string, string> = {
  'series-saffron': 'shop.category.seriesType.saffron',
  'series-machu-picchu': 'shop.category.seriesType.machupicchu',
  'series-marrakesh': 'shop.category.seriesType.marrakesh',
}

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asCategory(row: unknown) {
  return row as CategoryItem
}
</script>

<template>
  <div v-loading="loading">
    <HcTable
      :data="data"
      :columns="columns"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 操作欄（固定左） -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-1">
          <el-tooltip :content="$t('common.view')" placement="top">
            <HcButton text type="info" size="small" @click="emit('view', asCategory(scope))">
              <i class="fa-solid fa-eye" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.edit')" placement="top">
            <HcButton
              text
              type="primary"
              size="small"
              v-if="canPerformAction('/shop/categories', 'update')"
              @click="emit('edit', asCategory(scope))"
            >
              <i class="fa-solid fa-pen" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.delete')" placement="top">
            <HcButton
              text
              type="danger"
              size="small"
              v-if="canPerformAction('/shop/categories', 'delete')"
              @click="emit('delete', asCategory(scope))"
            >
              <i class="fa-solid fa-trash" />
            </HcButton>
          </el-tooltip>
        </div>
      </template>

      <!-- 系列類型（翻譯顯示） -->
      <template #seriesType="{ scope }">
        <span>{{
          SERIES_LABEL_KEY[scope.seriesType]
            ? $t(SERIES_LABEL_KEY[scope.seriesType])
            : scope.seriesType
        }}</span>
      </template>

      <!-- 狀態 pill（固定右） -->
      <template #status="{ scope }">
        <HcSwitch
          :model-value="scope.status"
          :active-value="1"
          :inactive-value="0"
          @change="emit('statusChange', asCategory(scope), $event as 0 | 1)"
        />
      </template>
    </HcTable>
  </div>
</template>
