<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopProductApi } from '@/api/shopProduct'
import type { ShopItem, SeriesId, ShopProductListParams } from '@/types/api-params'
import ProductFilterBar from '../components/ProductFilterBar.vue'
import ProductTable from '../components/ProductTable.vue'
import ProductFormDialog from '../components/ProductFormDialog.vue'

const { $t } = useI18n()
const appStore = useAppStore()

// ── Filter State ───────────────────────────────────────────────
const filter = reactive({
  search: '',
  seriesId: undefined as SeriesId | undefined,
  isActive: undefined as boolean | undefined,
})

// ── Pagination ─────────────────────────────────────────────────
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ── Table Data ─────────────────────────────────────────────────
const list = ref<ShopItem[]>([])
const loading = ref(false)

// ── Dialog State（預留，後續實作） ──────────────────────────────
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'view' | 'edit'>('create')
const dialogProductId = ref<string | null>(null)

// ── Fetch ──────────────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true
  try {
    const params: ShopProductListParams = {
      page: page.value,
      pageSize: pageSize.value,
      lang: appStore.locale,
    }
    if (filter.search) params.search = filter.search
    if (filter.seriesId !== undefined) params.seriesId = filter.seriesId
    if (filter.isActive !== undefined) params.isActive = filter.isActive

    const res = await shopProductApi.getProductList(params)
    const data = (res as { data: { list: ShopItem[]; pagination: { total: number } } })?.data
    list.value = data?.list ?? []
    total.value = data?.pagination?.total ?? 0
  } catch {
    ElMessage.error($t('shop.product.messages.fetchError'))
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
  filter.seriesId = undefined
  filter.isActive = undefined
  page.value = 1
  fetchList()
}

// ── Dialog ─────────────────────────────────────────────────────
const handleCreate = () => {
  dialogMode.value = 'create'
  dialogProductId.value = null
  dialogVisible.value = true
}

const handleView = (row: ShopItem) => {
  dialogMode.value = 'view'
  dialogProductId.value = row.productId
  dialogVisible.value = true
}

const handleEdit = (row: ShopItem) => {
  dialogMode.value = 'edit'
  dialogProductId.value = row.productId
  dialogVisible.value = true
}

// ── Active Change ──────────────────────────────────────────────
const handleActiveChange = async (row: ShopItem, val: boolean) => {
  if (!row.productId) {
    console.warn('[handleActiveChange] row.productId is undefined')
    return
  }
  if (val === row.isActive) return

  const original = row.isActive
  row.isActive = val
  try {
    await shopProductApi.updateProductActive(row.productId, { isActive: val })
    ElMessage.success(
      val
        ? $t('shop.product.messages.activatedSuccess', { name: row.name })
        : $t('shop.product.messages.deactivatedSuccess', { name: row.name })
    )
  } catch {
    row.isActive = original
    ElMessage.error($t('shop.product.messages.activeUpdateFailed', { name: row.name }))
  }
}

onMounted(fetchList)

const handleSuccess = () => {
  dialogVisible.value = false
  fetchList()
}

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
    <ProductFilterBar
      v-model:search="filter.search"
      v-model:series-id="filter.seriesId"
      v-model:is-active="filter.isActive"
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
      @view="handleView"
      @edit="handleEdit"
      @active-change="handleActiveChange"
    />

    <ProductFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :product-id="dialogProductId"
      @success="handleSuccess"
    />
  </div>
</template>
