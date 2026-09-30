<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcMessageBox } from '@monorepo/utils'
import { employeeApi, type EmployeeItem } from '@/api/employees'
import EmployeeFilterBar from '../components/EmployeeFilterBar.vue'
import EmployeeTable from '../components/EmployeeTable.vue'
import EmployeeFormDialog from '../components/EmployeeFormDialog.vue'

const { $t } = useI18n()

const filter = reactive({
  search: '',
  department: undefined as string | undefined,
  status: undefined as 0 | 1 | undefined,
})

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const list = ref<EmployeeItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const activeEmployee = ref<EmployeeItem | null>(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await employeeApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filter.search || undefined,
      department: filter.department,
      status: filter.status,
    })
    const data = (res as { data: { list: EmployeeItem[]; pagination: { total: number } } })?.data
    list.value = data?.list ?? []
    total.value = data?.pagination?.total ?? 0
  } catch {
    ElMessage.error($t('employees.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  filter.search = ''
  filter.department = undefined
  filter.status = undefined
  page.value = 1
  fetchList()
}

function handleCreate() {
  dialogMode.value = 'create'
  activeEmployee.value = null
  dialogVisible.value = true
}

function handleEdit(row: EmployeeItem) {
  dialogMode.value = 'edit'
  activeEmployee.value = row
  dialogVisible.value = true
}

async function handleDelete(row: EmployeeItem) {
  try {
    await HcMessageBox.confirm(
      $t('employees.delete.confirm', { name: row.name }),
      $t('dialog.deleteTitle'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await employeeApi.delete(row.id)
    ElMessage.success($t('employees.messages.deleteSuccess'))
    fetchList()
  } catch {
    ElMessage.error($t('employees.messages.deleteFailed'))
  }
}

async function handleStatusChange(row: EmployeeItem, val: 0 | 1) {
  if (!row?.id || val === row.status) return
  const original = row.status
  row.status = val
  try {
    await employeeApi.update(row.id, { status: val })
  } catch {
    row.status = original
    ElMessage.error($t('employees.messages.fetchError'))
  }
}

function handleSuccess() {
  dialogVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <EmployeeFilterBar
      v-model:search="filter.search"
      v-model:department="filter.department"
      v-model:status="filter.status"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <EmployeeTable
      :data="list"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :loading="loading"
      @update:page="
        $event => {
          page = $event
          fetchList()
        }
      "
      @update:page-size="
        $event => {
          pageSize = $event
          page = 1
          fetchList()
        }
      "
      @edit="handleEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
    />

    <EmployeeFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :employee="activeEmployee"
      @success="handleSuccess"
    />
  </div>
</template>
