<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, usePermission } from '@monorepo/composables'
import type { ShopOrderInfo } from '@/types/api-params'
import { HcTable, HcButton } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: ShopOrderInfo[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:page': [val: number]
  'update:pageSize': [val: number]
  view: [row: ShopOrderInfo]
  edit: [row: ShopOrderInfo]
  checkout: [row: ShopOrderInfo]
  delete: [row: ShopOrderInfo]
  'items-click': [row: ShopOrderInfo]
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── Table Columns ──────────────────────────────────────────────
const columns = computed(() => [
  {
    prop: 'actions',
    label: $t('common.actions'),
    width: 100,
    fixed: true,
    align: 'center' as const,
  },
  { prop: 'name', label: $t('shop.order.table.name'), minWidth: 100, align: 'center' as const },
  {
    prop: 'roomNumber',
    label: $t('shop.order.table.roomNumber'),
    width: 90,
    align: 'center' as const,
  },
  {
    prop: 'orderStatus',
    label: $t('shop.order.table.orderStatus'),
    width: 110,
    align: 'center' as const,
  },
  {
    prop: 'orderItems',
    label: $t('shop.order.table.orderItems'),
    width: 100,
    align: 'center' as const,
  },
  { prop: 'phone', label: $t('shop.order.table.phone'), width: 150 },
  { prop: 'email', label: $t('shop.order.table.email'), minWidth: 160 },
  { prop: 'address', label: $t('shop.order.table.address'), minWidth: 160 },
  { prop: 'notes', label: $t('shop.order.table.notes'), minWidth: 100 },
  {
    prop: 'expiresAt',
    label: $t('shop.order.table.expiresAt'),
    width: 160,
    align: 'center' as const,
  },
  {
    prop: 'createdAt',
    label: $t('shop.order.table.createdAt'),
    width: 160,
    align: 'center' as const,
  },
])

// ── Helpers ────────────────────────────────────────────────────
type StatusType = 'warning' | 'success' | 'danger'
const statusTagType: Record<string, StatusType> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
  expired: 'danger',
}

function getStatusLabel(status: string) {
  return $t(`shop.order.status.${status}`)
}

function isPending(row: ShopOrderInfo) {
  return row.orderStatus === 'pending'
}

function formatAddress(row: ShopOrderInfo) {
  return [row.city, row.district, row.address].filter(Boolean).join(' ')
}

// phone: phonePrefix + phone 優先；tooltip 顯示兩行
function getPhoneDisplay(row: ShopOrderInfo) {
  if (row.phonePrefix && row.phone) {
    return `${row.phonePrefix} ${row.phone}`
  }
  if (row.areaCode && row.landline) {
    return `${row.areaCode} ${row.landline}`
  }
  return row.phone ?? '—'
}

function getPhoneTooltip(row: ShopOrderInfo) {
  const lines: string[] = []
  if (row.phonePrefix && row.phone) {
    lines.push(`${$t('shop.order.table.phoneMobile')}: ${row.phonePrefix} ${row.phone}`)
  }
  if (row.areaCode && row.landline) {
    lines.push(`${$t('shop.order.table.phoneLandline')}: ${row.areaCode} ${row.landline}`)
  }
  return lines.join('\n')
}

function handleCommand(cmd: string, row: ShopOrderInfo) {
  if (cmd === 'edit') emit('edit', row)
  else if (cmd === 'checkout') emit('checkout', row)
  else if (cmd === 'delete') emit('delete', row)
}

// HcTable 用動態 slot name（col.prop）轉發欄位，TS 無法推導出實際的欄位型別，
// scope 在這裡會退化成 HcTable 的預設型別，用這個 helper 轉回正確型別
function asOrder(row: unknown) {
  return row as ShopOrderInfo
}
</script>

