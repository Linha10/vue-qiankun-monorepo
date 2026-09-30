<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { UploadUserFile } from 'element-plus'
import type { ImageItem } from '@/types/api-params'
import { HcButton, HcRadio, HcInputNumber } from '@monorepo/ui-kit'
import { HcMessageBox } from '@monorepo/utils'

const props = withDefaults(
  defineProps<{
    isEditMode: boolean
    initialImages?: ImageItem[]
    onUpload?: (file: File) => Promise<ImageItem>
    onUpdate?: (
      imageId: string,
      data: { caption: { zh: string; en: string }; sort: number; status: 0 | 1 }
    ) => Promise<unknown>
    onDelete?: (imageId: string) => Promise<unknown>
  }>(),
  {
    initialImages: () => [],
  }
)

// ── Create 模式：本地檔案列表 ──
const fileList = ref<UploadUserFile[]>([])

// ── Edit 模式：已儲存圖片列表 ──
const images = ref<ImageItem[]>([])

watch(
  () => props.initialImages,
  val => {
    if (val && val.length > 0) {
      images.value = val.map(img => ({ ...img, caption: { ...img.caption } }))
    }
  },
  { immediate: true }
)

// ── Dialog 狀態 ──
const dialogVisible = ref(false)
const dialogImage = ref<ImageItem | null>(null)
const isDialogSaving = ref(false)
const isDialogDeleting = ref(false)
const isImageUploading = ref(false)

const openImageDialog = (img: ImageItem) => {
  dialogImage.value = { ...img, caption: { ...img.caption } }
  dialogVisible.value = true
}

const handleDialogSave = async () => {
  if (!dialogImage.value || !props.onUpdate) return
  isDialogSaving.value = true
  try {
    await props.onUpdate(dialogImage.value.imageId, {
      caption: dialogImage.value.caption,
      sort: dialogImage.value.sort,
      status: dialogImage.value.status,
    })
    ElMessage.success('圖片資訊更新成功')
    const idx = images.value.findIndex(i => i.imageId === dialogImage.value!.imageId)
    if (idx !== -1) images.value[idx] = { ...dialogImage.value! }
    dialogVisible.value = false
  } catch {
    ElMessage.error('圖片資訊更新失敗')
  } finally {
    isDialogSaving.value = false
  }
}

