<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton, HcDatePicker } from '@monorepo/ui-kit'
import { BOOKING_STATUS } from '@/constants/booking'
import type { BookingStatus } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  hotelId: string
  hotelOptions: { hotelId: string; name: string }[]
  hotelLoading?: boolean
  status: BookingStatus | undefined
  dateRange: string[]
  memberId: string
  createDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:hotelId': [val: string]
  'update:status': [val: BookingStatus | undefined]
  'update:dateRange': [val: string[]]
  'update:memberId': [val: string]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── 狀態選項 ──────────────────────────────────────────────────
const statusOptions = computed(() =>
  Object.values(BOOKING_STATUS).map(s => ({
    label: $t(`orders.status.${s}`),
    value: s as BookingStatus,
  }))
)

function onHotelChange(val: unknown) {
  emit('update:hotelId', val as string)
  emit('search')
}

function onStatusChange(val: unknown) {
  emit('update:status', val as BookingStatus | undefined)
  emit('search')
}

function onDateRangeChange(val: unknown) {
  emit('update:dateRange', (val as string[]) ?? [])
  emit('search')
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 選擇飯店 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('orders.selectHotel') }}</span>
      <el-select
        :model-value="hotelId"
        :loading="hotelLoading"
        filterable
        clearable
        style="width: 180px"
        :placeholder="$t('orders.selectHotel')"
        @update:model-value="onHotelChange"
      >
        <el-option v-for="h in hotelOptions" :key="h.hotelId" :label="h.name" :value="h.hotelId" />
      </el-select>
    </div>

    <!-- 狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('orders.filter.status') }}</span>
      <el-select
        :model-value="status"
        clearable
        :placeholder="$t('orders.filter.allStatus')"
        style="width: 140px"
        @update:model-value="onStatusChange"
      >
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <!-- 入住日期範圍 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('orders.filter.dateRange') }}</span>
      <HcDatePicker
        :model-value="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        :range-separator="'—'"
        :start-placeholder="$t('pricing.startDate')"
        :end-placeholder="$t('pricing.endDate')"
        style="width: 240px"
        @update:model-value="onDateRangeChange"
      />
    </div>

    <!-- 會員ID -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('orders.filter.memberId') }}</span>
      <el-input
        disabled
        :model-value="memberId"
        clearable
        :placeholder="$t('orders.columns.memberId')"
        style="width: 160px"
      />
    </div>

    <!-- 操作按鈕 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto tw-items-end">
      <HcButton @click="emit('reset')">{{ $t('orders.filter.reset') }}</HcButton>
      <el-tooltip
        v-if="canPerformAction('/orders', 'create')"
        :content="$t('orders.createTooltip')"
        placement="top"
      >
        <span>
          <HcButton :disabled="createDisabled" type="primary" plain @click="emit('create')">
            {{ $t('orders.create') }}
          </HcButton>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>