<template>
  <HcTable
    :columns="columns"
    :data="data"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :loading="loading"
    @update:page="emit('update:page', $event)"
    @update:page-size="emit('update:pageSize', $event)"
  >
    <!-- Actions -->
    <template #actions="{ scope }">
      <div class="tw-flex tw-items-center tw-gap-1">
        <!-- View 常駐 -->
        <el-tooltip :content="$t('shop.order.actions.view')" placement="top">
          <HcButton text type="info" size="small" @click="emit('view', asOrder(scope))">
            <i class="fa-solid fa-eye" />
          </HcButton>
        </el-tooltip>

        <!-- ⋯ 下拉選單 -->
        <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, asOrder(scope))">
          <span style="display: inline-block">
            <HcButton text type="info" size="small" circle plain>
              <i class="fa-solid fa-ellipsis" />
            </HcButton>
          </span>
          <template #dropdown>
            <el-dropdown-menu popper-class="test">
              <div style="padding: 0 4px">
                <el-dropdown-item
                  command="edit"
                  v-if="canPerformAction('/shop/orders', 'update')"
                  :disabled="!isPending(asOrder(scope))"
                >
                  <div>
                    <i class="fa-solid fa-pen tw-mr-2" />
                    {{ $t('shop.order.actions.edit') }}
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="checkout" :disabled="!isPending(asOrder(scope))">
                  <div style="color: #67c23a">
                    <i class="fa-solid fa-circle-check tw-mr-2" />
                    {{ $t('shop.order.actions.checkout') }}
                  </div>
                </el-dropdown-item>
                <el-dropdown-item
                  command="delete"
                  v-if="canPerformAction('/shop/orders', 'delete')"
                  :disabled="!isPending(asOrder(scope))"
                  class="dropdown-danger"
                >
                  <div style="color: #f56c6c">
                    <i class="fa-solid fa-ban tw-mr-2" />
                    {{ $t('shop.order.actions.delete') }}
                  </div>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>

    <!-- 訂單狀態 -->
    <!-- TODO 確認訂單狀態是否被後端更新 -->
    <template #orderStatus="{ scope }">
      <el-tag :type="statusTagType[scope.orderStatus] ?? 'info'" size="small" round>
        {{ getStatusLabel(scope.orderStatus) }}
      </el-tag>
    </template>

    <!-- Order Items 按鈕 -->
    <template #orderItems="{ scope }">
      <HcButton size="small" plain class="tw-gap-1" @click="emit('items-click', asOrder(scope))">
        <i class="fa-solid fa-box-open tw-mr-1" />
        {{ $t('shop.order.table.orderItemsBtn', { count: scope.orderItems?.length ?? 0 }) }}
      </HcButton>
    </template>

    <!-- Phone with tooltip -->
    <template #phone="{ scope }">
      <el-tooltip
        v-if="getPhoneTooltip(asOrder(scope))"
        :content="getPhoneTooltip(asOrder(scope))"
        placement="top"
        :enterable="false"
      >
        <span class="tw-cursor-default">{{ getPhoneDisplay(asOrder(scope)) }}</span>
      </el-tooltip>
      <span v-else>{{ getPhoneDisplay(asOrder(scope)) }}</span>
    </template>

    <!-- Address -->
    <template #address="{ scope }">
      <el-tooltip
        v-if="formatAddress(asOrder(scope))"
        :content="formatAddress(asOrder(scope))"
        placement="top"
        :enterable="false"
      >
        <span class="tw-cursor-default">{{ formatAddress(asOrder(scope)) }}</span>
      </el-tooltip>
    </template>

    <!-- Notes with truncation + tooltip -->
    <template #notes="{ scope }">
      <el-tooltip
        v-if="scope.notes"
        :content="scope.notes"
        placement="top"
        :show-after="300"
        :enterable="false"
      >
        <span class="notes-cell">{{ scope.notes }}</span>
      </el-tooltip>
      <span v-else class="tw-text-slate-400">—</span>
    </template>
  </HcTable>
</template>

<style scoped lang="scss">
.notes-cell {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  vertical-align: middle;
  cursor: default;
}

// Dropdown 被 teleport 到 body，需用 :global() 才能命中
:global(.order-actions-menu .el-dropdown-menu) {
  padding: 4px;
}

:global(.order-actions-menu .dropdown-checkout.el-dropdown-menu__item) {
  color: #16a34a;

  &:not(.is-disabled):hover {
    color: #16a34a;
    background-color: rgba(22, 163, 74, 0.1);
  }
}

:global(.order-actions-menu .dropdown-danger.el-dropdown-menu__item) {
  color: #dc2626;

  &:not(.is-disabled):hover {
    color: #dc2626;
    background-color: rgba(220, 38, 38, 0.1);
  }
}
</style>
