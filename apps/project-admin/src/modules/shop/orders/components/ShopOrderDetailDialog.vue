<script setup lang="ts">
import { ref, reactive, watch, computed, h } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopOrderApi } from '@/api/shopOrder'
import dayjs from 'dayjs'
import type { ShopOrderInfo, ClientInfo, PickupMethod } from '@/types/api-params'
import { HcDialog, HcInput, HcButton } from '@monorepo/ui-kit'
import { HcMessageBox } from '@monorepo/utils'
import OrderItemCard from './OrderItemCard.vue'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  orderId: string | null
  mode: 'view' | 'edit'
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

const { $t } = useI18n()
const appStore = useAppStore()

// ── State ──────────────────────────────────────────────────────
const isFetching = ref(false)
const isSaving = ref(false)
const isCheckingOut = ref(false)
const isCancelling = ref(false)
const orderDetail = ref<ShopOrderInfo | null>(null)
// dayjs
const isExpired = computed(() => {
  if (!orderDetail.value) return true
  return orderDetail.value.expiresAt ? dayjs(orderDetail.value.expiresAt).isBefore(dayjs()) : true
})

const form = reactive({
  name: '',
  roomNumber: '',
  phone: '',
  phonePrefix: '',
  areaCode: '',
  landline: '',
  email: '',
  pickupMethod: 'delivery' as PickupMethod,
  city: '',
  district: '',
  zipCode: '',
  address: '',
  notes: '',
})

const qtyMap = ref(new Map<string, number>())
const deleteSet = ref(new Set<string>())

// ── Fetch ──────────────────────────────────────────────────────
watch(
  () => props.modelValue,
  async open => {
    if (!open) {
      orderDetail.value = null
      qtyMap.value = new Map()
      deleteSet.value = new Set()
      return
    }
    if (!props.orderId) return
    isFetching.value = true
    try {
      const res = await shopOrderApi.getShopOrderDetail(props.orderId, appStore.locale)
      const data = (res as { data: ShopOrderInfo })?.data ?? null
      orderDetail.value = data

      const getPhonePrefix = (prefix: string | undefined) => {
        return prefix?.split(' ')[0] ?? ''
      }

      if (data) {
        Object.assign(form, {
          name: data.name,
          roomNumber: data.roomNumber,
          phone: data.phone,
          phonePrefix: getPhonePrefix(data.phonePrefix),
          areaCode: data.areaCode ?? '',
          landline: data.landline ?? '',
          email: data.email,
          pickupMethod: data.pickupMethod,
          city: data.city,
          district: data.district,
          zipCode: data.zipCode,
          address: data.address,
          notes: data.notes,
        })
        const map = new Map<string, number>()
        data.orderItems.forEach(item => map.set(item.itemId, item.quantity))
        qtyMap.value = map
      }
    } finally {
      isFetching.value = false
    }
  }
)

// ── Computed ───────────────────────────────────────────────────
const isEdit = computed(() => props.mode === 'edit')

const dialogTitle = computed(() =>
  isEdit.value ? $t('shop.order.detail.editTitle') : $t('shop.order.detail.viewTitle')
)

const displayPhone = computed(() => {
  const d = orderDetail.value
  if (!d) return '—'
  if (d.phonePrefix && d.phone) return `${d.phonePrefix} ${d.phone}`
  return d.phone || '—'
})

const displayLandline = computed(() => {
  const d = orderDetail.value
  if (!d || !d.areaCode || !d.landline) return null
  return `(${d.areaCode}) ${d.landline}`
})

const displayAddress = computed(() => {
  const d = orderDetail.value
  if (!d) return '—'
  return [d.city, d.district, d.zipCode, d.address].filter(Boolean).join(' ') || '—'
})

const pickupOptions = computed(() => [
  { label: $t('shop.order.detail.pickupDelivery'), value: 'delivery' },
  { label: $t('shop.order.detail.pickupPickup'), value: 'pickup' },
])

const displayPickup = computed(() => {
  if (!orderDetail.value) return '—'
  return pickupOptions.value.find(o => o.value === orderDetail.value!.pickupMethod)?.label ?? '—'
})

const currentTotal = computed(() => {
  if (!orderDetail.value) return 0
  return orderDetail.value.orderItems
    .filter(item => !deleteSet.value.has(item.itemId))
    .reduce((sum, item) => {
      const qty = qtyMap.value.get(item.itemId) ?? item.quantity
      return sum + qty * item.productPrice
    }, 0)
})

const isPending = computed(() => orderDetail.value?.orderStatus === 'pending')

// ── Handlers ───────────────────────────────────────────────────
const handleQtyChange = (itemId: string, qty: number) => {
  qtyMap.value = new Map(qtyMap.value).set(itemId, qty)
}

