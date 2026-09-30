<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { promotionApi } from '@/api/promotion'
import {
  HcDialog,
  HcRichEditor,
  HcInputNumber,
  HcInput,
  HcSwitch,
  HcTabs,
  HcDatePicker,
  HcRadio,
} from '@monorepo/ui-kit'
import type { PromotionListResponseItem } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  hotelId: string
  promotion: PromotionListResponseItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

const { $t, locale } = useI18n()

// ISO 8601 ("2026-07-01T13:12:48+08:00") → el-date-picker 可接受的 "YYYY-MM-DD HH:mm:ss"
function toFormDatetime(iso: string): string {
  if (!iso) return ''
  return iso
    .replace('T', ' ')
    .replace(/[+-]\d{2}:\d{2}$|Z$/, '')
    .slice(0, 19)
}

// ── 表單資料 ───────────────────────────────────────────────────
const isEditMode = computed(() => !!props.promotion)
const isSaving = ref(false)
const activeTab = ref('basic')

interface FormData {
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  tagZh: string
  tagEn: string
  typeId: number
  top: 0 | 1
  sort: number
  startTime: string
  endTime: string
  url: string
  status: 1 | 2
  coverImage: File | null
  coverImagePreview: string
  contentZh: string
  contentEn: string
  metaTitleZh: string
  metaTitleEn: string
  metaDescZh: string
  metaDescEn: string
  imageAltZh: string
  imageAltEn: string
  overviewZh: string
  overviewEn: string
}

const defaultForm = (): FormData => ({
  titleZh: '',
  titleEn: '',
  subtitleZh: '',
  subtitleEn: '',
  tagZh: '',
  tagEn: '',
  typeId: 1,
  top: 0,
  sort: 0,
  startTime: '',
  endTime: '',
  url: '',
  status: 1,
  coverImage: null,
  coverImagePreview: '',
  contentZh: '',
  contentEn: '',
  metaTitleZh: '',
  metaTitleEn: '',
  metaDescZh: '',
  metaDescEn: '',
  imageAltZh: '',
  imageAltEn: '',
  overviewZh: '',
  overviewEn: '',
})

const form = reactive<FormData>(defaultForm())

// ── 開啟時初始化 ───────────────────────────────────────────────
watch(
  () => props.modelValue,
  async open => {
    if (!open) return
    activeTab.value = 'basic'
    Object.assign(form, defaultForm())

    if (!props.promotion) return
    // 編輯模式：取得詳情（含多語系欄位）
    try {
      const res = await promotionApi.getPromotionDetail(props.promotion.id, locale.value)
      const detail = (res as any)?.data
      if (!detail) return
      const j = (field: any) => {
        if (!field) return { zh: '', en: '' }
        if (typeof field === 'string') {
          try {
            return JSON.parse(field)
          } catch {
            return { zh: field, en: '' }
          }
        }
        return field
      }
      const title = j(detail.jsonTitle)
      const subtitle = j(detail.jsonSubtitle)
      const tag = j(detail.jsonTag)
      const content = j(detail.jsonContent)
      const metaTitle = j(detail.jsonMetaTitle)
      const metaDesc = j(detail.jsonMetaDescription)
      const imageAlt = j(detail.jsonImageAlt)
      const overview = j(detail.jsonOverview)

      Object.assign(form, {
        titleZh: title.zh ?? '',
        titleEn: title.en ?? '',
        subtitleZh: subtitle.zh ?? '',
        subtitleEn: subtitle.en ?? '',
        tagZh: tag.zh ?? '',
        tagEn: tag.en ?? '',
        typeId: detail.typeId ?? 1,
        top: detail.top ?? 0,
        sort: detail.sort ?? 0,
        startTime: toFormDatetime(detail.startTime ?? ''),
        endTime: toFormDatetime(detail.endTime ?? ''),
        url: detail.url ?? '',
        status: detail.status ?? 1,
        coverImage: null,
        coverImagePreview: detail.image ?? '',
        contentZh: content.zh ?? '',
        contentEn: content.en ?? '',
        metaTitleZh: metaTitle.zh ?? '',
        metaTitleEn: metaTitle.en ?? '',
        metaDescZh: metaDesc.zh ?? '',
        metaDescEn: metaDesc.en ?? '',
        imageAltZh: imageAlt.zh ?? '',
        imageAltEn: imageAlt.en ?? '',
        overviewZh: overview.zh ?? '',
        overviewEn: overview.en ?? '',
      })
    } catch {
      ElMessage.error($t('promotion.form.fetchError'))
    }
  }
)

