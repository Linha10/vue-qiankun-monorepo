<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { inventoryApi } from '@/api/inventory'
import { useI18n, usePermission } from '@monorepo/composables'
import { HcButton, HcInputNumber, HcRadio } from '@monorepo/ui-kit'

interface Props {
  modelValue: boolean
  roomTypeId: string
  date: ReturnType<typeof dayjs> | null
  item: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

const { $t } = useI18n()
const { canPerformAction } = usePermission()

const isSubmitting = ref(false)
const form = ref({
  totalInventory: 0,
  status: 1 as 0 | 1,
  maxAdults: 0,
  maxChildren: 0,
  price: 0,
})

watch(
  () => props.item,
  item => {
    form.value.totalInventory = item?.totalInventory ?? 0
    form.value.status = (item?.status ?? 1) as 0 | 1
    form.value.maxAdults = item?.maxAdults ?? 0
    form.value.maxChildren = item?.maxChildren ?? 0
    form.value.price = item?.price ?? 0
  },
  { immediate: true }
)

const drawerTitle = computed(() => {
  const dateStr = props.date ? props.date.format('YYYY / MM / DD') : ''
  return `${$t('inventory.editTitle')} — ${dateStr}`
})

const availableDisplay = computed(() => {
  if (!props.item) return '-'
  return (props.item as any).availableRooms ?? props.item.totalInventory ?? '-'
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!props.item) return
  const id = (props.item as any).inventoryId ?? (props.item as any).id
  if (!id) return

  isSubmitting.value = true
  try {
    await inventoryApi.updateRoomInventory(id, {
      totalInventory: form.value.totalInventory,
      status: form.value.status,
      maxAdults: form.value.maxAdults,
      maxChildren: form.value.maxChildren,
      price: form.value.price,
    })
    ElMessage.success($t('inventory.updateSuccess'))
    emit('saved')
  } catch {
    ElMessage.error($t('inventory.updateFailed'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="drawerTitle"
    direction="rtl"
    size="360px"
    @close="handleClose"
  >
    <template v-if="item">
      <!-- 目前狀態摘要 -->
      <div class="info-block tw-mb-6">
        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.availableRooms') }}</span>
          <span class="info-block__value">{{ availableDisplay }}</span>
        </div>
        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.totalInventory') }}</span>
          <span class="info-block__value">{{ item.totalInventory }}</span>
        </div>

        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.maxAdults') }}</span>
          <span class="info-block__value">{{ item.maxAdults ?? '-' }}</span>
        </div>
        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.maxChildren') }}</span>
          <span class="info-block__value">{{ item.maxChildren ?? '-' }}</span>
        </div>
        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.price') }}</span>
          <span class="info-block__value">{{ item.price != null ? item.price : '-' }}</span>
        </div>
        <div class="info-block__row">
          <span class="info-block__label">{{ $t('inventory.status') }}</span>
          <el-tag :type="item.status === 1 ? 'success' : 'info'" size="small">
            {{ item.status === 1 ? $t('inventory.statusOpen') : $t('inventory.statusClosed') }}
          </el-tag>
        </div>
      </div>

      <!-- 編輯表單 -->
      <el-form label-position="top">
        <el-form-item :label="$t('inventory.totalInventory')">
          <HcInputNumber
            v-model="form.totalInventory"
            :min="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('inventory.maxAdults')">
          <HcInputNumber
            v-model="form.maxAdults"
            :min="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('inventory.maxChildren')">
          <HcInputNumber
            v-model="form.maxChildren"
            :min="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('inventory.price')">
          <HcInputNumber
            v-model="form.price"
            :min="0"
            :step="1"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('inventory.status')">
          <el-radio-group v-model="form.status">
            <HcRadio :value="1">{{ $t('inventory.statusOpen') }}</HcRadio>
            <HcRadio :value="0">{{ $t('inventory.statusClosed') }}</HcRadio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>

    <!-- 無庫存狀態 -->
    <template v-else>
      <el-empty :description="$t('inventory.noInventoryForDate')" />
    </template>

    <template #footer>
      <div class="tw-flex tw-gap-3 tw-justify-end">
        <HcButton @click="handleClose">{{ $t('common.cancel') }}</HcButton>
        <HcButton
          v-if="item && canPerformAction('/inventory', 'update')"
          type="primary"
          :loading="isSubmitting"
          @click="handleSave"
        >
          {{ $t('button.save') }}
        </HcButton>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
.info-block {
  background: $color-bg-page;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  &__label {
    color: $color-text-muted;
  }

  &__value {
    font-weight: 600;
    color: $color-text-primary;
  }
}
</style>
