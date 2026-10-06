<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'
import type { EmployeeItem } from '@/api/employees'

defineProps<{
  data: EmployeeItem[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  edit: [row: EmployeeItem]
  delete: [row: EmployeeItem]
  statusChange: [row: EmployeeItem, val: 0 | 1]
}>()

const router = useRouter()
const { $t } = useI18n()
const { canPerformAction } = usePermission()

const columns = computed(() => [
  { prop: 'actions', label: $t('employees.table.actions'), width: 150, fixed: true },
  { prop: 'name', label: $t('employees.table.name'), minWidth: 120 },
  { prop: 'department', label: $t('employees.table.department'), minWidth: 100 },
  { prop: 'title', label: $t('employees.table.jobTitle'), minWidth: 100 },
  { prop: 'email', label: $t('employees.table.email'), minWidth: 160 },
  { prop: 'phone', label: $t('employees.table.phone'), minWidth: 130 },
  { prop: 'status', label: $t('employees.table.status'), width: 100, align: 'center' as const },
])

function goDetail(row: EmployeeItem) {
  router.push(`/employees/${row.id}`)
}

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asEmployee(row: unknown) {
  return row as EmployeeItem
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
          <el-tooltip :content="$t('common.view')" placement="top">
            <HcButton text type="info" size="small" @click="goDetail(asEmployee(scope))">
              <i class="fa-solid fa-eye" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.edit')" placement="top">
            <HcButton
              text
              type="primary"
              size="small"
              :disabled="!canPerformAction('/employees', 'update')"
              @click="emit('edit', asEmployee(scope))"
            >
              <i class="fa-solid fa-pen" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.delete')" placement="top">
            <HcButton
              text
              type="danger"
              size="small"
              :disabled="!canPerformAction('/employees', 'delete')"
              @click="emit('delete', asEmployee(scope))"
            >
              <i class="fa-solid fa-trash" />
            </HcButton>
          </el-tooltip>
        </div>
      </template>

      <template #status="{ scope }">
        <HcSwitch
          :model-value="asEmployee(scope).status"
          :active-value="1"
          :inactive-value="0"
          @change="emit('statusChange', asEmployee(scope), $event as 0 | 1)"
        />
      </template>
    </HcTable>
  </div>
</template>
