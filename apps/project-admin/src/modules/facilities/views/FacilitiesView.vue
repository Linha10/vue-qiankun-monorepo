<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useCRUD, useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { facilitiesApi } from '@/api/facilities'
import { HcMessageBox } from '@monorepo/utils'
import FacilityFilterBar from '../components/FacilityFilterBar.vue'
import FacilityTable from '../components/FacilityTable.vue'
import FacilityFormDialog from '../components/FacilityFormDialog.vue'
import type { FacilityCategoryItem, FacilitiesParams } from '@/types/api-params'

defineOptions({ name: 'FacilitiesView' })

const { $t } = useI18n()
const appStore = useAppStore()
const queryClient = useQueryClient()

// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref<FacilitiesParams>({
  page: 1,
  pageSize: 10,
  search: '',
  status: undefined,
  lang: appStore.locale as 'zh' | 'en',
})

// ── 工具列事件 ─────────────────────────────────────────────────
function handleSearch() {
  filters.value.page = 1
}

function handleReset() {
  filters.value.search = ''
  filters.value.status = undefined
  filters.value.page = 1
}

function handlePageSizeChange(v: number) {
  filters.value = { ...filters.value, pageSize: v, page: 1 }
}

// ── 設施列表（API: getFacilitiesList）─────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: 'facilitiesList',
  apiFns: { getList: (f: FacilitiesParams) => facilitiesApi.getFacilitiesList(f) },
  filters,
})

const facilityList = computed(() => (data.value as any)?.data?.list ?? [])
const total = computed(() => (data.value as any)?.data?.pagination?.total ?? 0)

// ── 建立 / 編輯 ───────────────────────────────────────────────
const formDialogVisible = ref(false)
const editingFacility = ref<FacilityCategoryItem | null>(null)

function handleCreate() {
  editingFacility.value = null
  formDialogVisible.value = true
}

function handleEdit(row: FacilityCategoryItem) {
  editingFacility.value = row
  formDialogVisible.value = true
}

// ── 刪除（API: deleteFacility）────────────────────────────────
const { mutate: doDelete, isPending: isDeleting } = useMutation({
  mutationFn: (id: string) => facilitiesApi.deleteFacility(id),
  onSuccess: () => {
    ElMessage.success($t('facilities.delete.success'))
    queryClient.invalidateQueries({ queryKey: ['facilitiesList'] })
  },
})

async function handleDelete(row: FacilityCategoryItem) {
  const name = row.jsonName?.[appStore.locale as 'zh' | 'en'] ?? row.name
  try {
    await HcMessageBox.confirm(
      $t('facilities.delete.confirm', { name }),
      $t('dialog.deleteTitle'),
      {
        confirmButtonText: $t('dialog.confirmDelete'),
        cancelButtonText: $t('common.cancel'),
        type: 'warning',
      }
    )
    doDelete(row.facilityId)
  } catch {}
}
</script>

<template>
  <section class="tw-p-6">
    <!-- 頁首 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">{{ $t('facilities.title') }}</h1>
    </div>

    <!-- 工具列 -->
    <FacilityFilterBar
      :search="filters.search ?? ''"
      :status="filters.status"
      @update:search="filters.search = $event"
      @update:status="filters.status = $event"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <!-- 資料表格 -->
    <FacilityTable
      :data="facilityList"
      :total="total"
      :loading="isLoading || isDeleting"
      :page="filters.page ?? 1"
      :page-size="filters.pageSize ?? 10"
      @update:page="filters.page = $event"
      @update:page-size="handlePageSizeChange"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 建立 / 編輯 Dialog -->
    <FacilityFormDialog v-model="formDialogVisible" :edit-data="editingFacility" />
  </section>
</template>
