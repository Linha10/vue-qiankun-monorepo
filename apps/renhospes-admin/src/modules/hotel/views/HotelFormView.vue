<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useQueryClient } from '@tanstack/vue-query'
import { hotelApi } from '@/api/hotel'
import { facilitiesApi } from '@/api/facilities'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import type { ImageItem } from '@/types/api-params'
import { HcButton, HcRadio, HcImageGallery } from '@monorepo/ui-kit'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { $t } = useI18n()
const appStore = useAppStore()

const isEditMode = computed(() => route.name === 'HotelEdit')
const hotelId = computed(() => route.params.hotelId as string)

// 儲存從 API 取得的飯店名稱，不隨表單編輯變動
const savedHotelName = ref('')

// ── 表單 ──
interface HotelFormState {
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  latitude: number | null
  longitude: number | null
  locationInfo: {
    address: { zh: string; en: string }
  }
  facilityIds: string[]
  status: 0 | 1
}

const formRef = ref<FormInstance>()
const form = reactive<HotelFormState>({
  name: { zh: '', en: '' },
  description: { zh: '', en: '' },
  latitude: null,
  longitude: null,
  locationInfo: {
    address: { zh: '', en: '' },
  },
  facilityIds: [],
  status: 1,
})

// ── 驗證規則 ──
const rules = computed<FormRules>(() => ({
  'name.zh': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.nameZh') }),
      trigger: 'blur',
    },
  ],
  'name.en': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.nameEn') }),
      trigger: 'blur',
    },
  ],
  latitude: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.latitude') }),
      trigger: 'blur',
    },
  ],
  longitude: [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.longitude') }),
      trigger: 'blur',
    },
  ],
  'locationInfo.address.zh': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.addressZh') }),
      trigger: 'blur',
    },
  ],
  'locationInfo.address.en': [
    {
      required: true,
      message: $t('form.pleaseFill', { field: $t('hotel.addressEn') }),
      trigger: 'blur',
    },
  ],
}))

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
  } catch {
    // 不影響主流程
  }
}

// ── 圖片 ──
const imageGallery = ref<InstanceType<typeof HcImageGallery>>()
const initialImages = ref<ImageItem[]>([])

const handleImageUpload = async (file: File): Promise<ImageItem> => {
  const formData = new FormData()
  formData.append('id', hotelId.value)
  formData.append('image', file)
  formData.append('sort', '0')
  formData.append('status', '1')
  formData.append('caption', JSON.stringify({ zh: '', en: '' }))
  const res = await hotelApi.uploadHotelImage(formData as any)
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
) => hotelApi.updateHotelImage(imageId, data)

const handleImageDelete = (imageId: string) => hotelApi.deleteHotelImage(imageId)

// ── 載入飯店詳細資訊（編輯模式）──
const isDetailLoading = ref(false)

const loadDetail = async () => {
  if (!isEditMode.value) return
  isDetailLoading.value = true
  try {
    const res = await hotelApi.getHotelDetail(hotelId.value)
    const detail = (res as any)?.data
    if (!detail) return

    form.name = detail.jsonName ?? { zh: '', en: '' }
    form.description = detail.jsonDescription ?? { zh: '', en: '' }
    form.latitude = detail.latitude ?? null
    form.longitude = detail.longitude ?? null
    form.locationInfo = detail.locationInfo ?? { address: { zh: '', en: '' } }
    form.facilityIds = detail.facilityIds ?? []
    form.status = detail.status ?? 1
    savedHotelName.value = detail.name ?? ''

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
  await loadFacilities()
  await loadDetail()
})

