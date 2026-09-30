<script setup lang="ts">
import { useI18n } from "@monorepo/composables";
import HcButton from "./HcButton.vue";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    width?: string | number;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
    /** 點擊遮罩是否關閉；預設 false（不關閉） */
    closeOnClickModal?: boolean;
    /** 是否顯示底部操作欄；預設 true */
    showFooter?: boolean;
  }>(),
  {
    width: "500px",
    loading: false,
    closeOnClickModal: false,
    showFooter: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
  confirm: [];
  cancel: [];
}>();

const { $t } = useI18n();

const handleClose = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <el-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    @close="handleClose"
  >
    <!-- 標題 slot（可由外部覆寫以自訂 header 內容） -->
    <template #header>
      <slot name="header">
        <span class="el-dialog__title">{{ title }}</span>
      </slot>
    </template>

    <!-- 主體內容 slot -->
    <slot />

    <!-- Footer -->
    <template v-if="showFooter" #footer>
      <slot name="footer">
        <div class="hc-dialog-footer">
          <HcButton type="danger" plain @click="handleClose">
            {{ cancelText ?? $t("common.cancel") }}
          </HcButton>
          <HcButton type="primary" :loading="loading" @click="handleConfirm">
            {{ confirmText ?? $t("common.confirm") }}
          </HcButton>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 右上角關閉按鈕：hover 改為深灰，避免沿用主題色
:deep(.el-dialog__headerbtn) {
  &:hover .el-dialog__close,
  &:focus .el-dialog__close {
    color: $color-neutral-700;
  }
}
</style>
