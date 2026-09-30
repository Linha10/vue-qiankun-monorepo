<script setup lang="ts">
import { ref, watch, computed, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { House, User, Calendar, Phone } from '@element-plus/icons-vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ordersApi } from '@/api/orders'
import { roomTypeApi } from '@/api/roomType'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { HcDialog, HcInputNumber, HcDatePicker } from '@monorepo/ui-kit'
import type { BookingItem, BookingContactInfo } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
interface Props {
  modelValue: boolean
  editData: Record<string, any> | null // null = 建立模式
  hotelId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

// ── i18n / store ───────────────────────────────────────────────
const { $t } = useI18n()
const appStore = useAppStore()
const queryClient = useQueryClient()

// ── 模式判斷 ──────────────────────────────────────────────────
const isEditMode = computed(() => !!props.editData)
const dialogTitle = computed(() =>
  isEditMode.value ? $t('orders.form.editTitle') : $t('orders.form.createTitle')
)

// ── 房型選項（API: roomTypeApi.getRoomTypes）──────────────────
interface RoomTypeOption {
  roomTypeId: string
  name: string
  maxAdults: number
  maxChildren: number
}
const roomTypeOptions = ref<RoomTypeOption[]>([])
const isRoomTypeLoading = ref(false)

const loadRoomTypes = async () => {
  if (!props.hotelId) return
  isRoomTypeLoading.value = true
  try {
    const res = await roomTypeApi.getRoomTypes({
      page: 1,
      pageSize: 100,
      hotelId: props.hotelId,
      lang: appStore.locale as 'zh' | 'en',
      status: 1,
    })
    const list = (res as any)?.data?.list ?? []
    roomTypeOptions.value = list.map((rt: any) => ({
      roomTypeId: rt.roomTypeId,
      name: rt.name?.[appStore.locale] || rt.name?.zh || rt.name || rt.roomTypeId,
      maxAdults: rt.maxAdults ?? 10,
      maxChildren: rt.maxChildren ?? 10,
    }))
  } finally {
    isRoomTypeLoading.value = false
  }
}

// ── 表單 ──────────────────────────────────────────────────────
const formRef = ref<FormInstance>()

const emptyForm = (): BookingItem & { stayDates: string[] } => ({
  roomTypeId: '',
  memberId: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  checkInDate: '',
  checkOutDate: '',
  adults: 1,
  children: 0,
  roomCount: 1,
  specialRequest: '',
  stayDates: [],
})

const form = ref(emptyForm())

// 目前選中的房型資料（用於動態限制人數上限）
const selectedRoomTypeData = computed(() =>
  roomTypeOptions.value.find(rt => rt.roomTypeId === form.value.roomTypeId)
)
const maxAdults = computed(
  () => (selectedRoomTypeData.value?.maxAdults ?? 10) * (form.value.roomCount || 1)
)
const maxChildren = computed(
  () => (selectedRoomTypeData.value?.maxChildren ?? 10) * (form.value.roomCount || 1)
)

// 當 max 縮小時自動夾緊，避免超出新上限的舊值殘留
watchEffect(() => {
  if ((form.value.adults ?? 0) > maxAdults.value) {
    form.value.adults = maxAdults.value
  }
  if ((form.value.children ?? 0) > maxChildren.value) {
    form.value.children = maxChildren.value
  }
})

// 日期範圍雙向繫結
const stayDates = computed({
  get: () =>
    form.value.checkInDate && form.value.checkOutDate
      ? [form.value.checkInDate, form.value.checkOutDate]
      : [],
  set: (val: string[]) => {
    form.value.checkInDate = val?.[0] ?? ''
    form.value.checkOutDate = val?.[1] ?? ''
  },
})

// 表單驗證規則
const rules = computed<FormRules>(() => ({
  roomTypeId: [
    {
      required: true,
      message: $t('form.pleaseSelect', { field: $t('orders.form.roomType') }),
      trigger: 'change',
    },
  ],
  // TODO(restore-required): 會員 ID 目前非必填，恢復時取消下方註解
  // memberId: [
  //   {
  //     required: true,
  //     message: $t('form.pleaseFill', { field: $t('orders.columns.memberId') }),
  //     trigger: 'blur',
  //   },
  // ],
  contactName: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('orders.columns.contactName') }),
      trigger: 'blur',
    },
  ],
  contactPhone: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('orders.columns.contactPhone') }),
      trigger: 'blur',
    },
  ],
}))

