<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'
import type { ProductItem } from '@/api/products'

defineProps<{
  data: ProductItem[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  edit: [row: ProductItem]
  delete: [row: ProductItem]
  statusChange: [row: ProductItem, val: 0 | 1]
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

const columns = computed(() => [
  { prop: 'actions', label: $t('products.table.actions'), width: 120, fixed: true },
  { prop: 'name', label: $t('products.table.name'), minWidth: 160 },
  { prop: 'category', label: $t('products.table.category'), minWidth: 120 },
  { prop: 'price', label: $t('products.table.price'), width: 100, align: 'right' as const },
  { prop: 'stock', label: $t('products.table.stock'), width: 90, align: 'right' as const },
  { prop: 'status', label: $t('products.table.status'), width: 100, align: 'center' as const },
  { prop: 'createdAt', label: $t('products.table.createdAt'), width: 120 },
])

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asProduct(row: unknown) {
  return row as ProductItem
}
</script>

<template>
  <div v-loading="loading">
    <HcTable
      :data="data"
      :columns="columns"
      :total="total"
      :page="page"
      :page-size="pageSize"
      row-key="id"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-1">
          <el-tooltip :content="$t('common.edit')" placement="top">
            <HcButton
              text
              type="primary"
              size="small"
              :disabled="!canPerformAction('/products', 'update')"
              @click="emit('edit', asProduct(scope))"
            >
              <i class="fa-solid fa-pen" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.delete')" placement="top">
            <HcButton
              text
              type="danger"
              size="small"
              :disabled="!canPerformAction('/products', 'delete')"
              @click="emit('delete', asProduct(scope))"
            >
              <i class="fa-solid fa-trash" />
            </HcButton>
          </el-tooltip>
        </div>
      </template>

      <template #price="{ scope }">
        <span>NT$ {{ asProduct(scope).price }}</span>
      </template>

      <template #status="{ scope }">
        <HcSwitch
          :model-value="asProduct(scope).status"
          :active-value="1"
          :inactive-value="0"
          @change="emit('statusChange', asProduct(scope), $event as 0 | 1)"
        />
      </template>
    </HcTable>
  </div>
</template>
