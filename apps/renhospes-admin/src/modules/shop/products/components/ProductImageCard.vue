<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@monorepo/composables'
import { HcInput, HcInputNumber, HcSwitch } from '@monorepo/ui-kit'

// ── 共用型別（與 ProductFormDialog 共享） ──────────────────────
export interface StagedImage {
  uid: string
  file: File
  objectUrl: string
  sort: number
  status: 1 | 2 // 1=顯示 2=隱藏
  caption: { zh: string; en: string }
  expanded: boolean
}

export interface ExistingImage {
  imageId: string
  url: string
  sort: number
  status: 1 | 2
  caption: { zh: string; en: string }
  newFile?: File
  newObjectUrl?: string
  expanded: boolean
  modified: boolean
  deleted: boolean
}

export type ImageCard = StagedImage | ExistingImage

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  image: ImageCard
  index: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:image': [val: ImageCard]
  delete: []
}>()

const { $t } = useI18n()

const isExisting = (img: ImageCard): img is ExistingImage => 'imageId' in img

const previewUrl = computed(() => {
  if (isExisting(props.image)) {
    return props.image.newObjectUrl ?? props.image.url
  }
  return props.image.objectUrl
})

const isDeleted = computed(() => isExisting(props.image) && props.image.deleted)

function patch(partial: Partial<ImageCard>) {
  emit('update:image', { ...props.image, ...partial } as ImageCard)
}

function toggleExpand() {
  if (isDeleted.value) return
  patch({ expanded: !props.image.expanded })
}

function onSortChange(val: number) {
  patch({ sort: val, ...(isExisting(props.image) ? { modified: true } : {}) })
}

function onStatusChange(val: 1 | 2) {
  patch({ status: val, ...(isExisting(props.image) ? { modified: true } : {}) })
}

function onCaptionChange(lang: 'zh' | 'en', val: string) {
  const caption = { ...props.image.caption, [lang]: val }
  patch({ caption, ...(isExisting(props.image) ? { modified: true } : {}) })
}

function handleDelete() {
  if (isExisting(props.image)) {
    // 標記刪除，confirm 後才呼叫 API
    patch({ deleted: true, expanded: false })
  } else {
    // 暫存圖直接移除
    URL.revokeObjectURL(props.image.objectUrl)
    emit('delete')
  }
}

function handleUndoDelete() {
  patch({ deleted: false })
}
</script>

<template>
  <div
    class="image-card"
    :class="{
      'image-card--expanded': image.expanded,
      'image-card--deleted': isDeleted,
    }"
  >
    <!-- ── 卡片頭部 ───────────────────────────────────────────── -->
    <div class="image-card__header" @click="toggleExpand">
      <!-- 縮圖 -->
      <div class="image-card__thumb">
        <el-image
          v-if="!isDeleted"
          :src="previewUrl"
          fit="cover"
          class="image-card__img"
          preview-teleported
          :preview-src-list="[previewUrl]"
          @click.stop
        />
        <div v-else class="image-card__deleted-overlay">
          <i class="fa-solid fa-trash" />
          <span>待刪除</span>
        </div>
      </div>

      <!-- 序號 -->
      <span class="image-card__index">#{{ index + 1 }}</span>

      <!-- 狀態 badge -->
      <el-tag
        v-if="!isDeleted"
        :type="image.status === 1 ? 'success' : 'info'"
        size="small"
        class="tw-ml-2"
      >
        {{
          image.status === 1
            ? $t('shop.product.imageCard.statusShow')
            : $t('shop.product.imageCard.statusHide')
        }}
      </el-tag>

      <div class="tw-ml-auto tw-flex tw-items-center tw-gap-1">
        <!-- 展開/收合 -->
        <i
          v-if="!isDeleted && !disabled"
          class="fa-solid tw-text-slate-400 tw-text-xs tw-transition-transform"
          :class="image.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"
        />
        <!-- 刪除 / 復原 -->
        <el-tooltip
          v-if="!disabled"
          :content="isDeleted ? '復原' : $t('common.delete')"
          placement="top"
        >
          <el-button
            :type="isDeleted ? 'warning' : 'danger'"
            circle
            size="small"
            @click.stop="isDeleted ? handleUndoDelete() : handleDelete()"
          >
            <i :class="isDeleted ? 'fa-solid fa-rotate-left' : 'fa-solid fa-trash'" />
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- ── 展開設定面板（accordion） ────────────────────────────── -->
    <Transition name="accordion">
      <div v-if="image.expanded && !isDeleted" class="image-card__panel">
        <el-row :gutter="12">
          <!-- 排序 -->
          <el-col :span="8">
            <el-form-item :label="$t('shop.product.imageCard.sort')" class="tw-mb-2">
              <HcInputNumber
                :model-value="image.sort"
                :min="1"
                :max="99"
                :disabled="disabled"
                style="width: 100%"
                @update:model-value="onSortChange($event as number)"
              />
            </el-form-item>
          </el-col>

          <!-- 顯示狀態 -->
          <el-col :span="8">
            <el-form-item :label="$t('shop.product.imageCard.status')" class="tw-mb-2">
              <HcSwitch
                :model-value="image.status"
                :active-value="1 as 1"
                :inactive-value="2 as 2"
                :disabled="disabled"
                @change="onStatusChange($event as 1 | 2)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <!-- Caption 中文 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.imageCard.captionZh')" class="tw-mb-2">
              <HcInput
                :model-value="image.caption.zh"
                :disabled="disabled"
                @update:model-value="onCaptionChange('zh', $event as string)"
              />
            </el-form-item>
          </el-col>
          <!-- Caption 英文 -->
          <el-col :span="12">
            <el-form-item :label="$t('shop.product.imageCard.captionEn')" class="tw-mb-2">
              <HcInput
                :model-value="image.caption.en"
                :disabled="disabled"
                @update:model-value="onCaptionChange('en', $event as string)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.image-card {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  overflow: hidden;
  background: $color-neutral-0;
  transition: border-color 0.2s;

  &:hover {
    border-color: $color-primary;
  }

  &--deleted {
    opacity: 0.6;
    border-style: dashed;
    border-color: $color-danger;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    cursor: pointer;
    user-select: none;
  }

  &__thumb {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    background: $color-neutral-100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__img {
    width: 100%;
    height: 100%;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__deleted-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: $color-danger;
    font-size: 11px;
    width: 100%;
    height: 100%;

    i {
      font-size: 16px;
    }
  }

  &__index {
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-600;
    min-width: 20px;
  }

  &__panel {
    padding: 12px 12px 4px;
    border-top: 1px solid $color-neutral-100;
    background: $color-neutral-50;
  }
}

// Accordion transition
.accordion-enter-active,
.accordion-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 200px;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
