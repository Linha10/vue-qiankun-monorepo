<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Back, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useQueryClient } from '@tanstack/vue-query'
import { roomTypeApi } from '@/api/roomType'
import { hotelApi } from '@/api/hotel'
import { facilitiesApi } from '@/api/facilities'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import type { ImageItem } from '@/types/api-params'
import {
  ROOM_FLOOR_OPTIONS,
  ROOM_LEVEL_OPTIONS,
  type RoomFloorKey,
  type RoomLevelKey,
} from '@/constants/roomType'
import { HcButton, HcRadio, HcInputNumber, HcImageGallery } from '@monorepo/ui-kit'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { $t, locale } = useI18n()
const appStore = useAppStore()

const isEditMode = computed(() => route.name === 'RoomTypeEdit')
const roomTypeId = computed(() => route.params.roomTypeId as string)

// 儲存從 API 取得的房型名稱，不隨表單編輯變動
const savedRoomTypeName = ref<{ zh: string; en: string }>({ zh: '', en: '' })

const displayRoomTypeName = computed(() => {
  const lang = locale.value === 'en' ? 'en' : 'zh'
  return (
    savedRoomTypeName.value[lang] || savedRoomTypeName.value.zh || savedRoomTypeName.value.en || ''
  )
})

function normalizeLocalizedText(input: unknown): { zh: string; en: string } {
  if (typeof input === 'string') {
    return { zh: input, en: input }
  }

  if (typeof input === 'object' && input !== null) {
    const value = input as { zh?: string; en?: string }
    return {
      zh: value.zh ?? '',
      en: value.en ?? '',
    }
  }

  return { zh: '', en: '' }
}

// ── 表單 ──
interface BedConfigRow {
  type: string
  num: number
}

interface RoomTypeFormState {
  hotelId: string
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  roomSizeM2: number | null
  maxAdults: number | null
  maxChildren: number | null
  quantity: number | null
  basePrice: number | null
  bedConfig: BedConfigRow[]
  facilityIds: string[]
  sort: number | null
  status: 0 | 1
  floor: RoomFloorKey | null
  roomLevel: RoomLevelKey | null
}

const formRef = ref<FormInstance>()

// ── 驗證規則 ──
const rules = computed<FormRules>(() => ({
  hotelId: [
    {
      required: true,
      message: $t('form.pleaseSelect', { field: $t('roomType.hotelSelect') }),
      trigger: 'change',
    },
  ],
  'name.zh': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('roomType.nameZh') }),
      trigger: 'blur',
    },
  ],
  'name.en': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('roomType.nameEn') }),
      trigger: 'blur',
    },
  ],
  roomSizeM2: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseFill', { field: $t('roomType.roomSizeM2') }),
      trigger: 'blur',
    },
  ],
  basePrice: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseFill', { field: $t('roomType.basePriceNT') }),
      trigger: 'blur',
    },
  ],
  quantity: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseFill', { field: $t('roomType.quantity') }),
      trigger: 'blur',
    },
  ],
  maxAdults: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseFill', { field: $t('roomType.maxAdultsNum') }),
      trigger: 'blur',
    },
  ],
  maxChildren: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseFill', { field: $t('roomType.maxChildrenNum') }),
      trigger: 'blur',
    },
  ],
  floor: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseSelect', { field: $t('roomType.floor') }),
      trigger: 'change',
    },
  ],
  roomLevel: [
    {
      required: true,
      type: 'number',
      message: $t('form.pleaseSelect', { field: $t('roomType.roomLevel') }),
      trigger: 'change',
    },
  ],
}))

const form = reactive<RoomTypeFormState>({
  hotelId: '',
  name: { zh: '', en: '' },
  description: { zh: '', en: '' },
  roomSizeM2: null,
  maxAdults: null,
  maxChildren: null,
  quantity: null,
  basePrice: null,
  bedConfig: [],
  facilityIds: [],
  sort: null,
  status: 1,
  floor: null,
  roomLevel: null,
})

// ── 飯店選項（create 模式） ──
interface HotelOption {
  hotelId: string
  name: string
}
const hotelOptions = ref<HotelOption[]>([])

const loadHotels = async () => {
  try {
    const res = await hotelApi.getHotelList({ pageSize: 100, lang: appStore.locale as 'zh' | 'en' })
    hotelOptions.value = (res as any)?.data?.list ?? []
  } catch {}
}

// ── 設施選項 ──
interface FacilityOption {
  facilityId: string
  name: string
}
const facilityOptions = ref<FacilityOption[]>([])

