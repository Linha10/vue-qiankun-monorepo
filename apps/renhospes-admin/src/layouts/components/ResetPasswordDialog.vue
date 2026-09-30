<script setup lang="ts">
import { type FormInstance } from 'element-plus'
import { authApi } from '@/api/auth'
import { HcDialog } from '@monorepo/ui-kit'
import { HcInput } from '@monorepo/ui-kit'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
}>()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emit('update:modelValue', val)
  },
})

const formItems = [
  {
    label: '舊密碼',
    placeholder: '請輸入舊密碼',
    key: 'oldPassword' as const,
  },
  {
    label: '新密碼',
    placeholder: '請輸入新密碼',
    key: 'newPassword' as const,
  },
  {
    label: '確認新密碼',
    placeholder: '請確認新密碼',
    key: 'confirmPassword' as const,
  },
]

const formRef = ref<FormInstance>()

const rules = {
  oldPassword: [{ required: true, message: '舊密碼不能為空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密碼不能為空', trigger: 'blur' },
    { min: 6, message: '新密碼最少 6 字元', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: unknown, callback: (error?: Error | string) => void) => {
        if (value === '' || value !== form.oldPassword) {
          callback()
        } else {
          callback(new Error('舊密碼與新密碼不可相同'))
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '確認新密碼不能為空', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: unknown, callback: (error?: Error | string) => void) => {
        if (value === '' || value === form.newPassword) {
          callback()
        } else {
          callback(new Error('新密碼與確認新密碼不一致'))
        }
      },
      trigger: 'blur',
    },
  ],
}

const resetPassword = async () => {
  // 驗證表單
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = {
    oldPassword: btoa(form.oldPassword),
    newPassword: btoa(form.newPassword),
  }
  // 重設密碼邏輯
  await authApi
    .changeAccountPassword(payload)
    .then(() => {
      ElMessage.success('密碼重設成功')
      handleCancel()
    })
    .catch(({ response }) => {
      console.log('response', response)
      const errorMessage = response?.data?.message || '密碼重設失敗'
      ElMessage.error(errorMessage)
    })
}

const handleCancel = () => {
  formRef.value?.resetFields()
  emit('close')
}
</script>
<template>
  <hc-dialog
    v-model="visible"
    title="重設密碼"
    width="400px"
    @confirm="resetPassword"
    @cancel="handleCancel"
  >
    <div class="reset-password-dialog tw-pt-[8px]">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item
          v-for="item in formItems"
          :key="item.key"
          :label="item.label"
          :prop="item.key"
        >
          <hc-input
            type="password"
            v-model="form[item.key]"
            :placeholder="item.placeholder"
          ></hc-input>
        </el-form-item>
      </el-form>
    </div>
  </hc-dialog>
</template>
