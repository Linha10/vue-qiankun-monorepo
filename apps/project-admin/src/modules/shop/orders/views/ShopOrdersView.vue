<script setup lang="ts">
import { h, ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopOrderApi } from '@/api/shopOrder'
import type { ShopOrderInfo, OrderStatus, ShopOrderParams } from '@/types/api-params'
import { HcMessageBox } from '@monorepo/utils'
import OrderFilterBar from '../components/OrderFilterBar.vue'
import OrderTable from '../components/OrderTable.vue'
import OrderItemsDialog from '../components/OrderItemsDialog.vue'
import ShopOrderDetailDialog from '../components/ShopOrderDetailDialog.vue'

const { $t } = useI18n()
const appStore = useAppStore()

// ── Filter State ───────────────────────────────────────────────
const filter = reactive({
  search: '',
  orderStatus: undefined as OrderStatus | undefined,
})

// ── Pagination ─────────────────────────────────────────────────
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ── Table Data ─────────────────────────────────────────────────
const list = ref<ShopOrderInfo[]>([])
const loading = ref(false)

// ── Dialog State ───────────────────────────────────────────────
const itemsDialogVisible = ref(false)
const itemsDialogOrderId = ref<string | null>(null)

const detailDialogVisible = ref(false)
const detailDialogOrderId = ref<string | null>(null)
const detailDialogMode = ref<'view' | 'edit'>('view')

// ── Fetch ──────────────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true
  try {
    const params: ShopOrderParams = {
      page: page.value,
      pageSize: pageSize.value,
      lang: appStore.locale,
    }
    if (filter.search) params.search = filter.search
    if (filter.orderStatus !== undefined) params.orderStatus = filter.orderStatus

    const res = await shopOrderApi.getShopOrderList(params)
    const data = (res as { data: { list: ShopOrderInfo[]; pagination: { total: number } } })?.data
    list.value = data?.list ?? []
    total.value = data?.pagination?.total ?? 0
  } catch {
    ElMessage.error($t('shop.order.messages.fetchError'))
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
  filter.orderStatus = undefined
  page.value = 1
  fetchList()
}

// ── Actions ────────────────────────────────────────────────────
const handleView = (row: ShopOrderInfo) => {
  detailDialogOrderId.value = row.id
  detailDialogMode.value = 'view'
  detailDialogVisible.value = true
}

const handleEdit = (row: ShopOrderInfo) => {
  detailDialogOrderId.value = row.id
  detailDialogMode.value = 'edit'
  detailDialogVisible.value = true
}

const handleSaved = () => {
  fetchList()
}

const handleCheckout = async (row: ShopOrderInfo) => {
  try {
    await HcMessageBox.confirm(
      $t('shop.order.messages.checkoutConfirm', { orderName: row.name, orderRoom: row.roomNumber }),
      $t('shop.order.actions.checkout'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await shopOrderApi.checkoutOrder(row.id)
    ElMessage.success($t('shop.order.messages.checkoutSuccess'))
    fetchList()
  } catch {
    ElMessage.error($t('shop.order.messages.checkoutFailed'))
  }
}

const handleDelete = async (row: ShopOrderInfo) => {
  try {
    await HcMessageBox.confirm(
      h('div', null, [
        h(
          'p',
          { style: 'margin: 0 0 10px 0' },
          $t('shop.order.messages.deleteConfirm', {
            orderName: row.name,
            orderRoom: row.roomNumber,
          })
        ),
        h(
          'p',
          { style: 'margin: 0; color: #dc2626; font-size: 13px;' },
          $t('shop.order.messages.deleteConfirmWarning')
        ),
      ]),
      $t('shop.order.actions.delete'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await shopOrderApi.deleteShopOrder(row.id)
    ElMessage.success($t('shop.order.messages.deleteSuccess'))
    fetchList()
  } catch {
    ElMessage.error($t('shop.order.messages.deleteFailed'))
  }
}

const handleItemsClick = (row: ShopOrderInfo) => {
  itemsDialogOrderId.value = row.id
  itemsDialogVisible.value = true
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
    <OrderFilterBar
      v-model:search="filter.search"
      v-model:order-status="filter.orderStatus"
      @search="handleSearch"
      @reset="handleReset"
    />

    <OrderTable
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
      @checkout="handleCheckout"
      @delete="handleDelete"
      @items-click="handleItemsClick"
    />

    <OrderItemsDialog v-model="itemsDialogVisible" :order-id="itemsDialogOrderId" />

    <ShopOrderDetailDialog
      v-model="detailDialogVisible"
      :order-id="detailDialogOrderId"
      :mode="detailDialogMode"
      @saved="handleSaved"
    />
  </div>
</template>
