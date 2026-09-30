<script setup lang="ts">
import { useI18n, usePermission } from '@monorepo/composables'
import { HcInput, HcSelect, HcButton } from '@monorepo/ui-kit'

const props = defineProps<{
  search: string
  category: string | undefined
  status: 0 | 1 | undefined
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:category': [val: string | undefined]
  'update:status': [val: 0 | 1 | undefined]
  search: []
  reset: []
  create: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

const CATEGORIES = ['3C配件', '居家生活', '辦公用品', '戶外休閒', '美妝保養']
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('products.filter.category') }}</span>
      <HcSelect
        :model-value="props.category"
        :placeholder="$t('products.filter.all')"
        clearable
        style="width: 160px"
        @update:model-value="
          (val: string | number | undefined) => emit('update:category', val as string | undefined)
        "
      >
        <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
      </HcSelect>
    </div>

    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{ $t('products.filter.status') }}</span>
      <HcSelect
        :model-value="props.status"
        :placeholder="$t('products.filter.all')"
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
        $t('products.filter.searchPlaceholder')
      }}</span>
      <HcInput
        :model-value="props.search"
        :placeholder="$t('products.filter.searchPlaceholder')"
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
      <HcButton plain @click="emit('reset')">{{ $t('products.filter.reset') }}</HcButton>
      <HcButton type="primary" @click="emit('search')">{{ $t('common.search') }}</HcButton>
      <HcButton
        v-if="canPerformAction('/products', 'create')"
        type="primary"
        @click="emit('create')"
      >
        {{ $t('products.filter.create') }}
      </HcButton>
    </div>
  </div>
</template>
