<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { shopProductApi } from '@/api/shopProduct'
import { shopCategory } from '@/api/shopCategory'
import type { ShopItem, CategoryItem, GetCategoryListParams } from '@/types/api-params'
import { HcDialog, HcInput, HcInputNumber, HcSelect, HcSwitch } from '@monorepo/ui-kit'
import ProductImageCard from './ProductImageCard.vue'
import type { StagedImage, ExistingImage } from './ProductImageCard.vue'

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'view' | 'edit'
  productId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

const { $t } = useI18n()
const appStore = useAppStore()

// ── Computed ───────────────────────────────────────────────────
const isViewMode = computed(() => props.mode === 'view')
const isSaving = ref(false)

const dialogTitle = computed(() => {
  if (props.mode === 'create') return $t('shop.product.form.createTitle')
  if (props.mode === 'edit') return $t('shop.product.form.editTitle')
  return $t('shop.product.form.viewTitle')
})

// ── Category 選項 ──────────────────────────────────────────────
const categoryOptions = ref<CategoryItem[]>([])

async function fetchCategories() {
  try {
    const res = await shopCategory.getCategoryList({
      page: 1,
      pageSize: 100,
      lang: appStore.locale,
      search: '',
    } as GetCategoryListParams)
    const data = (res as { data: { list: CategoryItem[] } })?.data
    categoryOptions.value = data?.list ?? []
  } catch {
    // 靜默失敗，select 顯示空
  }
}

// ── 系列自動帶入（從所選類別取得 seriesType）──────────────────
const derivedSeriesType = computed(
  () => categoryOptions.value.find(c => c.categoryId === form.categoryId)?.seriesType ?? ''
)

const seriesTypeLabel: Record<string, string> = {
  'series-saffron': $t('shop.category.seriesType.saffron'),
  'series-machu-picchu': $t('shop.category.seriesType.machupicchu'),
  'series-marrakesh': $t('shop.category.seriesType.marrakesh'),
}

const derivedSeriesLabel = computed(
  () => seriesTypeLabel[derivedSeriesType.value] ?? derivedSeriesType.value
)

// ── 表單 ───────────────────────────────────────────────────────
interface FormData {
  categoryId: string
  nameZh: string
  nameEn: string
  descZh: string
  descEn: string
  price: number
  stock: number
  isActive: boolean
  status: 0 | 1
  sizeLength: number
  sizeWidth: number
  sizeHeight: number
}

const defaultForm = (): FormData => ({
  categoryId: '',
  nameZh: '',
  nameEn: '',
  descZh: '',
  descEn: '',
  price: 0,
  stock: 0,
  isActive: false,
  status: 1,
  sizeLength: 0,
  sizeWidth: 0,
  sizeHeight: 0,
})

const form = reactive<FormData>(defaultForm())

// ── 圖片狀態 ───────────────────────────────────────────────────
const stagedImages = ref<StagedImage[]>([]) // 新上傳（尚未送 API）
const existingImages = ref<ExistingImage[]>([]) // edit/view 模式已有圖

const totalImageCount = computed(
  () => stagedImages.value.length + existingImages.value.filter(i => !i.deleted).length
)
const canUploadMore = computed(() => !isViewMode.value && totalImageCount.value < 3)

// ── 開啟時初始化 ───────────────────────────────────────────────
watch(
  () => props.modelValue,
  async open => {
    if (!open) return

    Object.assign(form, defaultForm())
    stagedImages.value = []
    existingImages.value = []

    fetchCategories()

    if ((props.mode === 'edit' || props.mode === 'view') && props.productId) {
      try {
        const res = await shopProductApi.getProductDetail(props.productId, appStore.locale)
        const detail = (res as { data: ShopItem })?.data
        if (!detail) return

        // 解析 size 字串為三個欄位（支援 "100 x 50 x 30" 和 "100x50x30" 兩種格式）
        const sizeString = detail.size ?? ''
        const parsedSize = sizeString.split('x').map((s: string) => Number(s.trim()))

        Object.assign(form, {
          categoryId: detail.categoryId ?? '',
          nameZh: detail.jsonName?.zh ?? '',
          nameEn: detail.jsonName?.en ?? '',
          descZh: detail.jsonDesc?.zh ?? '',
          descEn: detail.jsonDesc?.en ?? '',
          price: detail.price ?? 0,
          stock: detail.stock ?? 0,
          isActive: detail.isActive ?? false,
          status: detail.status ?? 1,
          sizeLength: parsedSize[0] ?? 0,
          sizeWidth: parsedSize[1] ?? 0,
          sizeHeight: parsedSize[2] ?? 0,
        })

        existingImages.value = (detail.images ?? []).map(img => ({
          imageId: img.imageId,
          url: img.url,
          sort: img.sort ?? 1,
          status: (img.status ?? 1) as 1 | 2,
          caption: {
            zh: img.jsonCaption?.zh ?? '',
            en: img.jsonCaption?.en ?? '',
          },
          expanded: false,
          modified: false,
          deleted: false,
        }))
      } catch {
        ElMessage.error($t('shop.product.messages.fetchError'))
      }
    }
  }
)

