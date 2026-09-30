<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useCRUD, useI18n, usePermission } from '@monorepo/composables'
import { hotelApi } from '@/api/hotel'
import { useAppStore } from '@/stores/app'
import { HcButton, HcTable } from '@monorepo/ui-kit'
import type { TableColumn } from '@monorepo/ui-kit'

const router = useRouter()
const queryClient = useQueryClient()
const { $t } = useI18n()
const appStore = useAppStore()
const { canPerformAction } = usePermission()

const filters = ref({
  page: 1,
  pageSize: 10,
  lang: appStore.locale as 'zh' | 'en',
})

watch(
  () => appStore.locale,
  locale => {
    filters.value.lang = locale as 'zh' | 'en'
  }
)

const { data, isLoading } = useCRUD({
  queryKey: 'hotels',
  apiFns: {
    getList: f => hotelApi.getHotelList(f),
  },
  filters,
})

const list = computed(() => (data.value as any)?.data?.list ?? [])
const pagination = computed(() => (data.value as any)?.data?.pagination ?? {})

const handleEdit = (hotelId: string) => {
  router.push(`/hotel/edit/${hotelId}`)
}

const columns: TableColumn[] = [
  { prop: 'actions', label: $t('common.actions'), minWidth: 150, align: 'center', fixed: 'left' },
  { prop: 'name', label: $t('common.name'), minWidth: 200 },
  { prop: 'description', label: $t('hotel.description'), minWidth: 500 },
  { prop: 'status', label: $t('common.status'), minWidth: 150, align: 'center' },
]

const isDeleting = ref(false)
const handleDelete = async (hotelId: string, hotelName: string) => {
  try {
    await ElMessageBox.confirm(
      $t('messages.deleteConfirm', { name: hotelName }),
      $t('dialog.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: $t('dialog.confirmDelete'),
        cancelButtonText: $t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
      }
    )
  } catch {
    return
  }

  isDeleting.value = true
  try {
    await hotelApi.deleteHotel(hotelId)
    ElMessage.success($t('messages.deleteSuccess'))
    queryClient.invalidateQueries({ queryKey: ['hotels'] })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="tw-p-6">
    <div class="tw-mb-4">
      <hc-button
        v-if="canPerformAction('/hotel', 'create')"
        type="primary"
        @click="router.push('/hotel/create')"
      >
        {{ $t('hotel.create') }}
      </hc-button>
    </div>

    <hc-table
      v-loading="isLoading || isDeleting"
      :data="list"
      :columns="columns"
      :total="pagination.total ?? 0"
      v-model:page="filters.page"
      v-model:pageSize="filters.pageSize"
      border
      style="width: 100%"
      max-height="600"
      :cell-style="{ height: '48px' }"
    >
      <template #actions="{ scope }">
        <hc-button
          v-if="canPerformAction('/hotel', 'update')"
          size="small"
          type="primary"
          text
          round
          @click="handleEdit(scope.hotelId)"
        >
          <el-icon size="16"><Edit /></el-icon>
        </hc-button>
        <hc-button
          v-if="canPerformAction('/hotel', 'delete')"
          size="small"
          type="danger"
          text
          round
          @click="handleDelete(scope.hotelId, scope.name)"
        >
          <el-icon size="16"><Delete /></el-icon>
        </hc-button>
      </template>
      <template #status="{ scope }">
        <el-tag :type="scope.status === 1 ? 'success' : 'info'" size="small">
          {{ scope.status === 1 ? '啟用' : '停用' }}
        </el-tag>
      </template>
    </hc-table>
  </section>
</template>
