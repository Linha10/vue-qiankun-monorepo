<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcDialog, HcInput, HcSelect, HcInputNumber, HcSwitch } from '@monorepo/ui-kit'
import { productApi, type ProductItem } from '@/api/products'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  product: ProductItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

const { $t } = useI18n()

const CATEGORIES = ['3C配件', '居家生活', '辦公用品', '戶外休閒', '美妝保養']

const isSaving = ref(false)

const dialogTitle = computed(() =>
  props.mode === 'create' ? $t('products.form.createTitle') : $t('products.form.editTitle')
)

interface FormData {
  name: string
  category: string
  price: number
  stock: number
  status: 0 | 1
}

const defaultForm = (): FormData => ({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 1,
})

const form = reactive<FormData>(defaultForm())
const formRef = ref<FormInstance>()

const rules = computed<FormRules>(() => ({
  name: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('products.form.name') }),
      trigger: 'blur',
    },
  ],
  category: [
    {
      required: true,
      message: $t('form.pleaseSelect', { field: $t('products.form.category') }),
      trigger: 'change',
    },
  ],
}))

watch(
  () => props.modelValue,
  async open => {
    if (!open) return
    if (props.mode === 'edit' && props.product) {
      Object.assign(form, {
        name: props.product.name,
        category: props.product.category,
        price: props.product.price,
        stock: props.product.stock,
        status: props.product.status,
      })
    } else {
      Object.assign(form, defaultForm())
    }
    await nextTick()
    formRef.value?.clearValidate()
  }
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      await productApi.create({ ...form })
      ElMessage.success($t('products.messages.createSuccess'))
    } else if (props.mode === 'edit' && props.product) {
      await productApi.update(props.product.id, { ...form })
      ElMessage.success($t('products.messages.updateSuccess'))
    }
    emit('success')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error($t('products.messages.fetchError'))
  } finally {
    isSaving.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :loading="isSaving"
    width="600px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="tw-flex tw-flex-col tw-gap-4 tw-pt-2"
    >
      <!-- ── Section：基本資訊 ─────────────────────────────── -->
      <div class="form-section">
        <div class="form-section__header">
          <i class="fa-solid fa-box form-section__icon" />
          <span>{{ $t('products.form.sectionInfo') }}</span>
        </div>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('products.form.name')" prop="name">
              <HcInput
                v-model="form.name"
                :placeholder="$t('form.pleaseFill', { field: $t('products.form.name') })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('products.form.category')" prop="category">
              <HcSelect v-model="form.category" style="width: 100%">
                <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
              </HcSelect>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('products.form.price')">
              <HcInputNumber v-model="form.price" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('products.form.stock')">
              <HcInputNumber v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('products.form.status')">
              <HcSwitch v-model="form.status" :active-value="1 as 1" :inactive-value="0 as 0" />
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
  padding: 16px;
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
</style>
