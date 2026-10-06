<script setup lang="ts">
import { useI18n, usePermission } from '@monorepo/composables'
import { HcInput, HcSelect, HcButton } from '@monorepo/ui-kit'

const props = defineProps<{
  search: string
  department: string | undefined
  status: 0 | 1 | undefined
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:department': [val: string | undefined]
  'update:status': [val: 0 | 1 | undefined]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

const DEPARTMENTS = ['工程部', '產品部', '設計部', '行銷部', '客服部', '人資部']
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('employees.filter.department') }}</span>
      <HcSelect
        :model-value="props.department"
        :placeholder="$t('employees.filter.all')"
        clearable
        style="width: 160px"
        @update:model-value="
          (val: string | number | undefined) => emit('update:department', val as string | undefined)
        "
      >
        <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
      </HcSelect>
    </div>

    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('employees.filter.status') }}</span>
      <HcSelect
        :model-value="props.status"
        :placeholder="$t('employees.filter.all')"
        clearable
        style="width: 130px"
        @update:model-value="
          (val: string | number | undefined) => emit('update:status', val as 0 | 1 | undefined)
        "
      >
        <el-option :label="$t('common.enable')" :value="1" />
        <el-option :label="$t('common.disable')" :value="0" />
      </HcSelect>
    </div>

    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t('employees.filter.searchPlaceholder')
      }}</span>
      <HcInput
        :model-value="props.search"
        :placeholder="$t('employees.filter.searchPlaceholder')"
        clearable
        style="width: 200px"
        @update:model-value="(val: string | number) => emit('update:search', val as string)"
        @keyup.enter="emit('search')"
        @clear="
          () => {
            emit('update:search', '')
            emit('search')
          }
        "
      />
    </div>

    <div class="tw-flex tw-gap-2 tw-ml-auto tw-items-end">
      <HcButton plain @click="emit('reset')">{{ $t('employees.filter.reset') }}</HcButton>
      <HcButton type="primary" @click="emit('search')">{{ $t('common.search') }}</HcButton>
      <HcButton
        type="primary"
        :disabled="!canPerformAction('/employees', 'create')"
        @click="emit('create')"
      >
        {{ $t('employees.filter.create') }}
      </HcButton>
    </div>
  </div>
</template>
