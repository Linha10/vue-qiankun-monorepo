<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { inventoryApi } from '@/api/inventory'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { HcDialog, HcDatePicker } from '@monorepo/ui-kit'

const props = defineProps<{
  modelValue: boolean
  roomTypeId: string
  roomTypeName: string
  images: Array<{ url: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

const { $t } = useI18n()
const appStore = useAppStore()

// ── Dialog 標題（響應語系，利用已傳入的 roomTypeName prop）──
const dialogTitle = computed(() =>
  $t('inventory.generateDialogTitle', { name: props.roomTypeName })
)

// ── 日期範圍：預設今日至本月底 ──
const todayStr = () => dayjs().format('YYYY-MM-DD')
const monthEndStr = () => dayjs().endOf('month').format('YYYY-MM-DD')

const dateRange = ref<[string, string]>([todayStr(), monthEndStr()])

// 每次開啟 dialog 時 reset
watch(
  () => props.modelValue,
  open => {
    if (open) {
      dateRange.value = [todayStr(), monthEndStr()]
    }
  }
)

// 過去日期停用（早於今天的日期不可選）
const disabledDate = (date: Date) => dayjs(date).isBefore(dayjs().startOf('day'))

// ── 快捷選項（computed 響應 locale 切換）──
const shortcuts = computed(() => [
  {
    text: $t('inventory.shortcutNextMonth'),
    value: () => {
      const next = dayjs().add(1, 'month')
      return [next.startOf('month').toDate(), next.endOf('month').toDate()]
    },
  },
  {
    text: $t('inventory.shortcutThreeMonths'),
    value: () => [
      dayjs().startOf('month').toDate(),
      dayjs().add(2, 'month').endOf('month').toDate(),
    ],
  },
  {
    text: $t('inventory.shortcutSixMonths'),
    value: () => [
      dayjs().startOf('month').toDate(),
      dayjs().add(5, 'month').endOf('month').toDate(),
    ],
  },
])

// ── 生成庫存（防連點：isSubmitting 守門 + HcDialog :loading 禁用按鈕）──
const isSubmitting = ref(false)

const handleConfirm = async () => {
  if (isSubmitting.value) return
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) return

  isSubmitting.value = true
  const startDate = dateRange.value[0]
  const endDate = dateRange.value[1]

  try {
    await inventoryApi.generateRoomInventory(props.roomTypeId, startDate, endDate)
    ElMessage.success(
      $t('inventory.generateSuccessMsg', {
        name: props.roomTypeName,
        range: `${startDate} ~ ${endDate}`,
      })
    )
    emit('update:modelValue', false)
    emit('saved')
  } catch {
    ElMessage.error($t('inventory.generateFailed'))
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = (val: boolean) => {
  emit('update:modelValue', val)
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="600px"
    :loading="isSubmitting"
    :confirm-text="$t('inventory.generate')"
    @update:model-value="handleClose"
    @confirm="handleConfirm"
  >
    <!-- 上半部：圖片輪播 -->
    <el-carousel
      v-if="images.length > 0"
      height="260px"
      trigger="click"
      :autoplay="images.length > 1"
      indicator-position="outside"
    >
      <el-carousel-item v-for="(img, i) in images" :key="i">
        <img :src="img.url" class="carousel-img" :alt="`${roomTypeName} ${i + 1}`" />
      </el-carousel-item>
    </el-carousel>

    <!-- 無圖片時的佔位 -->
    <div v-else class="carousel-placeholder">
      <el-icon :size="40" class="tw-text-slate-300">
        <picture />
      </el-icon>
    </div>

    <!-- 下半部：日期範圍選擇 -->
    <div class="tw-mt-5">
      <p class="tw-text-sm tw-font-medium tw-text-slate-600 tw-mb-2">
        {{ $t('inventory.dateRangeLabel') }}
      </p>
      <div class="date-picker-wrapper">
        <HcDatePicker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :shortcuts="shortcuts"
          :disabled-date="disabledDate"
          :start-placeholder="appStore.locale === 'en' ? 'Start date' : '開始日期'"
          :end-placeholder="appStore.locale === 'en' ? 'End date' : '結束日期'"
          style="width: 100%"
        />
      </div>
    </div>
  </HcDialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: $color-neutral-900;
  border-radius: 6px;
}

.carousel-placeholder {
  height: 260px;
  background: $color-neutral-100;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker-wrapper {
  width: 97%;
  :deep(.el-date-editor) {
    width: 100% !important;
  }
}
</style>
