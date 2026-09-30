<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SeriesId } from '@/types/api-params'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton, HcInput, HcSelect } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string
  seriesId: SeriesId | undefined
  isActive: boolean | undefined
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:seriesId': [val: SeriesId | undefined]
  'update:isActive': [val: boolean | undefined]
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

function onSeriesIdChange(val: unknown) {
  emit('update:seriesId', val as SeriesId | undefined)
  emit('search')
}

function onIsActiveChange(val: unknown) {
  emit('update:isActive', val as boolean | undefined)
  emit('search')
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 系列篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.product.filter.seriesId') }}</span>
      <HcSelect
        :model-value="seriesId"
        :placeholder="$t('shop.product.filter.all')"
        clearable
        style="width: 180px"
        @update:model-value="onSeriesIdChange"
      >
        <el-option :label="$t('shop.category.seriesType.saffron')" value="series-saffron" />
        <el-option
          :label="$t('shop.category.seriesType.machupicchu')"
          value="series-machu-picchu"
        />
        <el-option :label="$t('shop.category.seriesType.marrakesh')" value="series-marrakesh" />
      </HcSelect>
    </div>

    <!-- 上架狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.product.filter.isActive') }}</span>
      <HcSelect
        :model-value="isActive"
        :placeholder="$t('shop.product.filter.all')"
        clearable
        style="width: 140px"
        @update:model-value="onIsActiveChange"
      >
        <el-option :label="$t('shop.product.filter.active')" :value="true" />
        <el-option :label="$t('shop.product.filter.inactive')" :value="false" />
      </HcSelect>
    </div>

    <!-- 搜尋 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.product.filter.search') }}</span>
      <HcInput
        :model-value="localSearch"
        :placeholder="$t('shop.product.filter.searchPlaceholder')"
        clearable
        style="width: 220px"
        @update:model-value="onSearchInput"
      />
    </div>

    <!-- 按鈕群組 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton plain @click="emit('reset')">{{ $t('shop.product.filter.reset') }}</HcButton>
      <HcButton
        type="primary"
        v-if="canPerformAction('/shop/products', 'create')"
        @click="emit('create')"
      >
        <i class="fa-solid fa-plus tw-mr-1" />
        {{ $t('shop.product.filter.create') }}
      </HcButton>
    </div>
  </div>
</template>
