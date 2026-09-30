<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import type { ShopItem } from '@/types/api-params'
import { HcTable, HcButton, HcSwitch } from '@monorepo/ui-kit'
import ProductQrDialog from './ProductQrDialog.vue'

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: ShopItem[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  view: [row: ShopItem]
  edit: [row: ShopItem]
  delete: [row: ShopItem]
  activeChange: [row: ShopItem, val: boolean]
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── Table columns ──────────────────────────────────────────────
const columns = computed(() => [
  { prop: 'actions', label: $t('common.actions'), width: 80, fixed: true },
  { prop: 'image', label: $t('shop.product.table.image'), width: 100, align: 'center' as const },
  {
    prop: 'seriesId',
    label: $t('shop.product.table.seriesId'),
    minWidth: 60,
    align: 'center' as const,
  },
  { prop: 'name', label: $t('shop.product.table.name'), minWidth: 150, align: 'center' as const },
  { prop: 'description', label: $t('shop.product.table.description'), minWidth: 200 },
  { prop: 'price', label: $t('shop.product.table.price'), minWidth: 120, align: 'left' as const },
  { prop: 'stock', label: $t('shop.product.table.stock'), minWidth: 80, align: 'center' as const },
  { prop: 'productCode', label: $t('shop.product.table.productCode'), minWidth: 100 },
  {
    prop: 'qrCode',
    label: $t('shop.product.table.qrCode'),
    minWidth: 80,
    align: 'center' as const,
  },
  {
    prop: 'isActive',
    label: $t('shop.product.table.isActive'),
    minWidth: 90,
    align: 'center' as const,
    fixed: true,
  },
])

const qrDialogVisible = ref(false)
const qrProductId = ref<string | number>('')
const qrProductName = ref('')

const openQrDialog = (productId: string | number, productName: string) => {
  qrProductId.value = productId
  qrProductName.value = productName
  qrDialogVisible.value = true
}

const SERIES_LABEL_KEY: Record<string, string> = {
  'series-saffron': 'shop.category.seriesType.saffron',
  'series-machu-picchu': 'shop.category.seriesType.machupicchu',
  'series-marrakesh': 'shop.category.seriesType.marrakesh',
}

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asShopItem(row: unknown) {
  return row as ShopItem
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
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 操作欄（固定左） -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-1">
          <el-tooltip :content="$t('common.view')" placement="top">
            <HcButton text type="info" size="small" @click="emit('view', asShopItem(scope))">
              <i class="fa-solid fa-eye" />
            </HcButton>
          </el-tooltip>
          <el-tooltip
            :content="scope.isActive ? $t('shop.product.table.editDisabledTip') : $t('common.edit')"
            placement="top"
          >
            <span>
              <HcButton
                text
                type="primary"
                size="small"
                v-if="canPerformAction('/shop/products', 'update')"
                :disabled="scope.isActive"
                @click="!scope.isActive && emit('edit', asShopItem(scope))"
              >
                <i class="fa-solid fa-pen" />
              </HcButton>
            </span>
          </el-tooltip>
        </div>
      </template>

      <!-- 產品圖片（可點擊預覽） -->
      <template #image="{ scope }">
        <div style="display: flex; justify-content: center">
          <el-image
            v-if="scope.images && scope.images.length > 0"
            :src="scope.images[0].url"
            :preview-src-list="scope.images.map((i: { url: string }) => i.url)"
            fit="cover"
            hide-on-click-modal
            preview-teleported
            fetchpriority="high"
            class="product-thumb"
            lazy
          >
            <template #error>
              <div class="product-thumb product-thumb--error">
                <i class="fa-solid fa-image" />
              </div>
            </template>
          </el-image>
          <div v-else class="product-thumb product-thumb--empty">
            <i class="fa-solid fa-image" />
          </div>
        </div>
      </template>

      <!-- 系列（翻譯顯示） -->
      <template #seriesId="{ scope }">
        <span>{{
          SERIES_LABEL_KEY[String(scope.seriesId).trim()]
            ? $t(SERIES_LABEL_KEY[String(scope.seriesId).trim()])
            : scope.seriesId
        }}</span>
      </template>

      <!-- 售價 -->
      <template #price="{ scope }">
        <span class="tw-font-medium">NT$ {{ scope.price?.toLocaleString() }}</span>
      </template>

      <!-- QR Code -->
      <template #qrCode="{ scope }">
        <el-tooltip :content="$t('shop.product.table.qrCode')" placement="top">
          <HcButton
            text
            type="info"
            size="small"
            @click="openQrDialog(scope.productId, scope.name)"
          >
            <i class="fa-solid fa-qrcode" />
          </HcButton>
        </el-tooltip>
      </template>

      <!-- 上架狀態（固定右） -->
      <template #isActive="{ scope }">
        <HcSwitch
          :model-value="scope.isActive"
          :active-value="true"
          :inactive-value="false"
          @change="emit('activeChange', asShopItem(scope), $event as boolean)"
        />
      </template>
    </HcTable>

    <ProductQrDialog
      v-model="qrDialogVisible"
      :product-id="qrProductId"
      :product-name="qrProductName"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.product-thumb {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--error,
  &--empty {
    background: $color-neutral-100;
    color: $color-neutral-600;
    font-size: 18px;
  }
}
</style>
<style>
:deep(.el-button--primary.is-disabled:hover) {
  color: gray;
}
</style>