// ── 封面圖上傳 ────────────────────────────────────────────────
function handleCoverChange(file: File) {
  form.coverImage = file
  form.coverImagePreview = URL.createObjectURL(file)
}

function handleCoverBeforeUpload(rawFile: File) {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error($t('promotion.form.uploadImageTypeError'))
    return false
  }
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error($t('promotion.form.uploadImageSizeError'))
    return false
  }
  return true
}

// ── 送出表單 ──────────────────────────────────────────────────
async function handleSubmit() {
  if (!form.titleZh) {
    activeTab.value = 'basic'
    ElMessage.warning($t('promotion.form.titleRequired'))
    return
  }
  if (!form.startTime || !form.endTime) {
    activeTab.value = 'basic'
    ElMessage.warning($t('promotion.form.timeRequired'))
    return
  }

  isSaving.value = true
  try {
    const fd = new FormData()
    fd.append('hotelId', props.hotelId)
    fd.append('title', JSON.stringify({ zh: form.titleZh, en: form.titleEn }))
    fd.append('subtitle', JSON.stringify({ zh: form.subtitleZh, en: form.subtitleEn }))
    fd.append('tag', JSON.stringify({ zh: form.tagZh, en: form.tagEn }))
    fd.append('content', JSON.stringify({ zh: form.contentZh, en: form.contentEn }))
    fd.append('metaTitle', JSON.stringify({ zh: form.metaTitleZh, en: form.metaTitleEn }))
    fd.append('metaDescription', JSON.stringify({ zh: form.metaDescZh, en: form.metaDescEn }))
    fd.append('imageAlt', JSON.stringify({ zh: form.imageAltZh, en: form.imageAltEn }))
    fd.append('overview', JSON.stringify({ zh: form.overviewZh, en: form.overviewEn }))
    fd.append('typeId', String(form.typeId))
    fd.append('top', String(form.top))
    fd.append('sort', String(form.sort))
    fd.append('startTime', form.startTime)
    fd.append('endTime', form.endTime)
    fd.append('url', form.url)
    fd.append('status', String(form.status))
    if (form.coverImage) {
      fd.append('image', form.coverImage)
    }

    if (isEditMode.value && props.promotion) {
      await promotionApi.updatePromotion(props.promotion.id, fd)
      ElMessage.success($t('promotion.form.updateSuccess'))
    } else {
      await promotionApi.createPromotion(fd)
      ElMessage.success($t('promotion.form.createSuccess'))
    }
    emit('success')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error(
      isEditMode.value
        ? $t('messages.updateFailed', { type: '' })
        : $t('messages.createFailed', { type: '' })
    )
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
    :title="isEditMode ? $t('promotion.form.editTitle') : $t('promotion.form.createTitle')"
    :loading="isSaving"
    width="800px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form label-position="top">
      <HcTabs v-model="activeTab" class="tw-mt-1">
        <!-- ────────── Tab 1: 基本資訊 ────────── -->
        <el-tab-pane :label="$t('promotion.form.tabBasic')" name="basic">
          <div class="tw-flex tw-flex-col tw-gap-4 tw-pt-3">
            <!-- Section: 活動類型 -->
            <div class="form-section">
              <div class="form-section__header">
                <i class="fa-solid fa-tag form-section__icon" />
                <span>{{ $t('promotion.form.typeId') }}</span>
              </div>
              <el-row>
                <el-col :span="24">
                  <el-form-item class="tw-mb-2">
                    <el-radio-group v-model="form.typeId">
                      <HcRadio :value="1">{{ $t('promotion.typeId.1') }}</HcRadio>
                      <HcRadio :value="2">{{ $t('promotion.typeId.2') }}</HcRadio>
                      <HcRadio :value="3">{{ $t('promotion.typeId.3') }}</HcRadio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Section: 標題與標籤 -->
            <div class="form-section">
              <div class="form-section__header">
                <i class="fa-solid fa-heading form-section__icon" />
                <span>{{ $t('promotion.form.sectionTitleTag') }}</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.titleZh')" required>
                    <HcInput
                      v-model="form.titleZh"
                      :placeholder="$t('form.pleaseFill', { field: $t('promotion.form.titleZh') })"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.titleEn')">
                    <HcInput
                      v-model="form.titleEn"
                      :placeholder="$t('form.pleaseFill', { field: $t('promotion.form.titleEn') })"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.subtitleZh')">
                    <HcInput v-model="form.subtitleZh" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.subtitleEn')">
                    <HcInput v-model="form.subtitleEn" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.tagZh')" class="tw-mb-2">
                    <HcInput v-model="form.tagZh" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.tagEn')" class="tw-mb-2">
                    <HcInput v-model="form.tagEn" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Section: 概覽 -->
            <div class="form-section">
              <div class="form-section__header">
                <i class="fa-solid fa-align-left form-section__icon" />
                <span>{{ $t('promotion.form.sectionOverview') }}</span>
                <el-tooltip
                  :content="$t('promotion.form.overviewTooltip')"
                  placement="top"
                  effect="dark"
                >
                  <i class="fa-solid fa-circle-info tw-ml-1 tw-text-neutral-400 tw-cursor-help" />
                </el-tooltip>
              </div>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('promotion.form.overviewZh')">
                    <HcInput v-model="form.overviewZh" type="textarea" :rows="3" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('promotion.form.overviewEn')" class="tw-mb-2">
                    <HcInput v-model="form.overviewEn" type="textarea" :rows="3" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Section: 封面圖片 -->
            <div class="form-section">
              <div class="form-section__header">
                <i class="fa-solid fa-image form-section__icon" />
                <span>{{ $t('promotion.form.coverImage') }}</span>
              </div>
              <el-row>
                <el-col :span="24">
                  <el-form-item class="tw-mb-2">
                    <el-upload
                      :show-file-list="false"
                      accept="image/*"
                      :before-upload="handleCoverBeforeUpload"
                      :on-change="(f: any) => handleCoverChange(f.raw)"
                      :auto-upload="false"
                      class="tw-w-full"
                    >
                      <div
                        class="cover-upload-area"
                        :class="{ 'has-image': form.coverImagePreview }"
                      >
                        <template v-if="form.coverImagePreview">
                          <el-image
                            :src="form.coverImagePreview"
                            fit="cover"
                            class="cover-preview-img"
                          >
                            <template #error>
                              <div class="cover-load-error">
                                <i class="fa-solid fa-image" />
                                <span>{{ $t('promotion.form.imageLoadError') }}</span>
                              </div>
                            </template>
                          </el-image>
                          <div class="cover-overlay">
                            <i class="fa-solid fa-camera tw-text-xl tw-mb-1" />
                            <span>{{ $t('promotion.form.reupload') }}</span>
                          </div>
                        </template>
                        <template v-else>
                          <i class="fa-solid fa-image tw-text-3xl tw-mb-2 tw-text-neutral-400" />
                          <span class="tw-text-sm tw-text-neutral-500">{{
                            $t('promotion.form.clickToUpload')
                          }}</span>
                          <span class="tw-text-xs tw-text-neutral-400 tw-mt-1">
                            {{ $t('promotion.form.uploadHint') }}
                          </span>
                        </template>
                      </div>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Section: 排版設定與上下架時間 -->
            <div class="form-section form-section--last">
              <div class="form-section__header">
                <i class="fa-solid fa-sliders form-section__icon" />
                <span>{{ $t('promotion.form.sectionLayoutTime') }}</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.sort')">
                    <HcInputNumber v-model="form.sort" :min="0" :max="9999" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.top')">
                    <HcSwitch
                      :model-value="form.top === 1"
                      @change="(v: string | number | boolean) => (form.top = v ? 1 : 0)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.startTime')" required>
                    <HcDatePicker
                      v-model="form.startTime"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.endTime')" required>
                    <HcDatePicker
                      v-model="form.endTime"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('promotion.form.url')" class="tw-mb-2">
                    <HcInput v-model="form.url" placeholder="https://..." />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- ────────── Tab 2: 內容 ────────── -->
        <el-tab-pane :label="$t('promotion.form.tabContent')" name="content">
          <div class="tw-pt-3">
            <div class="form-section form-section--last">
              <div class="form-section__header">
                <i class="fa-solid fa-file-lines form-section__icon" />
                <span>{{ $t('promotion.form.tabContent') }}</span>
              </div>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('promotion.form.contentZh')" class="content-form-item">
                    <HcRichEditor v-model="form.contentZh" min-height="220px" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('promotion.form.contentEn')"
                    class="content-form-item tw-mb-2"
                  >
                    <HcRichEditor v-model="form.contentEn" min-height="220px" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- ────────── Tab 3: SEO ────────── -->
        <el-tab-pane :label="$t('promotion.form.tabSeo')" name="seo">
          <div class="tw-pt-3">
            <div class="form-section form-section--last">
              <div class="form-section__header">
                <i class="fa-solid fa-magnifying-glass form-section__icon" />
                <span>{{ $t('promotion.form.sectionSeo') }}</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.metaTitleZh')">
                    <HcInput v-model="form.metaTitleZh" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.metaTitleEn')">
                    <HcInput v-model="form.metaTitleEn" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.metaDescZh')">
                    <HcInput v-model="form.metaDescZh" type="textarea" :rows="3" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.metaDescEn')">
                    <HcInput v-model="form.metaDescEn" type="textarea" :rows="3" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.imageAltZh')" class="tw-mb-2">
                    <HcInput v-model="form.imageAltZh" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('promotion.form.imageAltEn')" class="tw-mb-2">
                    <HcInput v-model="form.imageAltEn" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
      </HcTabs>
    </el-form>
  </HcDialog>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* ── dialog body padding ──────────────────────────────────── */
:deep(.el-dialog__body) {
  padding: 12px 16px;
}

/* ── form-section card（同 OrderFormDialog 設計） ─────────── */
.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 16px 16px 16px;
  background: $color-neutral-0;

  &--last {
    margin-bottom: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-700;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid $color-neutral-100;
  }

  &__icon {
    color: $color-primary;
    font-size: 15px;
  }
}

/* ── 封面圖上傳區域 ───────────────────────────────────────── */
.cover-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 140px;
  border: 2px dashed $color-neutral-300;
  border-radius: 8px;
  background: $color-neutral-50;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:hover {
    border-color: $color-primary;
    background: $color-primary-50;
  }

  &.has-image {
    border-style: solid;
    border-color: $color-neutral-200;
    background: $color-neutral-100;
  }
}

.cover-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-load-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: $color-neutral-500;
  background: $color-neutral-50;

  i {
    font-size: 20px;
  }

  span {
    font-size: 12px;
  }
}

.cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;

  .cover-upload-area:hover & {
    opacity: 1;
  }
}

/* ── content tab：el-form-item content 撐滿寬度 ─────────── */
.content-form-item {
  :deep(.el-form-item__content) {
    width: 100%;
  }
}
</style>
