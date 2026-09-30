<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useCRUD, useI18n, usePermission } from '@monorepo/composables'
import { roomTypeApi } from '@/api/roomType'
import { hotelApi } from '@/api/hotel'
import { useAppStore } from '@/stores/app'
import { HcButton, HcTable } from '@monorepo/ui-kit'
import type { TableColumn } from '@monorepo/ui-kit'

const router = useRouter()
const queryClient = useQueryClient()
const { $t } = useI18n()
const appStore = useAppStore()
const { canPerformAction } = usePermission()

// ── 飯店下拉 ──
interface HotelOption {
  hotelId: string
  name: string
}
const hotelOptions = ref<HotelOption[]>([])
const selectedHotelId = ref('')
const isHotelLoading = ref(false)

const loadHotels = async () => {
  isHotelLoading.value = true
  try {
    const res = await hotelApi.getHotelList({ pageSize: 100, lang: appStore.locale as 'zh' | 'en' })
    hotelOptions.value = (res as any)?.data?.list ?? []
    if (hotelOptions.value.length > 0 && !selectedHotelId.value) {
      selectedHotelId.value = hotelOptions.value[0].hotelId
    }
  } finally {
    isHotelLoading.value = false
  }
}

// ── 篩選條件 ──
const filters = ref({
  page: 1,
  pageSize: 10,
  lang: appStore.locale as 'zh' | 'en',
  hotelId: '',
  search: null as string | null,
  status: 1 as 0 | 1,
})

// 飯店選擇變更時同步 filters 並重置分頁
watch(selectedHotelId, val => {
  filters.value.hotelId = val
  filters.value.page = 1
})

// ── 房型列表 ──
const { data, isLoading } = useCRUD({
  queryKey: 'room-types',
  apiFns: {
    getList: f => roomTypeApi.getRoomTypes(f as any),
  },
  filters,
})

const list = computed(() => (data.value as any)?.data?.list ?? [])
const pagination = computed(() => (data.value as any)?.data?.pagination ?? {})

// ── 操作 ──
const handleEdit = (roomTypeId: string) => {
  router.push(`/room-type/edit/${roomTypeId}`)
}

const isDeleting = ref(false)
const handleDelete = async (roomTypeId: string, roomTypeName: string) => {
  try {
    await ElMessageBox.confirm(
      $t('messages.deleteConfirm', { name: roomTypeName }),
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
    await roomTypeApi.deleteSpecificRoomType(roomTypeId)
    ElMessage.success($t('messages.deleteSuccess'))
    queryClient.invalidateQueries({ queryKey: ['room-types'] })
  } finally {
    isDeleting.value = false
  }
}

const columns: TableColumn[] = [
  { prop: 'actions', label: $t('common.actions'), minWidth: 100, align: 'center', fixed: 'left' },
  { prop: 'name', label: $t('roomType.name'), minWidth: 180 },
  { prop: 'quantity', label: $t('roomType.quantity'), minWidth: 80, align: 'center' },
  { prop: 'maxAdults', label: $t('roomType.maxAdults'), minWidth: 100, align: 'center' },
  { prop: 'maxChildren', label: $t('roomType.maxChildren'), minWidth: 100, align: 'center' },
  { prop: 'basePrice', label: '基本價格', minWidth: 120, align: 'right' },
  { prop: 'roomSizeM2', label: '大小 (m²)', minWidth: 100, align: 'center' },
  { prop: 'status', label: '狀態', minWidth: 90, align: 'center' },
]

onMounted(loadHotels)

watch(
  () => appStore.locale,
  locale => {
    filters.value.lang = locale as 'zh' | 'en'
    loadHotels()
  }
)

// keep-alive 返回時重新取得對應飯店的房型資料（飯店選擇狀態保留）
onActivated(() => {
  queryClient.invalidateQueries({ queryKey: ['room-types'] })
})

function handleReset() {
  filters.value.search = null
  filters.value.page = 1
}
</script>

<template>
  <section class="tw-p-6">
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">{{ $t('roomType.title') }}</h1>
    </div>
    <!-- 頂部：篩選 + 建立按鈕 -->
    <div
      class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
    >
      <!-- 飯店選擇 -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-xs tw-text-slate-500">{{ $t('roomType.selectHotel') }}</span>
        <el-select
          v-model="selectedHotelId"
          :placeholder="$t('roomType.selectHotel')"
          :loading="isHotelLoading"
          style="width: 220px"
        >
          <el-option
            v-for="hotel in hotelOptions"
            :key="hotel.hotelId"
            :label="hotel.name"
            :value="hotel.hotelId"
          />
        </el-select>
      </div>

      <!-- 關鍵字搜尋 -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-xs tw-text-slate-500">{{ $t('common.search') }}</span>
        <el-input
          v-model="filters.search"
          :placeholder="$t('roomType.searchRoomType')"
          clearable
          style="width: 220px"
          @change="filters.page = 1"
        />
      </div>

      <!-- 操作按鈕 -->
      <div class="tw-flex tw-gap-2 tw-ml-auto tw-items-end">
        <HcButton @click="handleReset">{{ $t('common.reset') }}</HcButton>
        <HcButton
          v-if="canPerformAction('/room-type', 'create')"
          type="primary"
          @click="router.push('/room-type/create')"
        >
          {{ $t('roomType.create') }}
        </HcButton>
      </div>
    </div>

    <!-- 表格 -->
    <hc-table
      v-loading="isLoading || isDeleting"
      :data="list"
      :columns="columns"
      :total="pagination.total ?? 0"
      v-model:page="filters.page"
      v-model:pageSize="filters.pageSize"
      border
      style="width: 100%"
      :cell-style="{ height: '48px' }"
    >
      <template #actions="{ scope }">
        <hc-button
          v-if="canPerformAction('/room-type', 'update')"
          size="small"
          type="primary"
          text
          round
          @click="handleEdit(scope.roomTypeId)"
        >
          <el-icon size="16"><Edit /></el-icon>
        </hc-button>
        <hc-button
          v-if="canPerformAction('/room-type', 'delete')"
          size="small"
          type="danger"
          text
          round
          @click="handleDelete(scope.roomTypeId, scope.name)"
        >
          <el-icon size="16"><Delete /></el-icon>
        </hc-button>
      </template>
      <template #basePrice="{ scope }"> NT$ {{ scope.basePrice?.toLocaleString() }} </template>
      <template #roomSizeM2="{ scope }"> {{ scope.roomSizeM2 }} m² </template>
      <template #status="{ scope }">
        <el-tag :type="scope.status === 1 ? 'success' : 'info'" size="small">
          {{ scope.status === 1 ? '啟用' : '停用' }}
        </el-tag>
      </template>
    </hc-table>
  </section>
</template>
