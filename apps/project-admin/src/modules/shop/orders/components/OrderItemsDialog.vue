<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopOrderApi } from '@/api/shopOrder'
import type { ShopOrderInfo } from '@/types/api-params'
import { HcDialog } from '@monorepo/ui-kit'
import OrderItemCard from './OrderItemCard.vue'

const props = defineProps<{
  modelValue: boolean
  orderId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const { $t } = useI18n()
const appStore = useAppStore()

// ── 訂單詳情 ───────────────────────────────────────────────────
const orderDetail = ref<ShopOrderInfo | null>(null)
const isFetching = ref(false)

watch(
  () => props.modelValue,
  async open => {
    if (!open) {
      orderDetail.value = null
      return
    }
    if (!props.orderId) return
    isFetching.value = true
    try {
      const res = await shopOrderApi.getShopOrderDetail(props.orderId, appStore.locale)
      orderDetail.value = (res as { data: ShopOrderInfo })?.data ?? null
    } finally {
      isFetching.value = false
    }
  }
)
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="$t('shop.order.table.orderItems')"
    :show-footer="false"
    width="580px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- 載入中 -->
    <div
      v-if="isFetching"
      class="tw-flex tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
    >
      <i class="fa-solid fa-spinner fa-spin tw-text-2xl" />
    </div>

    <!-- 商品列表 -->
    <template v-else-if="orderDetail">
      <div class="form-section">
        <!-- Section Header -->
        <div class="form-section__header">
          <i class="fa-solid fa-box-open form-section__icon" />
          <span>{{ $t('shop.order.detail.sectionItems') }}</span>
          <el-tag size="small" round type="info" class="tw-ml-auto">
            {{ orderDetail.orderItems.length }}
            {{ $t('shop.order.table.orderItemsBtn', { count: '' }).trim() }}
          </el-tag>
        </div>

        <!-- 商品卡片列表 -->
        <div class="items-list">
          <OrderItemCard
            v-for="item in orderDetail.orderItems"
            :key="item.itemId"
            :item="item"
            mode="preview"
            :quantity="item.quantity"
          />
        </div>
      </div>

      <!-- 訂單總金額 -->
      <div class="total-row">
        <span class="total-row__label">{{ $t('shop.order.itemCard.orderTotal') }}</span>
        <span class="total-row__amount">NT$ {{ orderDetail.totalAmount.toLocaleString() }}</span>
      </div>
    </template>

    <!-- 無資料 -->
    <div
      v-else
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
    >
      <i class="fa-solid fa-box-open tw-text-3xl tw-mb-3" />
      <span class="tw-text-sm">{{ $t('common.noData') }}</span>
    </div>
  </HcDialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

// ── Section Card ──────────
.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 14px 16px;
  background: $color-neutral-0;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-700;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid $color-neutral-100;
  }

  &__icon {
    color: $color-primary;
    font-size: 15px;
  }
}

// ── 商品列表 ──────────────────────────────────────────────────
.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// ── 總計行 ────────────────────────────────────────────────────
.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 4px 0;
  border-top: 1px solid $color-neutral-200;

  &__label {
    font-size: 13px;
    color: $color-neutral-500;
  }

  &__amount {
    font-size: 16px;
    font-weight: 700;
    color: $color-neutral-900;
  }
}
</style>
