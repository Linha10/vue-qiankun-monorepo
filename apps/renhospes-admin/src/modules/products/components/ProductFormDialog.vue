<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcDialog, HcInput, HcSelect, HcInputNumber } from '@monorepo/ui-kit'
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

watch(
  () => props.modelValue,
  open => {
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
  }
)

async function handleSubmit() {
  if (!form.name || !form.category) {
    ElMessage.warning($t('form.checkRequired'))
    return
  }
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
    width="520px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form label-position="top" class="tw-flex tw-flex-col tw-gap-2">
      <el-form-item :label="$t('products.form.name')" required>
        <HcInput
          v-model="form.name"
          :placeholder="$t('form.pleaseFill', { field: $t('products.form.name') })"
        />
      </el-form-item>
      <el-form-item :label="$t('products.form.category')" required>
        <HcSelect v-model="form.category" style="width: 100%">
          <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
        </HcSelect>
      </el-form-item>
      <el-row :gutter="16">
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
      </el-row>
      <el-form-item :label="$t('products.form.status')">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">{{ $t('common.enable') }}</el-radio>
          <el-radio :value="0">{{ $t('common.disable') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </HcDialog>
</template>