const loadFacilities = async () => {
  try {
    const res = await facilitiesApi.getFacilitiesList({
      page: 1,
      pageSize: 100,
      lang: appStore.locale as 'zh' | 'en',
    })
    facilityOptions.value = (res as any)?.data?.list ?? []
  } catch {}
}

// ── 床型選項 ──
interface BedOption {
  code: string
  name: string
}
const bedOptions = ref<BedOption[]>([])

const loadBedOptions = async () => {
  try {
    const res = await roomTypeApi.getBedOptions('zh')
    bedOptions.value = (res as any)?.data ?? []
  } catch {}
}

// 新增床型行
const addBedRow = () => {
  form.bedConfig.push({ type: '', num: 1 })
}

// 刪除床型行
const removeBedRow = (idx: number) => {
  form.bedConfig.splice(idx, 1)
}

// ── 圖片 ──
const imageGallery = ref<InstanceType<typeof HcImageGallery>>()
const initialImages = ref<ImageItem[]>([])

const handleImageUpload = async (file: File): Promise<ImageItem> => {
  const formData = new FormData()
  formData.append('id', roomTypeId.value)
  formData.append('image', file)
  formData.append('sort', '0')
  formData.append('status', '1')
  formData.append('caption', JSON.stringify({ zh: '', en: '' }))
  const res = await roomTypeApi.createRoomImage(formData as any)
  const img = (res as any)?.data
  return {
    imageId: img.imageId,
    url: img.url ?? '',
    caption: img.jsonCaption ?? { zh: '', en: '' },
    sort: img.sort ?? 0,
    status: img.status ?? 1,
  }
}

const handleImageUpdate = (
  imageId: string,
  data: { caption: { zh: string; en: string }; sort: number; status: 0 | 1 }
) => {
  const formData = new FormData()
  formData.append('caption', JSON.stringify(data.caption))
  formData.append('sort', String(data.sort))
  formData.append('status', String(data.status))
  return roomTypeApi.updateRoomImage(imageId, formData as any)
}

const handleImageDelete = (imageId: string) => roomTypeApi.deleteRoomImage(imageId)

// ── 載入房型詳細資訊（編輯模式）──
const isDetailLoading = ref(false)

const loadDetail = async () => {
  if (!isEditMode.value) return
  isDetailLoading.value = true
  try {
    const res = await roomTypeApi.getSpecificRoomType(roomTypeId.value)
    const detail = (res as any)?.data
    if (!detail) return

    form.hotelId = detail.hotelId ?? ''
    const normalizedName = normalizeLocalizedText(detail.jsonName ?? detail.name)
    form.name = normalizedName
    form.description = detail.jsonDescription ?? detail.description ?? { zh: '', en: '' }
    form.roomSizeM2 = detail.roomSizeM2 ?? null
    form.maxAdults = detail.maxAdults ?? null
    form.maxChildren = detail.maxChildren ?? null
    form.quantity = detail.quantity ?? null
    form.basePrice = detail.basePrice ?? null
    form.bedConfig = detail.bedConfig ?? []
    form.facilityIds = detail.facilityIds ?? []
    form.sort = detail.sort ?? null
    form.status = detail.status ?? 1
    form.floor = (detail.floor as RoomFloorKey) ?? null
    form.roomLevel = (detail.roomLevel as RoomLevelKey) ?? null
    savedRoomTypeName.value = normalizedName

    // 載入圖片列表
    if (Array.isArray(detail.images)) {
      initialImages.value = detail.images.map((img: any) => ({
        imageId: img.imageId,
        url: img.url ?? '',
        caption: img.jsonCaption ?? { zh: '', en: '' },
        sort: img.sort ?? 0,
        status: img.status ?? 1,
      }))
    }
  } finally {
    isDetailLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadHotels(), loadFacilities(), loadBedOptions()])
  await loadDetail()
})

watch(
  () => appStore.locale,
  () => {
    loadHotels()
    loadFacilities()
  }
)

// ── 提交 ──
const isSubmitting = ref(false)

