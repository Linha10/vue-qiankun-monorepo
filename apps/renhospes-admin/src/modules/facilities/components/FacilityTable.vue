<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useQueryClient } from '@tanstack/vue-query'
import { useI18n, usePermission } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { facilitiesApi } from '@/api/facilities'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'
import type { TableColumn } from '@monorepo/ui-kit'
import type { FacilityCategoryItem } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: FacilityCategoryItem[]
  total: number
  loading: boolean
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  edit: [row: FacilityCategoryItem]
  delete: [row: FacilityCategoryItem]
}>()

// ── i18n / store ───────────────────────────────────────────────
const { $t } = useI18n()
const appStore = useAppStore()
const queryClient = useQueryClient()
const { canPerformAction } = usePermission()

// ── 啟用狀態切換 ──────────────────────────────────────────────
const loadingIds = ref(new Set<string>())
// Optimistic UI：TanStack Query 快取物件非 Vue 響應式，用獨立 map 驅動視覺更新
const pendingStatusMap = ref<Record<string, 0 | 1>>({})

async function handleToggleStatus(row: FacilityCategoryItem) {
  if (loadingIds.value.has(row.facilityId)) return
  const newStatus = (row.status === 1 ? 0 : 1) as 0 | 1
  // 立即更新視覺（optimistic）
  pendingStatusMap.value[row.facilityId] = newStatus
  loadingIds.value.add(row.facilityId)
  try {
    await facilitiesApi.updateFacility(row.facilityId, {
      name: row.jsonName,
      category: row.jsonCategory,
      code: row.code,
      icon: row.icon,
      status: newStatus,
    })
    await queryClient.invalidateQueries({ queryKey: ['facilitiesList'] })
  } catch {
    ElMessage.error($t('facilities.toggleStatus.error'))
  } finally {
    loadingIds.value.delete(row.facilityId)
    delete pendingStatusMap.value[row.facilityId]
  }
}

// ── 欄位定義 ──────────────────────────────────────────────────
const columns = computed<TableColumn[]>(() => [
  {
    prop: 'actions',
    label: $t('facilities.columns.actions'),
    width: 140,
    align: 'center',
    fixed: 'right',
  },
  { prop: 'icon', label: $t('facilities.columns.icon'), width: 120, align: 'center' },
  { prop: 'name', label: $t('facilities.columns.name'), minWidth: 20 },
  { prop: 'code', label: $t('facilities.columns.code'), minWidth: 40 },
  { prop: 'category', label: $t('facilities.columns.category'), minWidth: 40 },
  {
    prop: 'enableStatus',
    label: $t('facilities.columns.enableStatus'),
    width: 110,
    align: 'center',
  },
])

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asFacility(row: unknown) {
  return row as FacilityCategoryItem
}
</script>

<template>
  <div class="tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm">
    <HcTable
      v-loading="loading"
      :data="data"
      :columns="columns"
      :total="total"
      :page="page"
      :page-size="pageSize"
      stripe
      row-key="facilityId"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 圖示 -->
      <template #icon="{ scope }">
        <i v-if="scope.icon" :class="`fas ${scope.icon}`" style="font-size: 16px" />
        <span v-else class="tw-text-slate-300">—</span>
      </template>

      <!-- 名稱（顯示當前語系） -->
      <template #name="{ scope }">
        {{ scope.jsonName?.[appStore.locale] ?? scope.name ?? '—' }}
      </template>

      <!-- 分類（顯示當前語系） -->
      <template #category="{ scope }">
        {{ scope.jsonCategory?.[appStore.locale] ?? scope.category ?? '—' }}
      </template>

      <!-- 狀態 -->
      <template #enableStatus="{ scope }">
        <HcSwitch
          :model-value="(pendingStatusMap[scope.facilityId] ?? scope.status) === 1"
          :loading="loadingIds.has(scope.facilityId)"
          :disabled="loadingIds.has(scope.facilityId)"
          @change="handleToggleStatus(asFacility(scope))"
        />
      </template>

      <!-- 操作 -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-2 tw-justify-center">
          <HcButton
            type="primary"
            link
            size="small"
            v-if="canPerformAction('/facilities', 'update')"
            @click="emit('edit', asFacility(scope))"
          >
            {{ $t('common.edit') }}
          </HcButton>
        </div>
      </template>
    </HcTable>
  </div>
</template>
