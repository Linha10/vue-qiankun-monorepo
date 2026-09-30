<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCRUD, useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { roomTypeApi } from '@/api/roomType'
import CalendarMode from '../components/CalendarMode.vue'
import ListMode from '../components/ListMode.vue'
import WeeklyMode from '../components/WeeklyMode.vue'

type PricingMode = 'calendar' | 'list' | 'weekly'

const { $t } = useI18n()
const appStore = useAppStore()

// ── 模式切換 ──
const currentMode = ref<PricingMode>('calendar')

// ── 房型列表 ──
const roomTypeFilters = ref({
  page: 1,
  pageSize: 100,
  lang: appStore.locale as 'zh' | 'en',
  status: 1,
})

watch(
  () => appStore.locale,
  locale => {
    roomTypeFilters.value.lang = locale as 'zh' | 'en'
  }
)

const { data: roomTypeData, isLoading: isRoomTypeLoading } = useCRUD({
  queryKey: 'roomTypes',
  apiFns: {
    getList: (f: any) => roomTypeApi.getRoomTypes(f),
  },
  filters: roomTypeFilters,
})

const roomTypes = computed(() => (roomTypeData.value as any)?.data?.list ?? [])
const selectedRoomType = ref<string>('')

// 資料載入後自動選擇第一個房型
watch(
  () => roomTypes.value,
  newList => {
    if (newList.length > 0 && !selectedRoomType.value) {
      selectedRoomType.value = newList[0].roomTypeId
    }
  },
  { immediate: true }
)

// ── 計算屬性 ──
const roomTypeOptions = computed(() =>
  roomTypes.value.map((rt: any) => ({
    label: rt.name?.[appStore.locale] || rt.name?.zh || rt.name?.en || rt.name,
    value: rt.roomTypeId,
    data: rt,
  }))
)

const selectedRoomData = computed(
  () => roomTypes.value.find((rt: any) => rt.roomTypeId === selectedRoomType.value) || null
)

const modes = computed(() => [
  { value: 'calendar', label: $t('pricing.modeCalendar') },
  { value: 'list', label: $t('pricing.modeList') },
  { value: 'weekly', label: $t('pricing.modeWeekly') },
])
</script>

<template>
  <section class="tw-p-6">
    <!-- 標題 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">{{ $t('pricing.title') }}</h1>
    </div>

    <!-- 警告橫幅 -->
    <el-alert
      :description="$t('pricing.alertRuleUpdateMessage')"
      type="warning"
      :closable="false"
      style="margin-bottom: 16px"
      show-icon
    />

    <!-- 工具欄 -->
    <div
      class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
    >
      <!-- 房型選擇器 -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-xs tw-text-slate-500">{{ $t('pricing.selectRoom') }}</span>
        <div class="tw-w-48">
          <el-select
            v-model="selectedRoomType"
            :placeholder="$t('pricing.selectRoom')"
            :loading="isRoomTypeLoading"
            filterable
          >
            <el-option
              v-for="option in roomTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 分隔線 -->
      <div class="tw-h-6 tw-w-0.5 tw-bg-slate-300" />

      <!-- 模式切換 -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-xs tw-text-slate-500">{{ $t('pricing.modeLabel') }}</span>
        <div class="tw-flex tw-gap-2">
          <HcButton
            v-for="mode in modes"
            :key="mode.value"
            :type="currentMode === mode.value ? 'primary' : 'default'"
            @click="currentMode = mode.value as PricingMode"
          >
            {{ mode.label }}
          </HcButton>
        </div>
      </div>

      <div
        v-if="currentMode === 'calendar'"
        class="tw-ml-auto tw-flex tw-items-center tw-gap-4 tw-text-sm"
      >
        <div class="tw-flex tw-items-center tw-gap-2">
          <div
            class="tw-w-3.5 tw-h-3.5 tw-rounded tw-bg-slate-200 tw-border-2 tw-border-slate-300"
          />
          <span class="tw-text-slate-600">{{ $t('pricing.legendBasic') }}</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <div
            class="tw-w-3.5 tw-h-3.5 tw-rounded tw-bg-blue-100 tw-border-2"
            style="border-color: #93c5fd"
          />
          <span class="tw-text-slate-600">{{ $t('pricing.legendWeek') }}</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <div
            class="tw-w-3.5 tw-h-3.5 tw-rounded tw-bg-green-100 tw-border-2"
            style="border-color: #86efac"
          />
          <span class="tw-text-slate-600">{{ $t('pricing.legendDate') }}</span>
        </div>
      </div>
    </div>

    <!-- 動態內容區域 -->
    <div v-if="selectedRoomType && selectedRoomData" class="tw-space-y-4">
      <!-- 日曆模式 -->
      <CalendarMode
        v-if="currentMode === 'calendar'"
        :roomTypeId="selectedRoomType"
        :roomData="selectedRoomData"
      />

      <!-- 列表模式 -->
      <ListMode
        v-if="currentMode === 'list'"
        :roomTypeId="selectedRoomType"
        :roomData="selectedRoomData"
      />

      <!-- 週規則模式 -->
      <WeeklyMode
        v-if="currentMode === 'weekly'"
        :roomTypeId="selectedRoomType"
        :roomData="selectedRoomData"
      />
    </div>

    <!-- 空狀態 -->
    <div v-else class="tw-text-center tw-py-12">
      <p class="tw-text-slate-500 tw-text-lg">{{ $t('common.noData') }}</p>
    </div>
  </section>
</template>

<style scoped>
:deep(.el-select) {
  width: 100%;
}
</style>
