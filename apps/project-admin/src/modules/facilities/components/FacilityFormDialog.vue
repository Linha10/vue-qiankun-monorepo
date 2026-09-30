<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { facilitiesApi } from '@/api/facilities'
import { useI18n } from '@monorepo/composables'
import { HcDialog, HcIconPicker, HcInput, HcRadio } from '@monorepo/ui-kit'
import type { FacilityItem, FacilityCategoryItem } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  editData: FacilityCategoryItem | null // null = 建立模式
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

// ── i18n ────────────────────────────────────────────────────
const { $t } = useI18n()
const queryClient = useQueryClient()

// ── 模式判斷 ──────────────────────────────────────────────────
const isEditMode = computed(() => !!props.editData)
const dialogTitle = computed(() =>
  isEditMode.value ? $t('facilities.form.editTitle') : $t('facilities.form.createTitle')
)

// ── 表單 ──────────────────────────────────────────────────────
const formRef = ref<FormInstance>()

type FormData = {
  code: string
  nameZh: string
  nameEn: string
  categoryZh: string
  categoryEn: string
  icon: string
  status: 0 | 1
}

const emptyForm = (): FormData => ({
  code: '',
  nameZh: '',
  nameEn: '',
  categoryZh: '',
  categoryEn: '',
  icon: '',
  status: 1,
})

const form = ref<FormData>(emptyForm())

// ── 回填 ──────────────────────────────────────────────────────
watch(
  () => props.modelValue,
  visible => {
    if (!visible) {
      formRef.value?.resetFields()
      form.value = emptyForm()
      return
    }
    if (props.editData) {
      form.value = {
        code: props.editData.code,
        nameZh: props.editData.jsonName?.zh ?? '',
        nameEn: props.editData.jsonName?.en ?? '',
        categoryZh: props.editData.jsonCategory?.zh ?? '',
        categoryEn: props.editData.jsonCategory?.en ?? '',
        icon: props.editData.icon ?? '',
        status: props.editData.status,
      }
    }
  }
)

// ── 驗證規則 ──────────────────────────────────────────────────
const rules = computed<FormRules>(() => ({
  code: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('facilities.code') }),
      trigger: 'blur',
    },
  ],
  nameZh: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('facilities.nameZh') }),
      trigger: 'blur',
    },
  ],
  nameEn: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('facilities.nameEn') }),
      trigger: 'blur',
    },
  ],
  categoryZh: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('facilities.categoryZh') }),
      trigger: 'blur',
    },
  ],
  categoryEn: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('facilities.categoryEn') }),
      trigger: 'blur',
    },
  ],
  icon: [
    {
      required: true,
      message: $t('form.pleaseSelect', { field: $t('facilities.icon') }),
      trigger: 'change',
    },
  ],
}))

// ── 將 form 轉換為 API payload ─────────────────────────────────
function toPayload(): FacilityItem {
  return {
    code: form.value.code,
    name: { zh: form.value.nameZh, en: form.value.nameEn },
    category: { zh: form.value.categoryZh, en: form.value.categoryEn },
    icon: form.value.icon,
    status: form.value.status,
  }
}

// ── API: createFacility ────────────────────────────────────────
const { mutate: doCreate, isPending: isCreating } = useMutation({
  mutationFn: (data: FacilityItem) => facilitiesApi.createFacility(data),
  onSuccess: () => {
    ElMessage.success($t('facilities.form.createSuccess'))
    queryClient.invalidateQueries({ queryKey: ['facilitiesList'] })
    emit('update:modelValue', false)
    emit('saved')
  },
})

// ── API: updateFacility ────────────────────────────────────────
const { mutate: doUpdate, isPending: isUpdating } = useMutation({
  mutationFn: ({ id, data }: { id: string; data: Partial<FacilityItem> }) =>
    facilitiesApi.updateFacility(id, data),
  onSuccess: () => {
    ElMessage.success($t('facilities.form.updateSuccess'))
    queryClient.invalidateQueries({ queryKey: ['facilitiesList'] })
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
    const updateData = toPayload()
    doUpdate({ id: props.editData!.facilityId, data: updateData })
    return
  }

  doCreate(toPayload())
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="600px"
    :loading="isSaving"
    :confirm-text="$t('common.confirm')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @cancel="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="default">
      <div class="tw-flex tw-flex-col tw-gap-4 tw-pt-2">
        <!-- Section: 基本設定 -->
        <div class="form-section">
          <div class="form-section__header">
            <i class="fa-solid fa-circle-info form-section__icon" />
            <span>{{ $t('facilities.form.basicInfo') }}</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="$t('facilities.code')" prop="code">
                <HcInput
                  v-model="form.code"
                  :disabled="isEditMode"
                  :placeholder="$t('form.pleaseFill', { field: $t('facilities.code') })"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('facilities.icon')" prop="icon" class="tw-mb-2">
                <HcIconPicker
                  v-model="form.icon"
                  :placeholder="$t('facilities.form.iconPlaceholder')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Section: 名稱與分類 -->
        <div class="form-section">
          <div class="form-section__header">
            <i class="fa-solid fa-language form-section__icon" />
            <span>名稱 / 分類</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="$t('facilities.nameZh')" prop="nameZh">
                <HcInput
                  v-model="form.nameZh"
                  :placeholder="$t('form.pleaseFill', { field: $t('facilities.nameZh') })"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('facilities.nameEn')" prop="nameEn">
                <HcInput
                  v-model="form.nameEn"
                  :placeholder="$t('form.pleaseFill', { field: $t('facilities.nameEn') })"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('facilities.categoryZh')" prop="categoryZh" class="tw-mb-2">
                <HcInput
                  v-model="form.categoryZh"
                  :placeholder="$t('form.pleaseFill', { field: $t('facilities.categoryZh') })"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('facilities.categoryEn')" prop="categoryEn" class="tw-mb-2">
                <HcInput
                  v-model="form.categoryEn"
                  :placeholder="$t('form.pleaseFill', { field: $t('facilities.categoryEn') })"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Section: 狀態 -->
        <div class="form-section form-section--last">
          <div class="form-section__header">
            <i class="fa-solid fa-toggle-on form-section__icon" />
            <span>{{ $t('facilities.columns.status') }}</span>
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item class="tw-mb-2">
                <el-radio-group v-model="form.status">
                  <HcRadio :value="1">{{ $t('facilities.statusEnabled') }}</HcRadio>
                  <HcRadio :value="0">{{ $t('facilities.statusDisabled') }}</HcRadio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-form>
  </HcDialog>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* ── dialog body padding ──────────────────────────────────── */
:deep(.el-dialog__body) {
  padding: 12px 16px;
}

/* ── form-section card（同 OrderFormDialog 設計） ─────────── */
.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 16px 16px 16px;
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
</style>
