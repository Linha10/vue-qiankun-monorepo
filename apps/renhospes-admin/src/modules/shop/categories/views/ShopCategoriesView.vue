<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopCategory } from '@/api/shopCategory'
import type {
  CategoryItem,
  SeriesId,
  GetCategoryListParams,
  EnableStatus,
} from '@/types/api-params'
import { HcMessageBox } from '@monorepo/utils'
import CategoryFilterBar from '../components/CategoryFilterBar.vue'
import CategoryTable from '../components/CategoryTable.vue'
import CategoryFormDialog from '../components/CategoryFormDialog.vue'

type OptionalEnableStatus = EnableStatus | undefined

const { $t } = useI18n()
const appStore = useAppStore()

// ── Filter State ───────────────────────────────────────────────
const filter = reactive({
  search: '',
  seriesType: undefined as SeriesId | undefined,
  status: undefined as OptionalEnableStatus,
})

// ── Pagination ─────────────────────────────────────────────────
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ── Table Data ─────────────────────────────────────────────────
const list = ref<CategoryItem[]>([])
const loading = ref(false)

// ── Dialog State ───────────────────────────────────────────────
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'view' | 'edit'>('create')
const dialogCategoryId = ref<string | null>(null)

// ── Fetch ──────────────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value,
      lang: appStore.locale,
    }
    if (filter.search) params.search = filter.search
    if (filter.seriesType !== undefined) params.seriesType = filter.seriesType
    if (filter.status !== undefined) params.status = filter.status
    const res = await shopCategory.getCategoryList(params as GetCategoryListParams)
    const data = (res as { data: { list: CategoryItem[]; pagination: { total: number } } })?.data
    list.value = data?.list ?? []
    total.value = data?.pagination?.total ?? 0
  } catch {
    ElMessage.error($t('shop.category.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const handleReset = () => {
  filter.search = ''
  filter.seriesType = undefined
  filter.status = undefined
  page.value = 1
  fetchList()
}

// ── Dialog ─────────────────────────────────────────────────────
const handleCreate = () => {
  dialogMode.value = 'create'
  dialogCategoryId.value = null
  dialogVisible.value = true
}

const handleView = (row: CategoryItem) => {
  dialogMode.value = 'view'
  dialogCategoryId.value = row.categoryId
  dialogVisible.value = true
}

const handleEdit = (row: CategoryItem) => {
  dialogMode.value = 'edit'
  dialogCategoryId.value = row.categoryId
  dialogVisible.value = true
}

// ── Delete ─────────────────────────────────────────────────────
const handleDelete = async (row: CategoryItem) => {
  try {
    await HcMessageBox.confirm(
      $t('shop.category.messages.deleteConfirm', { name: row.name }),
      $t('dialog.deleteTitle'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await shopCategory.deleteCategory(row.categoryId)
    ElMessage.success($t('shop.category.messages.deleteSuccess'))
    fetchList()
  } catch {
    ElMessage.error($t('shop.category.messages.deleteFailed'))
  }
}

// ── Status Change ──────────────────────────────────────────────
const handleStatusChange = async (row: CategoryItem, val: 0 | 1) => {
  if (!row.categoryId) {
    console.warn('[handleStatusChange] row.categoryId is undefined. Check API response field name.')
    return
  }
  if (val === row.status) return

  const original = row.status
  row.status = val
  try {
    await shopCategory.updateCategory(row.categoryId, {
      id: row.categoryId,
      name: row.jsonName,
      description: row.jsonDesc,
      seriesType: row.seriesType,
      seriesKey: row.seriesKey,
      sort: row.sort,
      status: val,
    })
  } catch {
    row.status = original
    ElMessage.error($t('shop.category.messages.statusUpdateFailed'))
  }
}

// ── Success ────────────────────────────────────────────────────
const handleSuccess = () => {
  dialogVisible.value = false
  fetchList()
}

onMounted(fetchList)

watch(
  () => appStore.locale,
  () => {
    page.value = 1
    fetchList()
  }
)
</script>

<template>
  <div>
    <CategoryFilterBar
      v-model:search="filter.search"
      v-model:series-type="filter.seriesType"
      v-model:status="filter.status"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <CategoryTable
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
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
    />

    <CategoryFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :category-id="dialogCategoryId"
      @success="handleSuccess"
    />
  </div>
</template>
