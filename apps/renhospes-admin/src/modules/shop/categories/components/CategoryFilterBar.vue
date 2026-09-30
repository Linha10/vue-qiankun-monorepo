<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SeriesId, EnableStatus } from '@/types/api-params'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton, HcInput, HcSelect } from '@monorepo/ui-kit'

type OptionalEnableStatus = EnableStatus | undefined

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string
  seriesType: SeriesId | undefined
  status: OptionalEnableStatus
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:seriesType': [val: SeriesId | undefined]
  'update:status': [val: OptionalEnableStatus]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── Search debounce ────────────────────────────────────────────
const localSearch = ref(props.search)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.search,
  val => {
    if (val !== localSearch.value) localSearch.value = val
  }
)

function onSearchInput(val: string) {
  localSearch.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:search', val)
    emit('search')
  }, 400)
}

function onSeriesTypeChange(val: unknown) {
  emit('update:seriesType', val as SeriesId | undefined)
  emit('search')
}

function onStatusChange(val: unknown) {
  emit('update:status', val as OptionalEnableStatus)
  emit('search')
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 系列類型篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.category.filter.seriesType') }}</span>
      <HcSelect
        :model-value="seriesType"
        :placeholder="$t('shop.category.filter.all')"
        clearable
        style="width: 180px"
        @update:model-value="onSeriesTypeChange"
      >
        <el-option :label="$t('shop.category.seriesType.saffron')" value="series-saffron" />
        <el-option
          :label="$t('shop.category.seriesType.machupicchu')"
          value="series-machu-picchu"
        />
        <el-option :label="$t('shop.category.seriesType.marrakesh')" value="series-marrakesh" />
      </HcSelect>
    </div>

    <!-- 狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.category.filter.status') }}</span>
      <HcSelect
        :model-value="status"
        :placeholder="$t('shop.category.filter.all')"
        clearable
        style="width: 130px"
        @update:model-value="onStatusChange"
      >
        <el-option :label="$t('common.enable')" :value="1" />
        <el-option :label="$t('common.disable')" :value="0" />
      </HcSelect>
    </div>

    <!-- 關鍵字搜尋 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.category.filter.search') }}</span>
      <HcInput
        :model-value="localSearch"
        :placeholder="$t('shop.category.filter.searchPlaceholder')"
        clearable
        style="width: 200px"
        @update:model-value="onSearchInput"
        @clear="
          () => {
            emit('update:search', '')
            emit('search')
          }
        "
      />
    </div>

    <!-- 按鈕區 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto tw-items-end">
      <HcButton plain @click="emit('reset')">{{ $t('shop.category.filter.reset') }}</HcButton>
      <HcButton
        type="primary"
        v-if="canPerformAction('/shop/categories', 'create')"
        @click="emit('create')"
        >{{ $t('shop.category.filter.create') }}</HcButton
      >
    </div>
  </div>
</template>
