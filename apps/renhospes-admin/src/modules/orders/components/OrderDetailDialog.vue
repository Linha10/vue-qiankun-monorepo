<script setup lang="ts">
import { ref, watch } from 'vue'
import { ordersApi } from '@/api/orders'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { statusTag } from '@/utils/bookingStatus'
import { HcDialog } from '@monorepo/ui-kit'

// ── Props / Emits ──────────────────────────────────────────────
interface Props {
  modelValue: boolean
  bookingId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

// ── i18n / store ───────────────────────────────────────────────
const { $t } = useI18n()
const appStore = useAppStore()

// ── 狀態 ──────────────────────────────────────────────────────
const isLoading = ref(false)
const detail = ref<Record<string, any> | null>(null)

// ── API: getBookingDetail ──────────────────────────────────────
// 每次 bookingId 變動且 dialog 開啟時，重新抓取詳情
watch(
  () => [props.modelValue, props.bookingId] as const,
  async ([visible, id]) => {
    if (!visible || !id) {
      detail.value = null
      return
    }
    isLoading.value = true
    try {
      const res = await ordersApi.getBookingDetail(id, appStore.locale as string)
      detail.value = (res as any)?.data ?? null
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)

// ── 狀態 tag 樣式 ──────────────────────────────────────────────
// statusTag 導入自 @/utils/bookingStatus
</script>

<template>
  <!-- API: getBookingDetail — 查詢(單筆)訂單詳情 -->
  <HcDialog
    :model-value="modelValue"
    :title="$t('orders.detail.title')"
    width="620px"
    :show-footer="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="isLoading" style="min-height: 120px">
      <template v-if="detail">
        <!-- 聯絡人資訊 -->
        <p class="tw-text-sm tw-font-semibold tw-text-slate-500 tw-mb-2">
          {{ $t('orders.detail.guestInfo') }}
        </p>
        <el-descriptions :column="2" border size="small" class="tw-mb-5">
          <el-descriptions-item :label="$t('orders.columns.bookingId')">
            {{ detail.bookingNo ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.status')">
            <el-tag :type="statusTag(detail.bookingStatus)" size="small">
              {{ $t(`orders.status.${detail.bookingStatus}`) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.contactName')">
            {{ detail.contactName ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.contactPhone')">
            {{ detail.contactPhone ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.contactEmail')" :span="2">
            {{ detail.contactEmail ?? '—' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 住宿資訊 -->
        <p class="tw-text-sm tw-font-semibold tw-text-slate-500 tw-mb-2">
          {{ $t('orders.detail.stayInfo') }}
        </p>
        <el-descriptions :column="2" border size="small" class="tw-mb-5">
          <el-descriptions-item :label="$t('orders.columns.checkInDate')">
            {{ detail.checkInDate ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.checkOutDate')">
            {{ detail.checkOutDate ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.detail.nights')">
            {{ detail.nights ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.roomCount')">
            {{ detail.items?.[0]?.quantity ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.adults')">
            {{ detail.items?.[0]?.adults ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.children')">
            {{ detail.items?.[0]?.children ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.roomTypeId')" :span="2">
            {{ detail.items?.[0]?.roomTypeId ?? '—' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 費用資訊 -->
        <p class="tw-text-sm tw-font-semibold tw-text-slate-500 tw-mb-2">
          {{ $t('orders.detail.priceInfo') }}
        </p>
        <el-descriptions :column="2" border size="small" class="tw-mb-5">
          <el-descriptions-item :label="$t('orders.detail.pricePerNight')">
            {{
              detail.items?.[0]?.pricePerNight != null ? `$${detail.items[0].pricePerNight}` : '—'
            }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.detail.subtotal')">
            {{ detail.subtotal != null ? `$${detail.subtotal}` : '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.detail.taxes')">
            {{ detail.taxes != null ? `$${detail.taxes}` : '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.detail.total')">
            <span class="tw-font-semibold tw-text-primary">
              {{ detail.total != null ? `$${detail.total}` : '—' }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 其他資訊 -->
        <p class="tw-text-sm tw-font-semibold tw-text-slate-500 tw-mb-2">
          {{ $t('orders.detail.otherInfo') }}
        </p>
        <el-descriptions class="tw-mb-[12px]" :column="1" border size="small">
          <el-descriptions-item :label="$t('orders.columns.memberId')">
            {{ detail.userId ?? '—' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('orders.columns.specialRequest')">
            {{ detail.specialRequest || '—' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-empty v-else-if="!isLoading" :description="$t('common.noData')" />
    </div>
  </HcDialog>
</template>
