<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OrderStatus } from '@/types/api-params'
import { useI18n } from '@monorepo/composables'
import { HcButton, HcInput, HcSelect } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string
  orderStatus: OrderStatus | undefined
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:orderStatus': [val: OrderStatus | undefined]
  search: []
  reset: []
}>()

const { $t } = useI18n()

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

function onStatusChange(val: unknown) {
  emit('update:orderStatus', val as OrderStatus | undefined)
  emit('search')
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 訂單狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.order.filter.orderStatus') }}</span>
      <HcSelect
        :model-value="orderStatus"
        :placeholder="$t('shop.order.filter.all')"
        clearable
        style="width: 160px"
        @update:model-value="onStatusChange"
      >
        <el-option :label="$t('shop.order.status.pending')" value="pending" />
        <el-option :label="$t('shop.order.status.paid')" value="paid" />
        <el-option :label="$t('shop.order.status.cancelled')" value="cancelled" />
        <el-option :label="$t('shop.order.status.expired')" value="expired" />
      </HcSelect>
    </div>

    <!-- 搜尋 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('shop.order.filter.search') }}</span>
      <HcInput
        :model-value="localSearch"
        :placeholder="$t('shop.order.filter.searchPlaceholder')"
        clearable
        style="width: 240px"
        @update:model-value="onSearchInput"
      />
    </div>

    <!-- 按鈕群組 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton plain @click="emit('reset')">{{ $t('shop.order.filter.reset') }}</HcButton>
    </div>
  </div>
</template>
