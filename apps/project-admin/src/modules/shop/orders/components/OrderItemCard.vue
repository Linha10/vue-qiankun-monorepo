<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@monorepo/composables'
import type { OrderItem } from '@/types/api-params'
import { HcInputNumber, HcButton } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  item: OrderItem
  mode: 'preview' | 'view' | 'edit'
  quantity: number
  markedForDelete?: boolean
}>()

const emit = defineEmits<{
  'quantity-change': [itemId: string, qty: number]
  'toggle-delete': [itemId: string]
}>()

const { $t } = useI18n()

// ── Computed ───────────────────────────────────────────────────
const isEditable = computed(() => props.mode === 'edit')
const totalPrice = computed(() => props.quantity * props.item.productPrice)
</script>

<template>
  <div class="order-item-card" :class="{ 'order-item-card--deleted': markedForDelete }">
    <!-- 圖片 -->
    <div class="order-item-card__image">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.productName"
        class="order-item-card__img"
      />
      <template v-else>
        <i class="fa-solid fa-box-open" />
        <span class="order-item-card__no-image">{{ $t('shop.order.itemCard.noImage') }}</span>
      </template>
    </div>

    <!-- 主要資訊 -->
    <div class="order-item-card__body">
      <!-- 商品名稱 -->
      <p
        class="order-item-card__name"
        :class="{ 'order-item-card__name--deleted': markedForDelete }"
      >
        {{ item.productName }}
      </p>

      <!-- 價格列：單價 × 數量 = 小計 -->
      <div class="order-item-card__price-row">
        <!-- 單價 -->
        <span class="order-item-card__unit-price">
          NT$&nbsp;{{ item.productPrice.toLocaleString() }}
        </span>

        <span class="order-item-card__operator">×</span>

        <!-- 數量 -->
        <HcInputNumber
          v-if="isEditable"
          :model-value="quantity"
          :min="1"
          :disabled="!!markedForDelete"
          controls-position="right"
          size="small"
          class="order-item-card__qty-input"
          @update:model-value="
            (v: number | null) => {
              emit('quantity-change', item.itemId, v ?? 1)
            }
          "
        />
        <span v-else class="order-item-card__qty-text">{{ quantity }}</span>

        <span class="order-item-card__operator">=</span>

        <!-- 小計 -->
        <span class="order-item-card__total"> NT$&nbsp;{{ totalPrice.toLocaleString() }} </span>
      </div>
    </div>

    <!-- 刪除 / 復原按鈕（僅 edit 模式） -->
    <div v-if="isEditable" class="order-item-card__actions">
      <HcButton
        size="small"
        :type="markedForDelete ? 'default' : 'danger'"
        plain
        @click="emit('toggle-delete', item.itemId)"
      >
        <i
          :class="markedForDelete ? 'fa-solid fa-rotate-left' : 'fa-solid fa-trash'"
          class="tw-mr-1"
        />
        {{
          markedForDelete
            ? $t('shop.order.itemCard.undoDelete')
            : $t('shop.order.itemCard.deleteBtn')
        }}
      </HcButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.order-item-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid $color-neutral-200;
  border-radius: 10px;
  background: $color-neutral-0;
  transition:
    opacity 0.2s,
    background 0.2s;

  &--deleted {
    opacity: 0.4;
    background: $color-neutral-50;
  }

  // ── 圖片 ─────────────────────────────────────────
  &__image {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: $color-neutral-100;
    border-radius: 8px;
    color: $color-neutral-400;
    overflow: hidden;

    i {
      font-size: 20px;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__no-image {
    font-size: 10px;
    color: $color-neutral-400;
    letter-spacing: 0;
  }

  // ── 主要資訊 ──────────────────────────────────────
  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: $color-neutral-800;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--deleted {
      text-decoration: line-through;
      color: $color-neutral-400;
    }
  }

  // ── 價格公式列 ────────────────────────────────────
  &__price-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
  }

  &__unit-price {
    font-size: 13px;
    color: $color-neutral-600;
    white-space: nowrap;
  }

  &__operator {
    font-size: 12px;
    color: $color-neutral-400;
    user-select: none;
  }

  &__qty-text {
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-700;
    min-width: 24px;
    text-align: center;
  }

  &__qty-input {
    width: 96px !important;
  }

  &__total {
    font-size: 14px;
    font-weight: 700;
    color: $color-neutral-900;
    white-space: nowrap;
  }

  // ── 操作按鈕 ──────────────────────────────────────
  &__actions {
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 2px;
  }
}
</style>
