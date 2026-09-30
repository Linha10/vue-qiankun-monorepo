<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string
  status: 0 | 1 | undefined
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:status': [val: 0 | 1 | undefined]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── 模糊搜尋 debounce ─────────────────────────────────────────
const localSearch = ref(props.search)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 當父層 reset 時同步（外部修改 prop 回寫到本地）
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

// ── 狀態切換 ──────────────────────────────────────────────────
function onStatusChange(val: unknown) {
  emit('update:status', val as 0 | 1 | undefined)
  emit('search')
}

// ── 狀態選項 ──────────────────────────────────────────────────
const statusOptions = [
  { label: $t('facilities.statusEnabled'), value: 1 as const },
  { label: $t('facilities.statusDisabled'), value: 0 as const },
]
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 搜尋關鍵字 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('common.search') }}</span>
      <el-input
        :model-value="localSearch"
        clearable
        style="width: 200px"
        :placeholder="$t('facilities.filter.searchPlaceholder')"
        @update:model-value="onSearchInput($event as string)"
        @clear="onSearchInput('')"
      />
    </div>

    <!-- 狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('facilities.filter.status') }}</span>
      <el-select
        :model-value="status"
        clearable
        style="width: 140px"
        :placeholder="$t('facilities.filter.allStatus')"
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

    <!-- 操作按鈕 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton @click="emit('reset')">{{ $t('facilities.filter.reset') }}</HcButton>
      <HcButton
        type="primary"
        plain
        v-if="canPerformAction('/facilities', 'create')"
        @click="emit('create')"
        >{{ $t('facilities.create') }}</HcButton
      >
    </div>
  </div>
</template>
