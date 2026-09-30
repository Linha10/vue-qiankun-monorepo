<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { HcButton } from '@monorepo/ui-kit'
import { employeeApi, type EmployeeItem } from '@/api/employees'

const route = useRoute()
const router = useRouter()
const { $t } = useI18n()

const employee = ref<EmployeeItem | null>(null)
const loading = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await employeeApi.getById(String(route.params.id))
    employee.value = (res as { data: EmployeeItem })?.data ?? null
  } catch {
    ElMessage.error($t('employees.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div v-loading="loading" class="tw-bg-white tw-rounded-lg tw-p-6 tw-shadow-sm tw-max-w-xl">
    <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
      <h2 class="tw-text-lg tw-font-semibold">{{ $t('employees.detail') }}</h2>
      <HcButton plain @click="router.push('/employees')">
        {{ $t('common.backToList') }}
      </HcButton>
    </div>

    <el-descriptions v-if="employee" :column="1" border>
      <el-descriptions-item :label="$t('employees.table.name')">
        {{ employee.name }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.department')">
        {{ employee.department }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.jobTitle')">
        {{ employee.title }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.email')">
        {{ employee.email }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.phone')">
        {{ employee.phone }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.hiredAt')">
        {{ employee.hiredAt }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('employees.table.status')">
        {{ employee.status === 1 ? $t('common.enable') : $t('common.disable') }}
      </el-descriptions-item>
    </el-descriptions>

    <el-empty v-else-if="!loading" :description="$t('common.noData')" />
  </div>
</template>