watch(
  () => appStore.locale,
  () => {
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
    formData.append('name', JSON.stringify(form.name))
    formData.append('description', JSON.stringify(form.description))
    formData.append('latitude', String(form.latitude))
    formData.append('longitude', String(form.longitude))
    formData.append('locationInfo', JSON.stringify(form.locationInfo))
    formData.append('facilityIds', JSON.stringify(form.facilityIds))
    formData.append('status', String(form.status))

    if (isEditMode.value) {
      await hotelApi.updateHotel(hotelId.value, formData as any)
    } else {
      for (const file of (imageGallery.value?.fileList ?? []).filter(f => f.raw)) {
        formData.append('images', file.raw as File)
      }
      await hotelApi.createHotel(formData as any)
    }

    ElMessage.success(
      isEditMode.value
        ? $t('messages.updateSuccess', { type: $t('hotel.title') })
        : $t('messages.createSuccess', { type: $t('hotel.title') })
    )
    if (isEditMode.value) savedHotelName.value = form.name.zh
    await queryClient.invalidateQueries({ queryKey: ['hotels'] })
    router.push('/hotel')
  } catch {
    ElMessage.error(
      isEditMode.value
        ? $t('messages.updateFailed', { type: $t('hotel.title') })
        : $t('messages.createFailed', { type: $t('hotel.title') })
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/hotel')
}
</script>

<template>
  <section class="tw-p-6" v-loading="isDetailLoading">
    <!-- 返回按鈕 -->
    <hc-button link circle class="tw-mb-2" @click="router.push('/hotel')">
      <el-icon size="32px">
        <Back />
      </el-icon>
    </hc-button>

    <!-- 大標題 -->
    <h1 class="tw-text-2xl tw-font-bold tw-leading-tight">
      {{ isEditMode ? $t('hotel.edit') : $t('hotel.create') }}
    </h1>

    <!-- 飯店名稱（編輯模式，儲存從 API 取得，不隨編輯變動） -->
    <p
      v-if="isEditMode && savedHotelName"
      class="tw-mt-1 tw-mb-6 tw-text-lg tw-text-slate-500 tw-font-bold"
    >
      {{ savedHotelName }}
    </p>
    <div v-else class="tw-mb-6" />

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- ── Section 1：基本資訊 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('hotel.basicInfo') }}</span>
        </template>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('hotel.nameZh')" prop="name.zh">
            <el-input v-model="form.name.zh" :placeholder="$t('hotel.nameZh')" />
          </el-form-item>
          <el-form-item :label="$t('hotel.nameEn')" prop="name.en">
            <el-input v-model="form.name.en" :placeholder="$t('hotel.nameEn')" />
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('hotel.descriptionZh')" prop="description.zh">
            <el-input
              v-model="form.description.zh"
              type="textarea"
              :rows="3"
              :placeholder="$t('hotel.descriptionZh')"
            />
          </el-form-item>
          <el-form-item :label="$t('hotel.descriptionEn')" prop="description.en">
            <el-input
              v-model="form.description.en"
              type="textarea"
              :rows="3"
              :placeholder="$t('hotel.descriptionEn')"
            />
          </el-form-item>
        </div>

        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="form.status">
            <hc-radio :value="1">{{ $t('common.enable') }}</hc-radio>
            <hc-radio :value="0">{{ $t('common.disable') }}</hc-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <!-- ── Section 2：地點資訊 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('hotel.locationInfo') }}</span>
        </template>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('hotel.latitude')" prop="latitude">
            <el-input v-model.number="form.latitude" placeholder="例：25.036043" />
          </el-form-item>
          <el-form-item :label="$t('hotel.longitude')" prop="longitude">
            <el-input v-model.number="form.longitude" placeholder="例：121.560098" />
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('hotel.addressZh')" prop="locationInfo.address.zh">
            <el-input v-model="form.locationInfo.address.zh" :placeholder="$t('hotel.addressZh')" />
          </el-form-item>
          <el-form-item :label="$t('hotel.addressEn')" prop="locationInfo.address.en">
            <el-input v-model="form.locationInfo.address.en" :placeholder="$t('hotel.addressEn')" />
          </el-form-item>
        </div>
      </el-card>

      <!-- ── Section 3：設施 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('hotel.facilities') }}</span>
        </template>

        <el-form-item :label="$t('hotel.selectFacilities')" prop="facilityIds">
          <el-select
            v-model="form.facilityIds"
            multiple
            filterable
            :placeholder="$t('hotel.selectFacilities')"
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

      <!-- ── Section 4：圖片 ── -->
      <el-card class="tw-mb-6" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{ $t('hotel.images') }}</span>
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
