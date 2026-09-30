<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useQueryClient } from '@tanstack/vue-query'
import { useI18n, usePermission } from '@monorepo/composables'
import { promotionApi } from '@/api/promotion'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'
import type { TableColumn } from '@monorepo/ui-kit'
import type { PromotionListResponseItem } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  data: PromotionListResponseItem[]
  total: number
  loading: boolean
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  edit: [row: PromotionListResponseItem]
  delete: [row: PromotionListResponseItem]
}>()

// ── i18n ───────────────────────────────────────────────────────
const { $t } = useI18n()
const queryClient = useQueryClient()
const { canPerformAction } = usePermission()

// ── 狀態切換（status: 1=上架 ↔ 2=下架）─────────────────────────
const loadingIds = ref(new Set<string>())
const pendingStatusMap = ref<Record<string, 1 | 2>>({})

async function handleToggleStatus(row: PromotionListResponseItem) {
  if (loadingIds.value.has(row.id)) return
  const newStatus = (row.status === 1 ? 2 : 1) as 1 | 2
  pendingStatusMap.value[row.id] = newStatus
  loadingIds.value.add(row.id)
  try {
    // 取得完整詳情（API 需帶回所有欄位）
    const detailRes = await promotionApi.getPromotionDetail(row.id)
    const detail = (detailRes as any)?.data

    const fd = new FormData()
    fd.append('hotelId', (detail?.hotelId as string) ?? '')
    fd.append('title', JSON.stringify(detail?.jsonTitle ?? { zh: row.title, en: '' }))
    fd.append('subtitle', JSON.stringify(detail?.jsonSubtitle ?? { zh: '', en: '' }))
    fd.append('tag', JSON.stringify(detail?.jsonTag ?? { zh: '', en: '' }))
    fd.append('content', JSON.stringify(detail?.jsonContent ?? { zh: '', en: '' }))
    fd.append('metaTitle', JSON.stringify(detail?.jsonMetaTitle ?? { zh: '', en: '' }))
    fd.append('metaDescription', JSON.stringify(detail?.jsonMetaDescription ?? { zh: '', en: '' }))
    fd.append('imageAlt', JSON.stringify(detail?.jsonImageAlt ?? { zh: '', en: '' }))
    fd.append('typeId', String(detail?.typeId ?? row.typeId))
    fd.append('top', String(detail?.top ?? row.top))
    fd.append('sort', String(detail?.sort ?? row.sort))
    fd.append('startTime', detail?.startTime ?? row.startTime)
    fd.append('endTime', detail?.endTime ?? row.endTime)
    fd.append('url', detail?.url ?? row.url ?? '')
    fd.append('status', String(newStatus))

    await promotionApi.updatePromotion(row.id, fd)
    await queryClient.invalidateQueries({ queryKey: ['promotionsList'] })
  } catch {
    ElMessage.error($t('promotion.toggleStatus.error'))
  } finally {
    loadingIds.value.delete(row.id)
    delete pendingStatusMap.value[row.id]
  }
}

// ── 欄位定義 ──────────────────────────────────────────────────
const columns = computed<TableColumn[]>(() => [
  {
    prop: 'actions',
    label: $t('promotion.columns.actions'),
    width: 140,
    align: 'center',
    fixed: 'right',
  },
  { prop: 'image', label: $t('promotion.columns.image'), width: 100, align: 'center' },
  { prop: 'title', label: $t('promotion.columns.title'), minWidth: 120 },
  { prop: 'typeId', label: $t('promotion.columns.typeId'), width: 110, align: 'center' },
  { prop: 'top', label: $t('promotion.columns.top'), width: 120, align: 'center' },
  { prop: 'sort', label: $t('promotion.columns.sort'), width: 120, align: 'center' },
  { prop: 'startTime', label: $t('promotion.columns.startTime'), width: 160 },
  { prop: 'endTime', label: $t('promotion.columns.endTime'), width: 160 },
  {
    prop: 'enableStatus',
    label: $t('promotion.columns.enableStatus'),
    width: 110,
    align: 'center',
  },
])

const TYPE_LABELS: Record<number, string> = {
  1: 'promotion.typeId.1',
  2: 'promotion.typeId.2',
  3: 'promotion.typeId.3',
}

// ISO 8601 ("2026-07-01T13:12:48+08:00") → "YYYY-MM-DD HH:mm:ss"
function formatDateTime(iso: string): string {
  if (!iso) return '—'
  return iso
    .replace('T', ' ')
    .replace(/[+-]\d{2}:\d{2}$|Z$/, '')
    .slice(0, 19)
}

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asPromotion(row: unknown) {
  return row as PromotionListResponseItem
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
      row-key="id"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 封面圖 -->
      <template #image="{ scope }">
        <el-image
          v-if="scope.image"
          :src="scope.image"
          fit="cover"
          style="width: 60px; height: 40px; border-radius: 4px"
          :preview-src-list="[scope.image]"
          preview-teleported
        />
        <span v-else class="tw-text-gray-300 tw-text-xs">—</span>
      </template>

      <!-- 標題 -->
      <template #title="{ scope }">
        <span class="tw-font-medium tw-line-clamp-2">{{ scope.title }}</span>
      </template>

      <!-- 類型 -->
      <template #typeId="{ scope }">
        <el-tag size="small" type="info" effect="plain">
          {{ $t(TYPE_LABELS[scope.typeId] ?? 'promotion.typeId.0') }}
        </el-tag>
      </template>

      <!-- 置頂 -->
      <template #top="{ scope }">
        <el-tag v-if="scope.top === 1" size="small" type="warning" effect="dark">
          <i class="fa-solid fa-thumbtack tw-mr-1" />{{ $t('promotion.form.top') }}
        </el-tag>
        <span v-else class="tw-text-gray-400 tw-text-xs">—</span>
      </template>

      <!-- 上架時間 -->
      <template #startTime="{ scope }">
        <el-tooltip :content="scope.startTime" placement="top" effect="dark">
          <span class="tw-text-sm tw-whitespace-nowrap">{{ formatDateTime(scope.startTime) }}</span>
        </el-tooltip>
      </template>

      <!-- 下架時間 -->
      <template #endTime="{ scope }">
        <el-tooltip :content="scope.endTime" placement="top" effect="dark">
          <span class="tw-text-sm tw-whitespace-nowrap">{{ formatDateTime(scope.endTime) }}</span>
        </el-tooltip>
      </template>

      <!-- 啟用狀態切換 -->
      <template #enableStatus="{ scope }">
        <HcSwitch
          :model-value="(pendingStatusMap[scope.id] ?? scope.status) === 1"
          :loading="loadingIds.has(scope.id)"
          :disabled="loadingIds.has(scope.id)"
          @change="handleToggleStatus(asPromotion(scope))"
        />
      </template>

      <!-- 操作按鈕 -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-2 tw-justify-center">
          <HcButton
            size="small"
            v-if="canPerformAction('/promotion', 'update')"
            @click="emit('edit', asPromotion(scope))"
          >
            {{ $t('button.edit') }}
          </HcButton>
          <HcButton
            size="small"
            type="danger"
            plain
            v-if="canPerformAction('/promotion', 'delete')"
            @click="emit('delete', asPromotion(scope))"
          >
            {{ $t('button.delete') }}
          </HcButton>
        </div>
      </template>
    </HcTable>
  </div>
</template>
