<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string
  typeId: 0 | 1 | 2 | 3 | undefined
  status: 1 | 2 | undefined
  hotelId: string
  hotelOptions: { hotelId: string; name: string }[]
  hotelLoading?: boolean
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:typeId': [val: 0 | 1 | 2 | 3 | undefined]
  'update:status': [val: 1 | 2 | undefined]
  'update:hotelId': [val: string]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── 搜尋 debounce ─────────────────────────────────────────────
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

function onTypeChange(val: unknown) {
  emit('update:typeId', val as 0 | 1 | 2 | 3 | undefined)
  emit('search')
}

function onStatusChange(val: unknown) {
  emit('update:status', val as 1 | 2 | undefined)
  emit('search')
}

function onHotelChange(val: unknown) {
  emit('update:hotelId', val as string)
  emit('search')
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 飯店選擇 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('promotion.selectHotel') }}</span>
      <el-select
        :model-value="hotelId"
        :loading="hotelLoading"
        :placeholder="$t('promotion.selectHotel')"
        clearable
        style="width: 200px"
        @update:model-value="onHotelChange"
      >
        <el-option v-for="h in hotelOptions" :key="h.hotelId" :label="h.name" :value="h.hotelId" />
      </el-select>
    </div>

    <!-- 類型篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('promotion.filter.typeId') }}</span>
      <el-select
        :model-value="typeId"
        :placeholder="$t('promotion.typeId.0')"
        clearable
        style="width: 140px"
        @update:model-value="onTypeChange"
      >
        <el-option :label="$t('promotion.typeId.1')" :value="1" />
        <el-option :label="$t('promotion.typeId.2')" :value="2" />
        <el-option :label="$t('promotion.typeId.3')" :value="3" />
      </el-select>
    </div>

    <!-- 狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('promotion.filter.status') }}</span>
      <el-select
        :model-value="status"
        :placeholder="$t('promotion.status.all')"
        clearable
        style="width: 130px"
        @update:model-value="onStatusChange"
      >
        <el-option :label="$t('promotion.status.published')" :value="1" />
        <el-option :label="$t('promotion.status.unpublished')" :value="2" />
      </el-select>
    </div>

    <!-- 關鍵字搜尋 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('promotion.filter.search') }}</span>
      <el-input
        :model-value="localSearch"
        :placeholder="$t('promotion.filter.searchPlaceholder')"
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
      <HcButton plain @click="emit('reset')">{{ $t('promotion.filter.reset') }}</HcButton>
      <HcButton
        type="primary"
        v-if="canPerformAction('/promotion', 'create')"
        @click="emit('create')"
        >{{ $t('promotion.create') }}</HcButton
      >
    </div>
  </div>
</template>
