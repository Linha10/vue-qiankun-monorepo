<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { UploadFile } from "element-plus";

/**
 * HcUpload — 單張圖片上傳元件
 *
 * 提供圖片預覽、hover overlay、on-change 驗證（類型 + 大小）。
 * 不自動上傳（auto-upload="false"），僅透過 emit change 讓父元件持有 File。
 *
 * Props：
 *   modelValue  — 現有圖片 URL（初始預覽），傳入空字串表示無圖片
 *   maxMb       — 允許的最大檔案大小（MB），預設 5
 *   disabled    — 是否禁用上傳（view 模式）
 *
 * Emits：
 *   change(file: File) — 使用者選取合法圖片後觸發
 */
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    maxMb?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    maxMb: 5,
    disabled: false,
  },
);

const emit = defineEmits<{
  change: [file: File];
}>();

const previewUrl = ref("");
const imgError = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    previewUrl.value = val ?? "";
    imgError.value = false;
  },
  { immediate: true },
);

function handleChange(uploadFile: UploadFile) {
  const file = uploadFile?.raw;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    ElMessage.error("僅支援圖片格式（JPG / PNG / WebP 等）");
    return;
  }
  if (file.size / 1024 / 1024 > (props.maxMb ?? 5)) {
    ElMessage.error(`圖片大小不可超過 ${props.maxMb ?? 5}MB`);
    return;
  }

  previewUrl.value = URL.createObjectURL(file);
  imgError.value = false;
  emit("change", file);
}
</script>

<template>
  <el-upload
    :show-file-list="false"
    :auto-upload="false"
    :disabled="disabled"
    accept="image/*"
    class="hc-upload"
    :on-change="handleChange"
  >
    <div
      :class="[
        'upload-area',
        { 'upload-area--has-image': previewUrl && !imgError },
        { 'upload-area--disabled': disabled },
      ]"
    >
      <!-- 預覽圖 -->
      <img
        v-if="previewUrl && !imgError"
        :src="previewUrl"
        class="upload-area__preview"
        alt="preview"
        @error="imgError = true"
      />

      <!-- 圖片載入失敗 -->
      <div v-else-if="previewUrl && imgError" class="upload-area__placeholder">
        <i class="fa-solid fa-circle-exclamation upload-area__icon" />
        <span>圖片載入失敗</span>
      </div>

      <!-- 無圖片 -->
      <div v-else class="upload-area__placeholder">
        <i class="fa-solid fa-cloud-arrow-up upload-area__icon" />
        <span>點擊選擇圖片</span>
      </div>

      <!-- hover overlay（非 disabled） -->
      <div v-if="!disabled" class="upload-area__overlay">
        <i class="fa-solid fa-pen" />
        <span>{{ previewUrl ? "更換圖片" : "上傳圖片" }}</span>
      </div>
    </div>
  </el-upload>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-upload {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
    display: block;
  }
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 160px;
  border: 2px dashed $color-neutral-300;
  border-radius: 8px;
  background: $color-neutral-50;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:not(.upload-area--disabled):hover {
    border-color: $color-primary;
    background: $color-primary-50;
  }

  &--has-image {
    border-style: solid;
    border-color: $color-neutral-200;
    background: $color-neutral-100;
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &__preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: $color-neutral-400;
  }

  &__icon {
    font-size: 24px;
    color: $color-neutral-400;
  }

  span {
    font-size: 13px;
    color: $color-neutral-400;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 13px;
    opacity: 0;
    transition: opacity 0.2s;

    .upload-area:not(.upload-area--disabled):hover & {
      opacity: 1;
    }

    i {
      font-size: 18px;
    }

    span {
      font-size: 13px;
      color: #fff;
    }
  }
}
</style>
