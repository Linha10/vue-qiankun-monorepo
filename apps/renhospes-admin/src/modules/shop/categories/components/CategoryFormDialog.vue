<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import {
  HcDialog,
  HcInput,
  HcSelect,
  HcInputNumber,
  HcSwitch,
  HcImage,
  HcUpload,
} from '@monorepo/ui-kit'
import { shopCategory } from '@/api/shopCategory'
import type { CategoryItem, CategoryParams } from '@/types/api-params'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'view' | 'edit'
  categoryId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

const { $t } = useI18n()

// ── Computed ───────────────────────────────────────────────────
const isViewMode = computed(() => props.mode === 'view')
const isSaving = ref(false)

const dialogTitle = computed(() => {
  if (props.mode === 'create') return $t('shop.category.form.createTitle')
  if (props.mode === 'edit') return $t('shop.category.form.editTitle')
  return $t('shop.category.form.viewTitle')
})

// ── 表單 ───────────────────────────────────────────────────────
interface FormData {
  nameZh: string
  nameEn: string
  descZh: string
  descEn: string
  seriesType: string
  seriesKey: string
  sort: number
  status: 0 | 1
  imageFile: File | null
  imagePreview: string
}

const defaultForm = (): FormData => ({
  nameZh: '',
  nameEn: '',
  descZh: '',
  descEn: '',
  seriesType: '',
  seriesKey: '',
  sort: 0,
  status: 1,
  imageFile: null,
  imagePreview: '',
})

const form = reactive<FormData>(defaultForm())

// 儲存 fetch 回來的原始資料供 edit 時 spread
const fetchedItem = ref<CategoryItem | null>(null)

// ── 開啟時初始化 ───────────────────────────────────────────────
watch(
  () => props.modelValue,
  async open => {
    if (!open) return
    Object.assign(form, defaultForm())
    fetchedItem.value = null

    if ((props.mode === 'edit' || props.mode === 'view') && props.categoryId) {
      try {
        const res = await shopCategory.getCategory(props.categoryId)
        const detail = (res as { data: CategoryItem })?.data
        if (!detail) return

        fetchedItem.value = detail

        const name = detail.jsonName ?? { zh: '', en: '' }
        const desc = detail.jsonDesc ?? { zh: '', en: '' }

        Object.assign(form, {
          nameZh: name.zh ?? '',
          nameEn: name.en ?? '',
          descZh: desc.zh ?? '',
          descEn: desc.en ?? '',
          seriesType: detail.seriesType ?? '',
          seriesKey: detail.seriesKey ?? '',
          sort: detail.sort ?? 0,
          status: detail.status ?? 1,
          imageFile: null,
          imagePreview: detail.image ?? '',
        })
      } catch {
        ElMessage.error($t('shop.category.messages.fetchError'))
      }
    }
  }
)

// ── seriesType → seriesKey 自動填入 ───────────────────────────
watch(
  () => form.seriesType,
  val => {
    form.seriesKey = val
  }
)

// ── 圖片 ───────────────────────────────────────────────────────
function handleImageChange(file: File) {
  form.imageFile = file
  form.imagePreview = URL.createObjectURL(file)
}

function handleImageDelete() {
  form.imageFile = null
  form.imagePreview = ''
}

