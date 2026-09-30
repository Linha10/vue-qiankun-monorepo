<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useQueryClient } from '@tanstack/vue-query'
import { useCRUD, useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { promotionApi } from '@/api/promotion'
import { hotelApi } from '@/api/hotel'
import { HcMessageBox } from '@monorepo/utils'
import PromotionFilterBar from '../components/PromotionFilterBar.vue'
import PromotionTable from '../components/PromotionTable.vue'
import PromotionFormDialog from '../components/PromotionFormDialog.vue'
import type { PromotionListResponseItem } from '@/types/api-params'

defineOptions({ name: 'PromotionView' })

const { $t } = useI18n()
const appStore = useAppStore()
const queryClient = useQueryClient()

// ── 飯店下拉 ──────────────────────────────────────────────────
interface HotelOption {
  hotelId: string
  name: string
}
const hotelOptions = ref<HotelOption[]>([])
const isHotelLoading = ref(false)

const loadHotels = async () => {
  isHotelLoading.value = true
  try {
    const res = await hotelApi.getHotelList({
      pageSize: 100,
      lang: appStore.locale as 'zh' | 'en',
    })
    hotelOptions.value = (res as any)?.data?.list ?? []
  } finally {
    isHotelLoading.value = false
  }
}

onMounted(loadHotels)

// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref({
  page: 1,
  pageSize: 10,
  hotelId: '' as string,
  search: '',
  typeId: undefined as 0 | 1 | 2 | 3 | undefined,
  status: undefined as 1 | 2 | undefined,
  lang: appStore.locale as 'zh' | 'en',
})

const enabled = computed(() => !!filters.value.hotelId)

watch(
  () => appStore.locale,
  locale => {
    filters.value.lang = locale as 'zh' | 'en'
  }
)

// ── 促銷列表 ──────────────────────────────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: 'promotionsList',
  apiFns: {
    getList: (f: any) => promotionApi.getPromotionsList(f),
  },
  filters,
  enabled,
})

const promotionList = computed(() => (data.value as any)?.data?.list ?? [])
const total = computed(() => (data.value as any)?.data?.pagination?.total ?? 0)

// ── 搜尋 / 重置 ───────────────────────────────────────────────
function handleSearch() {
  filters.value.page = 1
}

function handleReset() {
  filters.value.search = ''
  filters.value.typeId = undefined
  filters.value.status = undefined
  filters.value.page = 1
}

// ── 建立 / 編輯 ───────────────────────────────────────────────
const formDialogVisible = ref(false)
const editingPromotion = ref<PromotionListResponseItem | null>(null)

function handleCreate() {
  if (!filters.value.hotelId) {
    ElMessage.warning($t('promotion.noHotelSelected'))
    return
  }
  editingPromotion.value = null
  formDialogVisible.value = true
}

function handleEdit(row: PromotionListResponseItem) {
  editingPromotion.value = row
  formDialogVisible.value = true
}

function handleFormSuccess() {
  queryClient.invalidateQueries({ queryKey: ['promotionsList'] })
}

// ── 刪除 ──────────────────────────────────────────────────────
async function handleDelete(row: PromotionListResponseItem) {
  try {
    await HcMessageBox.confirm(
      $t('promotion.delete.confirm', { name: row.title }),
      $t('dialog.deleteTitle'),
      { confirmButtonText: $t('button.confirm'), cancelButtonText: $t('button.cancel') }
    )
  } catch {
    return
  }
  try {
    await promotionApi.deletePromotion(row.id)
    ElMessage.success($t('promotion.delete.success'))
    queryClient.invalidateQueries({ queryKey: ['promotionsList'] })
  } catch {
    ElMessage.error($t('messages.deleteFailed'))
  }
}
</script>

<template>
  <div class="tw-p-6">
    <!-- 頁面標題 -->
    <h1 class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-6">
      {{ $t('promotion.title') }}
    </h1>

    <!-- 篩選列 -->
    <PromotionFilterBar
      v-model:search="filters.search"
      v-model:type-id="filters.typeId"
      v-model:status="filters.status"
      v-model:hotel-id="filters.hotelId"
      :hotel-options="hotelOptions"
      :hotel-loading="isHotelLoading"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <!-- 未選飯店提示 -->
    <div
      v-if="!filters.hotelId"
      class="tw-bg-white tw-rounded-lg tw-p-12 tw-shadow-sm tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-gray-400"
    >
      <i class="fa-solid fa-building-columns tw-text-4xl" />
      <p>{{ $t('promotion.noHotelSelected') }}</p>
    </div>

    <!-- 資料表格 -->
    <PromotionTable
      v-else
      :data="promotionList"
      :total="total"
      :loading="isLoading"
      :page="filters.page"
      :page-size="filters.pageSize"
      @update:page="filters.page = $event"
      @update:page-size="
        $event => {
          filters.pageSize = $event
          filters.page = 1
        }
      "
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 表單 Dialog -->
    <PromotionFormDialog
      v-model="formDialogVisible"
      :hotel-id="filters.hotelId"
      :promotion="editingPromotion"
      @success="handleFormSuccess"
    />
  </div>
</template>