// ── 圖片上傳 ───────────────────────────────────────────────────
function handleUploadChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = '' // 允許重複選同一檔案

  const remaining = 3 - totalImageCount.value
  const toAdd = files.slice(0, remaining)

  for (const file of toAdd) {
    stagedImages.value.push({
      uid: `${Date.now()}-${Math.random()}`,
      file,
      objectUrl: URL.createObjectURL(file),
      sort: totalImageCount.value + 1,
      status: 1,
      caption: { zh: '', en: '' },
      expanded: false,
    })
  }
}

function removeStagedImage(uid: string) {
  const idx = stagedImages.value.findIndex(i => i.uid === uid)
  if (idx !== -1) {
    URL.revokeObjectURL(stagedImages.value[idx].objectUrl)
    stagedImages.value.splice(idx, 1)
  }
}

// ── 送出 ───────────────────────────────────────────────────────
async function handleSubmit() {
  if (
    !form.categoryId ||
    !derivedSeriesType.value ||
    !form.nameZh ||
    form.price <= 0 ||
    form.sizeLength <= 0 ||
    form.sizeWidth <= 0 ||
    form.sizeHeight <= 0
  ) {
    ElMessage.warning($t('form.checkRequired'))
    return
  }

  isSaving.value = true
  try {
    // 上半部：產品基本資料轉 FormData
    const fd = new FormData()
    fd.append('categoryId', form.categoryId)
    fd.append('seriesId', derivedSeriesType.value)
    fd.append('name', JSON.stringify({ zh: form.nameZh, en: form.nameEn }))
    fd.append('description', JSON.stringify({ zh: form.descZh, en: form.descEn }))
    fd.append('price', String(form.price))
    fd.append('stock', String(form.stock))
    fd.append('isActive', String(form.isActive))
    fd.append('status', String(form.status))
    // Concat 三個尺寸欄位為字串格式（數字與 x 之間有空格）
    fd.append('size', `${form.sizeLength} x ${form.sizeWidth} x ${form.sizeHeight}`)

    let targetProductId = props.productId

    if (props.mode === 'create') {
      const res = await shopProductApi.createProduct(fd)
      targetProductId = (res as { data: { productId: string } })?.data?.productId ?? null
      ElMessage.success($t('messages.createSuccess', { type: $t('shop.products') }))
    } else if (props.mode === 'edit' && props.productId) {
      await shopProductApi.updateProduct(props.productId, fd)
      ElMessage.success($t('messages.updateSuccess', { type: $t('shop.products') }))
    }

    // ── 圖片佇列（下半部）──────────────────────────────────────
    if (targetProductId) {
      await processImageQueue(targetProductId)
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

async function processImageQueue(productId: string) {
  const errors: string[] = []

  // 1. 刪除標記圖片
  for (const img of existingImages.value.filter(i => i.deleted)) {
    try {
      await shopProductApi.deleteProductImages(img.imageId)
    } catch {
      errors.push(img.imageId)
    }
  }

  // 2. 更新已修改的既有圖片
  for (const img of existingImages.value.filter(i => i.modified && !i.deleted)) {
    try {
      await shopProductApi.updateProductImages(img.imageId, {
        id: img.imageId,
        sort: img.sort,
        status: img.status,
        caption: img.caption,
        ...(img.newFile ? { image: img.newFile } : {}),
      })
    } catch {
      errors.push(img.imageId)
    }
  }

  // 3. 新增暫存圖片
  for (const staged of stagedImages.value) {
    try {
      await shopProductApi.createProductImages({
        productId,
        image: staged.file,
        sort: staged.sort,
        status: staged.status,
        caption: staged.caption,
      })
    } catch {
      errors.push(staged.uid)
    }
  }

  if (errors.length > 0) {
    ElMessage.warning(`部分圖片操作失敗（${errors.length} 項），其餘已成功儲存`)
  }
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :loading="isSaving"
    :show-footer="!isViewMode"
    width="760px"
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
          <span>{{ $t('shop.product.form.sectionInfo') }}</span>
        </div>

        <el-row :gutter="16">
          <!-- 類別 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.categoryId')" required>
              <HcSelect
                v-model="form.categoryId"
                :disabled="isViewMode"
                :placeholder="
                  $t('form.pleaseSelect', { field: $t('shop.product.form.categoryId') })
                "
                style="width: 100%"
              >
                <el-option
                  v-for="cat in categoryOptions"
                  :key="cat.categoryId"
                  :label="cat.name"
                  :value="cat.categoryId"
                  :disabled="cat.status !== 1"
                />
              </HcSelect>
            </el-form-item>
          </el-col>

          <!-- 系列（自動帶入，唯讀顯示） -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.seriesId')">
              <div class="series-display">
                <el-tag v-if="derivedSeriesLabel" type="success" size="large" round>
                  {{ derivedSeriesLabel }}
                </el-tag>
                <span v-else class="series-display__empty">—</span>
              </div>
            </el-form-item>
          </el-col>

          <!-- 商品名稱 zh / en -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.nameZh')" required>
              <HcInput
                v-model="form.nameZh"
                :disabled="isViewMode"
                :placeholder="$t('form.pleaseFill', { field: $t('shop.product.form.nameZh') })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.nameEn')">
              <HcInput
                v-model="form.nameEn"
                :disabled="isViewMode"
                :placeholder="$t('form.pleaseFill', { field: $t('shop.product.form.nameEn') })"
              />
            </el-form-item>
          </el-col>

          <!-- 商品描述 zh / en -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.descZh')">
              <HcInput v-model="form.descZh" type="textarea" :rows="3" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.descEn')">
              <HcInput v-model="form.descEn" type="textarea" :rows="3" :disabled="isViewMode" />
            </el-form-item>
          </el-col>

          <!-- 商品尺寸（長、寬、高） -->
          <el-col :span="24">
            <el-form-item :label="$t('shop.product.form.size')" required>
              <el-row :gutter="16">
                <el-col :span="8">
                  <HcInputNumber
                    v-model="form.sizeLength"
                    :min="0"
                    :step="0.01"
                    :controls="false"
                    :disabled="isViewMode"
                    :placeholder="$t('shop.product.form.sizeLength')"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <HcInputNumber
                    v-model="form.sizeWidth"
                    :min="0"
                    :step="0.01"
                    :controls="false"
                    :disabled="isViewMode"
                    :placeholder="$t('shop.product.form.sizeWidth')"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <HcInputNumber
                    v-model="form.sizeHeight"
                    :min="0"
                    :step="0.01"
                    :controls="false"
                    :disabled="isViewMode"
                    :placeholder="$t('shop.product.form.sizeHeight')"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>

          <!-- 售價 / 庫存 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.price')" required>
              <HcInputNumber
                v-model="form.price"
                :min="0"
                :disabled="isViewMode"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.form.stock')" required>
              <HcInputNumber
                v-model="form.stock"
                :min="0"
                :disabled="isViewMode"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!--  啟用 status（同一行） -->
          <el-col :span="12">
            <el-form-item class="tw-mb-2">
              <template #label>
                <span>{{ $t('shop.product.form.statusLabel') }}</span>
                <span class="field-help">{{ $t('shop.product.form.statusHelp') }}</span>
              </template>
              <HcSwitch
                v-model="form.status"
                :active-value="1 as 1"
                :inactive-value="0 as 0"
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── Section 2：商品圖片 ─────────────────────────────── -->
      <div class="form-section form-section--last">
        <div class="form-section__header">
          <i class="fa-solid fa-images form-section__icon" />
          <span>{{ $t('shop.product.form.sectionImages') }}</span>
          <span class="form-section__tip">{{ $t('shop.product.form.imageTip') }}</span>
        </div>

        <!-- 既有圖片（edit / view 模式） -->
        <div v-if="existingImages.length > 0" class="image-grid">
          <ProductImageCard
            v-for="(img, idx) in existingImages"
            :key="img.imageId"
            :image="img"
            :index="idx"
            :disabled="isViewMode"
            @update:image="existingImages[idx] = $event as ExistingImage"
            @delete="existingImages.splice(idx, 1)"
          />
        </div>

        <div v-if="stagedImages.length > 0" class="image-grid tw-mt-3">
          <ProductImageCard
            v-for="(img, idx) in stagedImages"
            :key="img.uid"
            :image="img"
            :index="existingImages.filter(i => !i.deleted).length + idx"
            :disabled="isViewMode"
            @update:image="stagedImages[idx] = $event as StagedImage"
            @delete="removeStagedImage(img.uid)"
          />
        </div>

        <!-- 上傳按鈕（數量 < 3 且非 view） -->
        <label v-if="canUploadMore" class="upload-btn">
          <input
            type="file"
            accept="image/*"
            multiple
            class="tw-hidden"
            @change="handleUploadChange"
          />
          <i class="fa-solid fa-plus tw-text-lg" />
          <span>{{ $t('shop.product.form.imageUpload') }}</span>
          <span class="upload-btn__count">{{ totalImageCount }}/3</span>
        </label>

        <!-- View 模式無圖 placeholder -->
        <div
          v-if="isViewMode && existingImages.length === 0 && stagedImages.length === 0"
          class="no-image-placeholder"
        >
          <i class="fa-solid fa-images" />
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
  padding: 16px;
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

.field-help {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 400;
  color: $color-neutral-400;
}

.series-display {
  display: flex;
  align-items: center;
  height: 32px;

  &__empty {
    color: $color-neutral-400;
    font-size: 14px;
  }
}

.image-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  height: 64px;
  border: 1px dashed $color-neutral-300;
  border-radius: 8px;
  color: $color-neutral-500;
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
  padding: 0 12px;

  &:hover {
    border-color: $color-primary;
    color: $color-primary;
  }

  &__count {
    margin-left: auto;
    margin-right: 16px;
    font-size: 11px;
    color: $color-neutral-400;
  }
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  gap: 8px;
  border: 1px dashed $color-neutral-300;
  border-radius: 8px;
  color: $color-neutral-500;

  i {
    font-size: 24px;
  }

  span {
    font-size: 13px;
  }
}
</style>