// 禁止選取今天以前的日期
const disabledDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// ── Dialog 開關處理 ────────────────────────────────────────────
watch(
  () => props.modelValue,
  async visible => {
    if (!visible) {
      formRef.value?.resetFields()
      form.value = emptyForm()
      return
    }
    // 載入房型選項
    await loadRoomTypes()
    // 編輯模式：回填資料
    if (props.editData) {
      const firstItem = (props.editData.items as any[])?.[0] ?? {}
      form.value = {
        ...emptyForm(),
        ...props.editData,
        roomTypeId: props.editData.roomTypeId || firstItem.roomTypeId || '',
        adults: props.editData.adults ?? firstItem.adults ?? 1,
        children: props.editData.children ?? firstItem.children ?? 0,
        roomCount: props.editData.roomCount ?? firstItem.quantity ?? 1,
        stayDates:
          props.editData.checkInDate && props.editData.checkOutDate
            ? [props.editData.checkInDate, props.editData.checkOutDate]
            : [],
      }
    }
  }
)

// ── API: createBooking ─────────────────────────────────────────
const { mutate: doCreate, isPending: isCreating } = useMutation({
  mutationFn: (payload: BookingItem) => ordersApi.createBooking(payload),
  onSuccess: () => {
    ElMessage.success($t('orders.form.createSuccess'))
    queryClient.invalidateQueries({ queryKey: ['bookingList'] })
    emit('update:modelValue', false)
    emit('saved')
  },
})

// ── API: updateBooking ─────────────────────────────────────────
const { mutate: doUpdate, isPending: isUpdating } = useMutation({
  mutationFn: ({ id, data }: { id: string; data: BookingContactInfo }) =>
    ordersApi.updateBooking(id, data),
  onSuccess: () => {
    ElMessage.success($t('orders.form.updateSuccess'))
    queryClient.invalidateQueries({ queryKey: ['bookingList'] })
    emit('update:modelValue', false)
    emit('saved')
  },
})

const isSaving = computed(() => isCreating.value || isUpdating.value)

