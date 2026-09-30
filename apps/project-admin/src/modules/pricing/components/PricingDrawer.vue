<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { HcMessageBox } from '@monorepo/utils'
import { useI18n, usePermission } from '@monorepo/composables'
import { pricingApi } from '@/api/pricing'

interface Props {
  modelValue: boolean
  roomTypeId: string
  roomData: any
  selectedDate: Date | null
  editingRule: any
  dayOfWeek?: number // 若傳入則為週規則模式
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'rule-saved'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const { $t } = useI18n()
const { canPerformAction } = usePermission()

// ── 抽屜狀態 ──
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emits('update:modelValue', value),
})

// ── 表單數據 ──
const fixedAmount = ref<number>(0)
const multiplier = ref<number>(100)
const isLoading = ref(false)

// ── 計算屬性 ──
const drawerTitle = computed(
  () => `${$t('pricing.title')} - ${props.editingRule ? $t('common.edit') : $t('common.create')}`
)

const finalPrice = computed(() => {
  const base = props.roomData?.basePrice || 0
  const m = multiplier.value || 0
  const f = fixedAmount.value || 0
  return Math.round((base * (m / 100) + f) * 100) / 100
})

const dateDisplay = computed(() => {
  if (props.dayOfWeek !== undefined) {
    const labels = [
      $t('pricing.sunday'),
      $t('pricing.monday'),
      $t('pricing.tuesday'),
      $t('pricing.wednesday'),
      $t('pricing.thursday'),
      $t('pricing.friday'),
      $t('pricing.saturday'),
    ]
    return labels[props.dayOfWeek] ?? ''
  }
  if (!props.selectedDate) return ''
  return dayjs(props.selectedDate).format('YYYY/MM/DD')
})

// ── 監聽編輯規則變化 ──
watch(
  () => props.editingRule,
  newRule => {
    if (newRule) {
      fixedAmount.value = newRule.fixedAmount || 0
      multiplier.value = newRule.multiplier || 100
    } else {
      fixedAmount.value = 0
      multiplier.value = 100
    }
  },
  { deep: true }
)

// ── 保存規則 ──
async function handleSave() {
  const base = props.roomData?.basePrice || 0
  const m = multiplier.value || 0
  const f = fixedAmount.value || 0

  const msgNode = h(
    'div',
    { style: 'font-size: 14px; line-height: 2.2;padding-left:24px;padding-top:12px;' },
    [
      h('div', null, [$t('pricing.currentBasePrice') + '：', h('strong', null, `NT$ ${base}`)]),
      h('div', null, [$t('pricing.currentMultiplier') + '：', h('strong', null, `${m} %`)]),
      h('div', null, [$t('pricing.currentFixedAmount') + '：', h('strong', null, `NT$ ${f}`)]),
      h('div', { style: 'padding-top: 12px;' }, [
        $t('pricing.finalAmount') + '：',
        h('strong', { style: 'font-size: 18px; color: #15803d' }, `NT$ ${finalPrice.value}`),
      ]),
    ]
  )

  try {
    await HcMessageBox.confirm(msgNode, $t('pricing.confirmPricingUpdate'), {
      confirmButtonText: $t('pricing.confirmUpdate'),
      cancelButtonText: $t('common.cancel'),
    })
  } catch {
    return
  }

  isLoading.value = true
  try {
    const isWeeklyMode = props.dayOfWeek !== undefined

    if (isWeeklyMode) {
      const weekPayload = {
        roomTypeId: props.roomTypeId,
        dayOfWeek: props.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        fixedAmount: f,
        multiplier: m,
      }
      if (props.editingRule?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await pricingApi.updateRoomPriceRuleByWeek(props.editingRule.id, weekPayload as any)
        ElMessage.success($t('messages.updateSuccess', { type: $t('pricing.title') }))
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await pricingApi.createRoomPriceRuleByWeek(weekPayload as any)
        ElMessage.success($t('messages.createSuccess', { type: $t('pricing.title') }))
      }
    } else {
      const ruleDate = props.selectedDate
        ? dayjs(props.selectedDate).format('YYYY-MM-DD')
        : undefined
      const payload: any = {
        roomTypeId: props.roomTypeId,
        ruleDate,
        fixedAmount: f,
        multiplier: m,
      }
      if (props.editingRule?.id) {
        await pricingApi.updateRoomPriceRuleByDate(props.editingRule.id, payload)
        ElMessage.success($t('messages.updateSuccess', { type: $t('pricing.title') }))
      } else {
        await pricingApi.createRoomPriceRuleByDate(payload)
        ElMessage.success($t('messages.createSuccess', { type: $t('pricing.title') }))
      }
    }

    emits('rule-saved')
    isOpen.value = false
  } catch (error) {
    ElMessage.error($t('messages.createFailed', { type: $t('pricing.title') }))
  } finally {
    isLoading.value = false
  }
}