const handleSubmit = async () => {
  const isValid = (await formRef.value?.validate().catch(() => false)) ?? true
  if (!isValid) {
    ElMessage.warning($t('form.checkRequired'))
    nextTick(() => {
      const firstError = document.querySelector<HTMLElement>('.el-form-item.is-error')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return
  }
  isSubmitting.value = true
  try {
    const formData = new FormData()
    if (!isEditMode.value) formData.append('hotelId', form.hotelId)
    formData.append('name', JSON.stringify(form.name))
    formData.append('description', JSON.stringify(form.description))
    formData.append('roomSizeM2', String(form.roomSizeM2 ?? 0))
    formData.append('maxAdults', String(form.maxAdults ?? 0))
    formData.append('maxChildren', String(form.maxChildren ?? 0))
    formData.append('quantity', String(form.quantity ?? 0))
    formData.append('basePrice', String(form.basePrice ?? 0))
    formData.append('bedConfig', JSON.stringify(form.bedConfig))
    formData.append('facilityIds', JSON.stringify(form.facilityIds))
    if (form.sort !== null) formData.append('sort', String(form.sort))
    formData.append('status', String(form.status))
    if (form.floor !== null) formData.append('floor', String(form.floor))
    if (form.roomLevel !== null) formData.append('roomLevel', String(form.roomLevel))

    if (isEditMode.value) {
      await roomTypeApi.updateSpecificRoomType(roomTypeId.value, formData as any)
    } else {
      for (const file of (imageGallery.value?.fileList ?? []).filter(f => f.raw)) {
        formData.append('images', file.raw as File)
      }
      await roomTypeApi.createRoomType(formData as any)
    }

    ElMessage.success(
      isEditMode.value
        ? $t('messages.updateSuccess', { type: $t('roomType.title') })
        : $t('messages.createSuccess', { type: $t('roomType.title') })
    )
    if (isEditMode.value) {
      savedRoomTypeName.value = {
        zh: form.name.zh ?? '',
        en: form.name.en ?? '',
      }
    }
    await queryClient.invalidateQueries({ queryKey: ['room-types'] })
    router.push('/room-type')
  } catch {
    ElMessage.error(
      isEditMode.value
        ? $t('messages.updateFailed', { type: $t('roomType.title') })
        : $t('messages.createFailed', { type: $t('roomType.title') })
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/room-type')
}
</script>

<template>
  <section class="tw-p-6" v-loading="isDetailLoading">
    <!-- 返回按鈕 -->
    <hc-button link circle class="tw-mb-2" @click="router.push('/room-type')">
      <el-icon size="32px"><Back /></el-icon>
    </hc-button>

    <!-- 大標題 -->
    <h1 class="tw-text-2xl tw-font-bold tw-leading-tight">
      {{ isEditMode ? $t('roomType.edit') : $t('roomType.create') }}
    </h1>

    <p
      v-if="isEditMode && displayRoomTypeName"
      class="tw-mt-1 tw-mb-6 tw-text-lg tw-text-slate-500 tw-font-bold"
    >
      {{ displayRoomTypeName }}
    </p>
    <div v-else class="tw-mb-6" />

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- ── Section 1：基本資訊 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('roomType.specifications') }}</span>
        </template>

        <!-- 飯店選擇（create 可選 / edit 唯讀） -->
        <el-form-item :label="$t('roomType.hotelSelect')" prop="hotelId">
          <el-select
            :disabled="isEditMode"
            v-model="form.hotelId"
            :placeholder="$t('roomType.selectHotel')"
            class="tw-w-full"
          >
            <el-option
              v-for="hotel in hotelOptions"
              :key="hotel.hotelId"
              :label="hotel.name"
              :value="hotel.hotelId"
            />
          </el-select>
        </el-form-item>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('roomType.nameZh')" prop="name.zh">
            <el-input v-model="form.name.zh" :placeholder="$t('roomType.nameZh')" />
          </el-form-item>
          <el-form-item :label="$t('roomType.nameEn')" prop="name.en">
            <el-input v-model="form.name.en" :placeholder="$t('roomType.nameEn')" />
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('roomType.descriptionZh')">
            <el-input
              v-model="form.description.zh"
              type="textarea"
              :rows="3"
              :placeholder="$t('roomType.descriptionZh')"
            />
          </el-form-item>
          <el-form-item :label="$t('roomType.descriptionEn')">
            <el-input
              v-model="form.description.en"
              type="textarea"
              :rows="3"
              :placeholder="$t('roomType.descriptionEn')"
            />
          </el-form-item>
        </div>

        <el-form-item :label="$t('common.status')">
          <el-radio-group v-model="form.status">
            <hc-radio :value="1">{{ $t('common.enable') }}</hc-radio>
            <hc-radio :value="0">{{ $t('common.disable') }}</hc-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <!-- ── Section 2：規格 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('roomType.specifications') }}</span>
        </template>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('roomType.floor')" prop="floor">
            <el-select
              v-model="form.floor"
              :placeholder="$t('roomType.selectFloor')"
              class="tw-w-full"
            >
              <el-option
                v-for="opt in ROOM_FLOOR_OPTIONS"
                :key="opt.key"
                :label="appStore.locale === 'en' ? opt.en : opt.zh"
                :value="opt.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('roomType.roomLevel')" prop="roomLevel">
            <el-select
              v-model="form.roomLevel"
              :placeholder="$t('roomType.selectRoomLevel')"
              class="tw-w-full"
            >
              <el-option
                v-for="opt in ROOM_LEVEL_OPTIONS"
                :key="opt.key"
                :label="appStore.locale === 'en' ? opt.en : opt.zh"
                :value="opt.key"
              />
            </el-select>
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-3 tw-gap-x-6">
          <el-form-item :label="$t('roomType.roomSizeM2')" prop="roomSizeM2">
            <hc-input-number
              v-model="form.roomSizeM2"
              :min="0"
              :precision="1"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('roomType.basePriceNT')" prop="basePrice">
            <hc-input-number
              v-model="form.basePrice"
              :min="0"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('roomType.quantity')" prop="quantity">
            <hc-input-number
              v-model="form.quantity"
              :min="0"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-3 tw-gap-x-6">
          <el-form-item :label="$t('roomType.maxAdultsNum')" prop="maxAdults">
            <hc-input-number
              v-model="form.maxAdults"
              :min="0"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('roomType.maxChildrenNum')" prop="maxChildren">
            <hc-input-number
              v-model="form.maxChildren"
              :min="0"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('roomType.sort')">
            <hc-input-number
              v-model="form.sort"
              :min="0"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
        </div>
      </el-card>

      <!-- ── Section 3：床型設定 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <div class="tw-flex tw-items-center tw-justify-between">
            <span class="tw-font-medium">{{ $t('roomType.bedConfig') }}</span>
            <hc-button size="small" type="primary" plain @click="addBedRow">
              <el-icon class="tw-mr-1"><Plus /></el-icon>{{ $t('roomType.addBed') }}
            </hc-button>
          </div>
        </template>

        <div v-if="form.bedConfig.length === 0" class="tw-text-sm tw-text-slate-400 tw-py-2">
          {{ $t('roomType.bedConfig') }}：{{ $t('common.noData') }}
        </div>

        <div
          v-for="(bed, idx) in form.bedConfig"
          :key="idx"
          class="tw-flex tw-items-center tw-gap-4 tw-mb-3"
        >
          <el-form-item :label="$t('roomType.bedType')" class="tw-flex-1 tw-mb-0">
            <el-select
              v-model="form.bedConfig[idx].type"
              :placeholder="$t('roomType.bedType')"
              class="tw-w-full"
            >
              <el-option
                v-for="opt in bedOptions"
                :key="opt.code"
                :label="opt.name"
                :value="opt.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('roomType.bedCount')" class="tw-w-32 tw-mb-0">
            <hc-input-number
              v-model="bed.num"
              :min="1"
              controls-position="right"
              class="tw-w-full"
            />
          </el-form-item>
          <hc-button type="danger" text circle class="tw-mt-6" @click="removeBedRow(idx)">
            <el-icon><Delete /></el-icon>
          </hc-button>
        </div>
      </el-card>

      <!-- ── Section 4：設施 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('roomType.facilities') }}</span>
        </template>

        <el-form-item :label="$t('roomType.selectFacilities')">
          <el-select
            v-model="form.facilityIds"
            multiple
            filterable
            :placeholder="$t('roomType.selectFacilities')"
            class="tw-w-full"
          >
            <el-option
              v-for="facility in facilityOptions"
              :key="facility.facilityId"
              :label="facility.name"
              :value="facility.facilityId"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- ── Section 5：圖片 ── -->
      <el-card class="tw-mb-6" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('roomType.image') }}</span>
        </template>

        <hc-image-gallery
          ref="imageGallery"
          :is-edit-mode="isEditMode"
          :initial-images="initialImages"
          :on-upload="handleImageUpload"
          :on-update="handleImageUpdate"
          :on-delete="handleImageDelete"
        />
      </el-card>

      <!-- ── 操作按鈕 ── -->
      <div class="tw-flex tw-gap-3">
        <hc-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          {{ isEditMode ? $t('common.update') : $t('common.create') }}
        </hc-button>
        <hc-button :disabled="isSubmitting" @click="handleCancel">{{
          $t('common.cancel')
        }}</hc-button>
      </div>
    </el-form>
  </section>
</template>