// ── 送出 ───────────────────────────────────────────────────────
async function handleSubmit() {
  if (!form.nameZh) {
    ElMessage.warning($t('form.checkRequired'))
    return
  }
  if (!form.seriesType || !form.seriesKey) {
    ElMessage.warning($t('form.checkRequired'))
    return
  }

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      // create：使用 FormData 傳 File
      const fd = new FormData()
      fd.append('name', JSON.stringify({ zh: form.nameZh, en: form.nameEn }))
      fd.append('description', JSON.stringify({ zh: form.descZh, en: form.descEn }))
      fd.append('seriesType', form.seriesType)
      fd.append('seriesKey', form.seriesKey)
      fd.append('sort', String(form.sort))
      fd.append('status', String(form.status))
      if (form.imageFile) {
        fd.append('image', form.imageFile)
      }
      await shopCategory.createCategory(fd as unknown as CategoryParams)
      ElMessage.success($t('shop.category.messages.createSuccess'))
    } else if (props.mode === 'edit' && props.categoryId && fetchedItem.value) {
      await shopCategory.updateCategory(props.categoryId, {
        id: props.categoryId,
        name: { zh: form.nameZh, en: form.nameEn },
        description: { zh: form.descZh, en: form.descEn },
        seriesType: form.seriesType,
        seriesKey: form.seriesKey,
        sort: form.sort,
        status: form.status,
        ...(form.imageFile ? { image: form.imageFile } : {}),
      })
      ElMessage.success($t('shop.category.messages.updateSuccess'))
    }

    emit('success')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error(
      props.mode === 'create'
        ? $t('messages.createFailed', { type: '' })
        : $t('messages.updateFailed', { type: '' })
    )
  } finally {
    isSaving.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>
<!-- TODO 在edit模式下, 圖片要可以刪除跟preview.有圖片時使用el-image(hc-image),無圖片時則使用HcUpload.-->
<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :loading="isSaving"
    :show-footer="!isViewMode"
    width="720px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form label-position="top" class="tw-flex tw-flex-col tw-gap-4 tw-pt-2">
      <!-- ── Section 1：基本資訊 ─────────────────────────────── -->
      <div class="form-section">
        <div class="form-section__header">
          <i class="fa-solid fa-tag form-section__icon" />
          <span>{{ $t('shop.category.form.sectionInfo') }}</span>
        </div>

        <el-row :gutter="16">
          <!-- 名稱 zh / en -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.nameZh')" required>
              <HcInput
                v-model="form.nameZh"
                :disabled="isViewMode"
                :placeholder="$t('form.pleaseFill', { field: $t('shop.category.form.nameZh') })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.nameEn')">
              <HcInput
                v-model="form.nameEn"
                :disabled="isViewMode"
                :placeholder="$t('form.pleaseFill', { field: $t('shop.category.form.nameEn') })"
              />
            </el-form-item>
          </el-col>

          <!-- 描述 zh / en -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.descZh')">
              <HcInput v-model="form.descZh" type="textarea" :rows="3" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.descEn')">
              <HcInput v-model="form.descEn" type="textarea" :rows="3" :disabled="isViewMode" />
            </el-form-item>
          </el-col>

          <!-- 系列類型 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.seriesType')" required>
              <HcSelect
                v-model="form.seriesType"
                :disabled="isViewMode"
                :placeholder="
                  $t('form.pleaseSelect', { field: $t('shop.category.form.seriesType') })
                "
                style="width: 100%"
              >
                <el-option :label="$t('shop.category.seriesType.saffron')" value="series-saffron" />
                <el-option
                  :label="$t('shop.category.seriesType.machupicchu')"
                  value="series-machu-picchu"
                />
                <el-option
                  :label="$t('shop.category.seriesType.marrakesh')"
                  value="series-marrakesh"
                />
              </HcSelect>
            </el-form-item>
          </el-col>

          <!-- 系列 Key -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.seriesKey')" required>
              <HcInput v-model="form.seriesKey" disabled :placeholder="$t('form.autoFill')" />
            </el-form-item>
          </el-col>

          <!-- 排序 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.sort')">
              <HcInputNumber
                v-model="form.sort"
                :min="0"
                :disabled="isViewMode"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 狀態 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.category.form.statusLabel')" class="tw-mb-2">
              <HcSwitch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── Section 2：圖片 ────────────────────────────────── -->
      <div class="form-section form-section--last">
        <div class="form-section__header">
          <i class="fa-solid fa-image form-section__icon" />
          <span>{{ $t('shop.category.form.sectionImage') }}</span>
          <span class="form-section__tip">{{ $t('shop.category.form.imageTip') }}</span>
        </div>

        <!-- 有圖片：HcImage + 删除按鈕（view 模式不顯示删除） -->
        <div v-if="form.imagePreview" class="image-preview-wrapper">
          <HcImage
            :src="form.imagePreview"
            :preview-src-list="[form.imagePreview]"
            fit="contain"
            preview-teleported
            class="image-preview-img"
          />
          <div v-if="!isViewMode" class="image-preview-delete">
            <el-button type="danger" circle size="small" @click="handleImageDelete">
              <i class="fa-solid fa-trash" />
            </el-button>
          </div>
        </div>

        <!-- 無圖片 + 非 view 模式：HcUpload -->
        <HcUpload v-else-if="!isViewMode" @change="handleImageChange" />

        <!-- 無圖片 + view 模式：placheholder -->
        <div v-else class="no-image-placeholder">
          <i class="fa-solid fa-image" />
          <span>暫無圖片</span>
        </div>
      </div>
    </el-form>
  </HcDialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

:deep(.el-dialog__body) {
  padding: 12px 16px;
}

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

  &__tip {
    margin-left: auto;
    font-size: 11px;
    font-weight: 400;
    color: $color-neutral-400;
  }
}

// ── 圖片預覽區域 ─────────────────────────────────────────
.image-preview-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid $color-neutral-200;
  background: $color-neutral-100;
}

.image-preview-img {
  width: 100%;
  height: 100%;
}

.image-preview-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  .image-preview-wrapper:hover & {
    opacity: 1;
  }
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  gap: 8px;
  border: 1px dashed $color-neutral-300;
  border-radius: 8px;
  color: $color-neutral-400;

  i {
    font-size: 24px;
  }

  span {
    font-size: 13px;
  }
}
</style>
