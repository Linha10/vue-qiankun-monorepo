<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcMessageBox } from '@monorepo/utils'
import { productApi, type ProductItem } from '@/api/products'
import ProductFilterBar from '../components/ProductFilterBar.vue'
import ProductTable from '../components/ProductTable.vue'
import ProductFormDialog from '../components/ProductFormDialog.vue'

const { $t } = useI18n()

const filter = reactive({
  search: '',
  category: undefined as string | undefined,
  status: undefined as 0 | 1 | undefined,
})

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const list = ref<ProductItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const activeProduct = ref<ProductItem | null>(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await productApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filter.search || undefined,
      category: filter.category,
      status: filter.status,
    })
    const data = (res as { data: { list: ProductItem[]; pagination: { total: number } } })?.data
    list.value = data?.list ?? []
    total.value = data?.pagination?.total ?? 0
  } catch {
    ElMessage.error($t('products.messages.fetchError'))
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
  filter.category = undefined
  filter.status = undefined
  page.value = 1
  fetchList()
}

function handleCreate() {
  dialogMode.value = 'create'
  activeProduct.value = null
  dialogVisible.value = true
}

function handleEdit(row: ProductItem) {
  dialogMode.value = 'edit'
  activeProduct.value = row
  dialogVisible.value = true
}

async function handleDelete(row: ProductItem) {
  try {
    await HcMessageBox.confirm(
      $t('products.delete.confirm', { name: row.name }),
      $t('dialog.deleteTitle'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await productApi.delete(row.id)
    ElMessage.success($t('products.messages.deleteSuccess'))
    fetchList()
  } catch {
    ElMessage.error($t('products.messages.deleteFailed'))
  }
}

async function handleStatusChange(row: ProductItem, val: 0 | 1) {
  if (!row?.id || val === row.status) return
  const original = row.status
  row.status = val
  try {
    await productApi.update(row.id, { status: val })
  } catch {
    row.status = original
    ElMessage.error($t('products.messages.fetchError'))
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
    <ProductFilterBar
      v-model:search="filter.search"
      v-model:category="filter.category"
      v-model:status="filter.status"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <ProductTable
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

    <ProductFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :product="activeProduct"
      @success="handleSuccess"
    />
  </div>
</template>