const handleDialogDelete = async () => {
  if (!dialogImage.value || !props.onDelete) return
  try {
    await HcMessageBox.confirm('確定要刪除此圖片嗎？', '刪除確認', {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  isDialogDeleting.value = true
  try {
    await props.onDelete(dialogImage.value.imageId)
    ElMessage.success('圖片刪除成功')
    images.value = images.value.filter(i => i.imageId !== dialogImage.value!.imageId)
    dialogVisible.value = false
  } catch {
    ElMessage.error('圖片刪除失敗')
  } finally {
    isDialogDeleting.value = false
  }
}

const handleUpload = async (file: File) => {
  if (!props.onUpload) return
  isImageUploading.value = true
  try {
    const newImg = await props.onUpload(file)
    images.value.push(newImg)
    ElMessage.success('圖片上傳成功')
  } catch {
    ElMessage.error('圖片上傳失敗')
  } finally {
    isImageUploading.value = false
  }
}

defineExpose({ fileList })
</script>

<template>
  <!-- Create 模式：批次上傳 -->
  <template v-if="!isEditMode">
    <el-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :auto-upload="false"
      accept="image/*"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="tw-text-xs tw-text-slate-400 tw-mt-2">
          支援 JPG / PNG / WebP，單檔建議不超過 5MB
        </div>
      </template>
    </el-upload>
  </template>

  <!-- Edit 模式：個別圖片 card，點擊開 dialog -->
  <template v-else>
    <div class="tw-flex tw-flex-wrap tw-gap-3">
      <!-- 現有圖片 card -->
      <div
        v-for="img in images"
        :key="img.imageId"
        class="hc-img-card"
        @click="openImageDialog(img)"
      >
        <img :src="img.url" alt="" class="tw-w-full tw-h-full tw-object-cover" />
        <div class="hc-img-overlay">
          <span class="tw-text-xs tw-text-white">編輯</span>
        </div>
        <el-tag
          :type="img.status === 1 ? 'success' : 'info'"
          size="small"
          class="tw-absolute tw-top-1 tw-right-1"
        >
          {{ img.status === 1 ? '啟用' : '停用' }}
        </el-tag>
      </div>

      <!-- 上傳新圖片觸發器 -->
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        accept="image/*"
        :on-change="(uploadFile: any) => handleUpload(uploadFile.raw)"
        v-loading="isImageUploading"
      >
        <div class="hc-img-add">
          <el-icon size="24"><Plus /></el-icon>
          <span class="tw-text-xs tw-text-slate-400 tw-mt-1">上傳圖片</span>
        </div>
      </el-upload>
    </div>

    <p v-if="images.length === 0" class="tw-text-sm tw-text-slate-400 tw-py-2">
      尚無圖片，點擊「+」開始上傳
    </p>
  </template>

  <!-- ── 圖片編輯 Dialog（Edit 模式）── -->
  <el-dialog
    v-model="dialogVisible"
    title="編輯圖片"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    class="hc-img-edit-dialog"
  >
    <template v-if="dialogImage">
      <!-- Hero 圖片 -->
      <div class="img-hero">
        <img :src="dialogImage.url" alt="" />
        <div class="img-hero__overlay" />
        <div class="img-hero__badge">
          <el-tag :type="dialogImage.status === 1 ? 'success' : 'info'" size="small" effect="dark">
            {{ dialogImage.status === 1 ? '啟用' : '停用' }}
          </el-tag>
        </div>
      </div>

      <!-- 表單主體 -->
      <div class="img-form-body">
        <el-form label-position="top">
          <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
            <!-- 左欄：圖說 -->
            <div>
              <p class="img-section-label">圖片說明</p>
              <el-form-item label="中文說明">
                <el-input v-model="dialogImage.caption.zh" placeholder="請輸入中文說明" />
              </el-form-item>
              <el-form-item label="English Caption">
                <el-input v-model="dialogImage.caption.en" placeholder="Enter caption" />
              </el-form-item>
            </div>
            <!-- 右欄：顯示設定 -->
            <div>
              <p class="img-section-label">顯示設定</p>
              <el-form-item label="排序">
                <hc-input-number
                  v-model="dialogImage.sort"
                  :min="0"
                  controls-position="right"
                  class="tw-w-full"
                />
              </el-form-item>
              <el-form-item label="狀態">
                <el-radio-group v-model="dialogImage.status">
                  <hc-radio :value="1">啟用</hc-radio>
                  <hc-radio :value="0">停用</hc-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
    </template>

    <template #footer>
      <div class="img-dialog-footer">
        <hc-button type="danger" plain :loading="isDialogDeleting" @click="handleDialogDelete">
          <el-icon class="tw-mr-1"><Delete /></el-icon>刪除圖片
        </hc-button>
        <div class="tw-flex tw-gap-2">
          <hc-button @click="dialogVisible = false">取消</hc-button>
          <hc-button type="primary" :loading="isDialogSaving" @click="handleDialogSave">
            儲存變更
          </hc-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

// ── 圖片 card grid ──────────────────────────────────────

.hc-img-card {
  position: relative;
  width: 148px;
  height: 148px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid $color-border;
  cursor: pointer;

  &:hover .hc-img-overlay {
    opacity: 1;
  }
}

.hc-img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.hc-img-add {
  width: 148px;
  height: 148px;
  border: 1px dashed $color-border;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-text-muted;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: $color-primary;
    color: $color-primary;
  }
}

// ── 圖片編輯 Dialog ─────────────────────────────────────

:deep(.hc-img-edit-dialog) {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 16px 24px 12px;
    border-bottom: 1px solid $color-border-subtle;
    margin: 0;

    .el-dialog__title {
      font-size: 15px;
      font-weight: 600;
      color: $color-text-primary;
    }
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 12px 24px 16px;
    border-top: 1px solid $color-border-subtle;
  }
}

.img-hero {
  position: relative;
  height: 220px;
  overflow: hidden;
  background-color: $color-neutral-100;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent);
    pointer-events: none;
  }

  &__badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}

.img-form-body {
  padding: 16px 24px;
}

.img-section-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: $color-text-muted;
  margin-bottom: 12px;
}

.img-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