const handleToggleDelete = (itemId: string) => {
  const next = new Set(deleteSet.value)
  if (next.has(itemId)) next.delete(itemId)
  else next.add(itemId)
  deleteSet.value = next
}

const handleConfirm = async () => {
  if (!orderDetail.value || !props.orderId) return
  isSaving.value = true
  try {
    await shopOrderApi.updateShopOrderInfo(props.orderId, { ...form } as ClientInfo)

    const updates = orderDetail.value.orderItems.flatMap(item => {
      const isDeleted = deleteSet.value.has(item.itemId)
      const newQty = qtyMap.value.get(item.itemId) ?? item.quantity
      if (isDeleted) {
        return [
          shopOrderApi.updateOrderItemQuantity(props.orderId!, {
            orderItemId: item.itemId,
            quantity: 0,
          }),
        ]
      }
      if (newQty !== item.quantity) {
        return [
          shopOrderApi.updateOrderItemQuantity(props.orderId!, {
            orderItemId: item.itemId,
            quantity: newQty,
          }),
        ]
      }
      return []
    })

    await Promise.all(updates)
    ElMessage.success($t('shop.order.detail.saveSuccess'))
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error($t('shop.order.detail.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

const handleCheckout = async () => {
  if (!orderDetail.value || !props.orderId) return
  try {
    await HcMessageBox.confirm(
      $t('shop.order.messages.checkoutConfirm', {
        orderName: orderDetail.value.name,
        orderRoom: orderDetail.value.roomNumber,
      }),
      $t('shop.order.actions.checkout'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  isCheckingOut.value = true
  try {
    await shopOrderApi.checkoutOrder(props.orderId)
    ElMessage.success($t('shop.order.messages.checkoutSuccess'))
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error($t('shop.order.messages.checkoutFailed'))
  } finally {
    isCheckingOut.value = false
  }
}

const handleCancelOrder = async () => {
  if (!orderDetail.value || !props.orderId) return
  try {
    await HcMessageBox.confirm(
      h('div', null, [
        h(
          'p',
          { style: 'margin: 0 0 10px 0' },
          $t('shop.order.messages.deleteConfirm', {
            orderName: orderDetail.value.name,
            orderRoom: orderDetail.value.roomNumber,
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
  isCancelling.value = true
  try {
    await shopOrderApi.deleteShopOrder(props.orderId)
    ElMessage.success($t('shop.order.messages.deleteSuccess'))
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error($t('shop.order.messages.deleteFailed'))
  } finally {
    isCancelling.value = false
  }
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :loading="isSaving"
    :show-footer="true"
    width="660px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #footer>
      <!-- view 模式：取消訂單 + 結帳 -->
      <div v-if="!isEdit" class="footer-actions">
        <HcButton
          type="danger"
          plain
          :disabled="!isPending"
          :loading="isCancelling"
          @click="handleCancelOrder"
        >
          {{ $t('shop.order.actions.delete') }}
        </HcButton>
        <HcButton
          :disabled="!isPending || isExpired"
          :loading="isCheckingOut"
          class="btn-checkout"
          @click="handleCheckout"
        >
          <div style="color: #0b6e7a">
            {{ $t('shop.order.actions.checkout') }}
          </div>
        </HcButton>
      </div>
      <!-- edit 模式：取消 + 確認修改 -->
      <div v-else class="footer-actions">
        <HcButton type="danger" plain @click="emit('update:modelValue', false)">
          {{ $t('common.cancel') }}
        </HcButton>
        <HcButton type="primary" :loading="isSaving" @click="handleConfirm">
          {{ $t('shop.order.detail.confirmEdit') }}
        </HcButton>
      </div>
    </template>
    <!-- 載入中 -->
    <div
      v-if="isFetching"
      class="tw-flex tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
    >
      <i class="fa-solid fa-spinner fa-spin tw-text-2xl" />
    </div>

    <template v-else-if="orderDetail">
      <!-- ── 訂購人資訊 ─────────────────────────────────────── -->
      <div class="form-section">
        <div class="form-section__header">
          <i class="fa-solid fa-user form-section__icon" />
          <span>{{ $t('shop.order.detail.sectionClient') }}</span>
        </div>

        <div class="info-grid">
          <!-- 買家姓名 -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.table.name') }}</span>
            <HcInput v-if="isEdit" v-model="form.name" />
            <span v-else>{{ orderDetail.name || '—' }}</span>
          </div>

          <!-- 房號 -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.table.roomNumber') }}</span>
            <HcInput v-if="isEdit" v-model="form.roomNumber" />
            <span v-else>{{ orderDetail.roomNumber || '—' }}</span>
          </div>

          <!-- 手機 -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.table.phoneMobile') }}</span>
            <HcInput v-if="isEdit" v-model="form.phone" :placeholder="'手機號碼'">
              <template #prepend>
                <el-input
                  v-model="form.phonePrefix"
                  placeholder="+886"
                  class="phone-prefix-input"
                />
              </template>
            </HcInput>
            <span v-else>{{ displayPhone }}</span>
          </div>

          <!-- 市話 -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.table.phoneLandline') }}</span>
            <div v-if="isEdit" class="tw-flex tw-gap-2">
              <HcInput
                v-model="form.areaCode"
                :placeholder="'區碼'"
                style="width: 90px; flex-shrink: 0"
              />
              <HcInput v-model="form.landline" :placeholder="'市話號碼'" />
            </div>
            <span v-else>{{ displayLandline || '—' }}</span>
          </div>

          <!-- Email -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.table.email') }}</span>
            <HcInput v-if="isEdit" v-model="form.email" type="email" />
            <span v-else>{{ orderDetail.email || '—' }}</span>
          </div>

          <!-- 取貨方式 -->
          <div class="info-field">
            <span class="info-label">{{ $t('shop.order.detail.pickupMethod') }}</span>
            <el-select v-if="isEdit" v-model="form.pickupMethod" style="width: 100%">
              <el-option
                v-for="opt in pickupOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <span v-else>{{ displayPickup }}</span>
          </div>

          <!-- 地址 -->
          <div class="info-field col-span-2">
            <span class="info-label">{{ $t('shop.order.table.address') }}</span>
            <template v-if="isEdit">
              <div class="addr-row">
                <HcInput v-model="form.city" :placeholder="'縣市'" />
                <HcInput v-model="form.district" :placeholder="'行政區'" />
                <HcInput v-model="form.zipCode" :placeholder="'郵遞區號'" />
              </div>
              <HcInput v-model="form.address" :placeholder="'詳細地址'" class="tw-mt-2" />
            </template>
            <span v-else>{{ displayAddress }}</span>
          </div>

          <!-- 備註 -->
          <div class="info-field col-span-2">
            <span class="info-label">{{ $t('shop.order.table.notes') }}</span>
            <HcInput
              v-if="isEdit"
              v-model="form.notes"
              type="textarea"
              :rows="2"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
            <span v-else class="notes-text">{{ orderDetail.notes || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- ── 訂購商品 ──────────────────────────────────────── -->
      <div class="form-section tw-mt-4">
        <div class="form-section__header">
          <i class="fa-solid fa-box-open form-section__icon" />
          <span>{{ $t('shop.order.detail.sectionItems') }}</span>
          <el-tag size="small" round type="info" class="tw-ml-auto">
            {{ orderDetail.orderItems.length }}
            {{ $t('shop.order.table.orderItemsBtn', { count: '' }).trim() }}
          </el-tag>
        </div>

        <div class="items-list">
          <OrderItemCard
            v-for="item in orderDetail.orderItems"
            :key="item.itemId"
            :item="item"
            :mode="mode"
            :quantity="qtyMap.get(item.itemId) ?? item.quantity"
            :marked-for-delete="deleteSet.has(item.itemId)"
            @quantity-change="handleQtyChange"
            @toggle-delete="handleToggleDelete"
          />
        </div>
      </div>

      <!-- 總計 -->
      <div class="total-row">
        <span class="total-row__label">{{ $t('shop.order.itemCard.orderTotal') }}</span>
        <span class="total-row__amount">NT$ {{ currentTotal.toLocaleString() }}</span>
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

// ── Section Card（與 CategoryFormDialog 相同語彙） ────────────
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

// ── Info Grid ─────────────────────────────────────────────────
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .info-label {
    font-size: 12px;
    color: $color-neutral-500;
    font-weight: 500;
  }

  span:not(.info-label) {
    font-size: 14px;
    color: $color-neutral-800;
    line-height: 1.5;
    min-height: 22px;
  }
}

.col-span-2 {
  grid-column: span 2;
}

.addr-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.notes-text {
  white-space: pre-wrap;
  word-break: break-word;
}

// ── Items List ────────────────────────────────────────────────
.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// ── Phone prefix prepend ──────────────────────────────────────
.phone-prefix-input {
  width: 48px;

  :deep(.el-input__wrapper) {
    padding: 0 6px;
    box-shadow: none !important;
    background: transparent;
  }
}

// ── Footer ────────────────────────────────────────────────────
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.el-button) {
    min-width: 84px;
  }
}

// 結帳按鈕：使用專案深綠色，避免 Element Plus success 過亮
.btn-checkout {
  :deep(.el-button) {
    background-color: #16a34a;
    border-color: #16a34a;

    &:hover,
    &:focus {
      background-color: #15803d;
      border-color: #15803d;
    }
  }
}
.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 20px 12px 20px;
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
