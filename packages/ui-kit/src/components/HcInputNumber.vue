<script setup lang="ts">
import { computed } from "vue";
import type { InputNumberProps } from "element-plus";

/**
 * HcInputNumber — 主題化 el-input-number 包裝元件
 *
 * 完整繼承 ElInputNumber 所有 props。
 * 事件透過 $attrs 自動轉發至內部 el-input-number。
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<Partial<InputNumberProps>>();

const elProps = computed(() => ({ ...props }));
</script>

<template>
  <span class="hc-input-number">
    <el-input-number v-bind="{ ...elProps, ...$attrs }" />
  </span>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-input-number {
  display: contents;
}

/* ─── focus 狀態 border ──────────────────────────────────── */
:deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

/* ─── 增減按鈕 hover / active ────────────────────────────── */
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: $color-primary;
  border-color: $color-primary;
}

:deep(.el-input-number__decrease:active),
:deep(.el-input-number__increase:active) {
  color: $color-primary-700;
  border-color: $color-primary-700;
}
</style>