// ── 送出 ──────────────────────────────────────────────────────
async function handleConfirm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (isEditMode.value) {
    const contactPayload: BookingContactInfo = {
      contactName: form.value.contactName,
      contactEmail: form.value.contactEmail,
      contactPhone: form.value.contactPhone,
      specialRequest: form.value.specialRequest,
    }
    doUpdate({ id: props.editData!.id, data: contactPayload })
    return
  }

  const { stayDates: _stayDates, ...payload } = form.value
  doCreate({ ...(payload as BookingItem), hotelId: props.hotelId })
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <!-- API: createBooking / updateBooking -->
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="700px"
    :loading="isSaving"
    :confirm-text="isEditMode ? $t('common.update') : $t('common.confirm')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <!-- 編輯模式 header：顯示訂單關鍵資訊，避免使用者忘記目前編輯的是哪筆 -->
    <template v-if="isEditMode" #header>
      <div class="form-dialog-header">
        <span class="form-dialog-header__title">{{ dialogTitle }}</span>
        <div class="form-dialog-header__meta">
          <span class="meta-badge meta-badge--no"> # {{ props.editData?.bookingNo }} </span>
          <span v-if="props.editData?.contactName" class="meta-badge">
            <el-icon><User /></el-icon>
            {{ props.editData.contactName }}
          </span>
          <span
            v-if="props.editData?.checkInDate && props.editData?.checkOutDate"
            class="meta-badge"
          >
            <el-icon><Calendar /></el-icon>
            {{ props.editData.checkInDate }} ~ {{ props.editData.checkOutDate }}
          </span>
        </div>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="default">
      <!-- ── 區塊：住宿資訊 ── -->
      <div class="form-section">
        <div class="form-section__header">
          <el-icon class="form-section__icon"><House /></el-icon>
          <span>{{ $t('orders.detail.stayInfo') }}</span>
        </div>
        <el-row :gutter="16">
          <!-- 房型 -->
          <el-col :span="12">
            <el-form-item :label="$t('orders.form.roomType')" prop="roomTypeId">
              <el-select
                v-model="form.roomTypeId"
                :loading="isRoomTypeLoading"
                :disabled="isEditMode"
                filterable
                class="tw-w-full"
                :placeholder="$t('form.pleaseSelect', { field: $t('orders.form.roomType') })"
              >
                <el-option
                  v-for="opt in roomTypeOptions"
                  :key="opt.roomTypeId"
                  :label="opt.name"
                  :value="opt.roomTypeId"
                />
              </el-select>
              <!-- 房型限制提示 -->
              <transition name="el-fade-in">
                <div v-if="selectedRoomTypeData" class="room-limits">
                  <el-icon><User /></el-icon>
                  {{ $t('orders.columns.adults') }} ≤ {{ selectedRoomTypeData.maxAdults }}
                  <span class="tw-mx-1">·</span>
                  {{ $t('orders.columns.children') }} ≤ {{ selectedRoomTypeData.maxChildren }}
                </div>
              </transition>
            </el-form-item>
          </el-col>

          <!-- 會員 ID -->
          <el-col :span="12">
            <!-- TODO(restore-required): 恢復必填時加回 prop="memberId" -->
            <el-form-item :label="$t('orders.columns.memberId')">
              <el-input
                v-model="form.memberId"
                disabled
                :placeholder="$t('form.pleaseFill', { field: $t('orders.columns.memberId') })"
              />
            </el-form-item>
          </el-col>

          <!-- 入住 / 退房日期 -->
          <el-col :span="24">
            <el-form-item :label="$t('orders.form.stayDates')">
              <HcDatePicker
                v-model="stayDates"
                type="daterange"
                value-format="YYYY-MM-DD"
                :range-separator="'—'"
                :start-placeholder="$t('pricing.startDate')"
                :end-placeholder="$t('pricing.endDate')"
                :disabled-date="disabledDate"
                :disabled="isEditMode"
                class="tw-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── 區塊：人數與房間 ── -->
      <div class="form-section">
        <div class="form-section__header">
          <el-icon class="form-section__icon"><Calendar /></el-icon>
          <span>{{ $t('orders.form.guestCountSection') }}</span>
        </div>
        <el-row :gutter="16">
          <!-- 房間數 -->
          <el-col :span="8">
            <el-form-item :label="$t('orders.columns.roomCount')">
              <HcInputNumber
                v-model="form.roomCount"
                :min="1"
                :max="20"
                :disabled="isEditMode"
                controls-position="right"
                class="tw-w-full"
              />
            </el-form-item>
          </el-col>

          <!-- 成人數 -->
          <el-col :span="8">
            <el-form-item :label="$t('orders.columns.adults')">
              <HcInputNumber
                v-model="form.adults"
                :min="1"
                :max="maxAdults"
                :disabled="isEditMode"
                controls-position="right"
                class="tw-w-full"
              />
              <div class="field-hint">max {{ maxAdults }}</div>
            </el-form-item>
          </el-col>

          <!-- 兒童數 -->
          <el-col :span="8">
            <el-form-item :label="$t('orders.columns.children')">
              <HcInputNumber
                v-model="form.children"
                :min="0"
                :max="maxChildren"
                :disabled="isEditMode"
                controls-position="right"
                class="tw-w-full"
              />
              <div class="field-hint">max {{ maxChildren }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── 區塊：聯絡資訊 ── -->
      <div class="form-section form-section--last">
        <div class="form-section__header">
          <el-icon class="form-section__icon"><Phone /></el-icon>
          <span>{{ $t('orders.detail.guestInfo') }}</span>
        </div>
        <el-row :gutter="16">
          <!-- 聯絡人 -->
          <el-col :span="12">
            <el-form-item :label="$t('orders.columns.contactName')" prop="contactName">
              <el-input
                v-model="form.contactName"
                :placeholder="$t('form.pleaseFill', { field: $t('orders.columns.contactName') })"
              />
            </el-form-item>
          </el-col>

          <!-- 聯絡電話 -->
          <el-col :span="12">
            <el-form-item :label="$t('orders.columns.contactPhone')" prop="contactPhone">
              <el-input
                v-model="form.contactPhone"
                :placeholder="$t('form.pleaseFill', { field: $t('orders.columns.contactPhone') })"
              />
            </el-form-item>
          </el-col>

          <!-- 電子郵件 -->
          <el-col :span="24">
            <el-form-item :label="$t('orders.columns.contactEmail')">
              <el-input
                v-model="form.contactEmail"
                type="email"
                :placeholder="$t('form.pleaseFill', { field: $t('orders.columns.contactEmail') })"
              />
            </el-form-item>
          </el-col>

          <!-- 特殊需求 -->
          <el-col :span="24">
            <el-form-item :label="$t('orders.columns.specialRequest')">
              <el-input
                v-model="form.specialRequest"
                type="textarea"
                :rows="3"
                :placeholder="$t('form.pleaseFill', { field: $t('orders.columns.specialRequest') })"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </HcDialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 16px 16px 16px;
  margin-bottom: 16px;
  background: $color-neutral-0;

  &--last {
    margin-bottom: 0;
  }

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

.room-limits {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: $color-primary-700;
  background: $color-primary-50;
  border-radius: 4px;
  padding: 0px 8px;
}

.field-hint {
  font-size: 12px;
  color: $color-neutral-400;
  margin-top: 2px;
  margin-left: 4px;
}

.form-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: $color-neutral-900;
    line-height: 1;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $color-neutral-600;
  background: $color-neutral-100;
  border-radius: 4px;
  padding: 2px 8px;

  .el-icon {
    font-size: 12px;
  }

  &--no {
    font-family: monospace;
    color: $color-primary-700;
    background: $color-primary-50;
    font-weight: 600;
  }
}
</style>
