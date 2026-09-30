<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcDialog, HcInput, HcSelect } from '@monorepo/ui-kit'
import { employeeApi, type EmployeeItem } from '@/api/employees'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  employee: EmployeeItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

const { $t } = useI18n()

const DEPARTMENTS = ['工程部', '產品部', '設計部', '行銷部', '客服部', '人資部']

const isSaving = ref(false)

const dialogTitle = computed(() =>
  props.mode === 'create' ? $t('employees.form.createTitle') : $t('employees.form.editTitle')
)

interface FormData {
  name: string
  department: string
  title: string
  email: string
  phone: string
  status: 0 | 1
}

const defaultForm = (): FormData => ({
  name: '',
  department: '',
  title: '',
  email: '',
  phone: '',
  status: 1,
})

const form = reactive<FormData>(defaultForm())

watch(
  () => props.modelValue,
  open => {
    if (!open) return
    if (props.mode === 'edit' && props.employee) {
      Object.assign(form, {
        name: props.employee.name,
        department: props.employee.department,
        title: props.employee.title,
        email: props.employee.email,
        phone: props.employee.phone,
        status: props.employee.status,
      })
    } else {
      Object.assign(form, defaultForm())
    }
  }
)

async function handleSubmit() {
  if (!form.name || !form.department) {
    ElMessage.warning($t('form.checkRequired'))
    return
  }
  isSaving.value = true
  try {
    if (props.mode === 'create') {
      await employeeApi.create({
        ...form,
        hiredAt: new Date().toISOString().slice(0, 10),
      })
      ElMessage.success($t('employees.messages.createSuccess'))
    } else if (props.mode === 'edit' && props.employee) {
      await employeeApi.update(props.employee.id, { ...form })
      ElMessage.success($t('employees.messages.updateSuccess'))
    }
    emit('success')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error($t('employees.messages.fetchError'))
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
      <el-form-item :label="$t('employees.form.name')" required>
        <HcInput
          v-model="form.name"
          :placeholder="$t('form.pleaseFill', { field: $t('employees.form.name') })"
        />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('employees.form.department')" required>
            <HcSelect v-model="form.department" style="width: 100%">
              <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
            </HcSelect>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('employees.form.jobTitle')">
            <HcInput v-model="form.title" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('employees.form.email')">
            <HcInput v-model="form.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('employees.form.phone')">
            <HcInput v-model="form.phone" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="$t('employees.form.status')">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">{{ $t('common.enable') }}</el-radio>
          <el-radio :value="0">{{ $t('common.disable') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </HcDialog>
</template>