// ── 刪除規則 ──
async function handleDelete() {
  if (!props.editingRule?.id) return

  try {
    if (props.dayOfWeek === undefined) {
      await pricingApi.deleteRoomPriceRuleByDate(props.editingRule.id)
    } else {
      await pricingApi.deleteRoomPriceRuleByWeek(props.editingRule.id)
    }
    ElMessage.success($t('messages.deleteSuccess'))
    emits('rule-saved')
    isOpen.value = false
  } catch (error) {
    ElMessage.error($t('messages.deleteFailed'))
  }
}

// ── 抽屜關閉 ──
function handleDrawerClose() {
  isOpen.value = false
  emits('close')
}
</script>

<template>
  <el-drawer
    v-model="isOpen"
    :title="drawerTitle"
    size="40%"
    append-to-body
    @close="handleDrawerClose"
    class="pricing-drawer"
  >
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-space-y-5 tw-flex-1 tw-overflow-y-auto">
        <!-- 規則日期 / 星期 -->
        <div class="tw-pb-4 tw-border-b tw-border-slate-100">
          <div style="font-size: 24px" class="tw-text-slate-400 tw-font-normal tw-leading-tight">
            {{ dayOfWeek !== undefined ? $t('pricing.dayOfWeek') : $t('pricing.ruleDate') }}
          </div>
          <div style="font-size: 20px" class="tw-font-bold tw-text-slate-800 tw-mt-1">
            {{ dateDisplay }}
          </div>
        </div>

        <!-- 計算公式（直式） -->
        <div class="tw-space-y-4">
          <!-- 基價 -->
          <div class="tw-bg-slate-50 tw-rounded-xl tw-px-5 tw-py-4 tw-border tw-border-slate-200">
            <div class="tw-text-sm tw-text-slate-500 tw-mb-1">
              {{ $t('pricing.basePriceLabel') }}
            </div>
            <div style="font-size: 24px" class="tw-font-bold tw-text-slate-800">
              NT$ {{ roomData?.basePrice || 0 }}
            </div>
          </div>

          <div style="font-size: 24px" class="tw-font-bold tw-text-slate-600 tw-px-2">×</div>

          <!-- 乘數 -->
          <div class="tw-bg-slate-50 tw-rounded-xl tw-px-5 tw-py-4 tw-border tw-border-slate-200">
            <div class="tw-text-sm tw-text-slate-500 tw-mb-2">{{ $t('pricing.multiplier') }}</div>
            <el-input v-model.number="multiplier" type="number" step="1" :min="0" size="large">
              <template #append>
                <span style="font-size: 16px; font-weight: 600">%</span>
              </template>
            </el-input>
          </div>

          <div style="font-size: 24px" class="tw-font-bold tw-text-slate-600 tw-px-2">+</div>

          <!-- 固定金額 -->
          <div class="tw-bg-slate-50 tw-rounded-xl tw-px-5 tw-py-4 tw-border tw-border-slate-200">
            <div class="tw-text-sm tw-text-slate-500 tw-mb-2">{{ $t('pricing.fixedAmount') }}</div>
            <el-input v-model.number="fixedAmount" type="number" :min="0" size="large">
              <template #prepend>
                <span style="font-size: 16px; font-weight: 600">NT$</span>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 最終金額（按鈕上方，滿版） -->
      <div
        class="tw-mb-6 tw-rounded-lg tw-bg-green-50 tw-border tw-border-green-200 tw-px-6 tw-py-4 tw-flex tw-items-center tw-justify-between"
      >
        <span class="tw-text-sm tw-text-green-700">{{ $t('pricing.finalPrice') }}</span>
        <span class="tw-text-2xl tw-font-bold tw-text-green-700">NT$ {{ finalPrice }}</span>
      </div>

      <!-- 按鈕組 (底部固定) -->
      <div class="tw-flex tw-gap-3 tw-mb-6 tw-mt-0">
        <HcButton
          v-if="editingRule?.id && canPerformAction('/pricing', 'delete')"
          type="danger"
          @click="handleDelete"
          :loading="isLoading"
          class="tw-flex-1"
        >
          {{ $t('common.delete') }}
        </HcButton>
        <HcButton
          v-if="canPerformAction('/pricing', editingRule?.id ? 'update' : 'create')"
          type="primary"
          @click="handleSave"
          :loading="isLoading"
          class="tw-flex-1"
        >
          {{ $t('button.save') }}
        </HcButton>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  width: 100%;
}
</style>
