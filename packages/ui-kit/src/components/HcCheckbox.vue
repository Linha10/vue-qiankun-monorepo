<script setup lang="ts">
import { computed } from "vue";
import type { CheckboxProps } from "element-plus";

/**
 * HcCheckbox — 主題化 el-checkbox 包裝元件
 *
 * 完整繼承 ElCheckbox 所有 props，可單獨使用或放入 el-checkbox-group。
 *
 * ── 功能性擴充 props（預留，非樣式）───────────────────────────────
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<
  Partial<CheckboxProps> & {
    /**
     * 互斥選項：勾選此項時，同一 group 其他項目自動取消。（預留）
     */
    exclusive?: boolean;
    /**
     * 全選控制器：此 checkbox 控制整組的全選 / 全取消。（預留）
     */
    checkAll?: boolean;
  }
>();

const elProps = computed(() => {
  const { exclusive: _e, checkAll: _ca, ...rest } = props;
  return rest;
});
</script>

<template>
  <!-- el-checkbox 本身即根元素（<label>），:deep() 可直接穿透至其子元素 -->
  <el-checkbox v-bind="{ ...elProps, ...$attrs }">
    <slot />
  </el-checkbox>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

/* ─── checkbox checked 狀態色系覆蓋 ──────────────────────────── */

/* 選中 + indeterminate（半選）：外框 + 填色 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  border-color: $color-primary;
  background-color: $color-primary;
}

/* 選中：標籤文字色 */
:deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: $color-primary;
}

/* 帶外框模式（border prop）選中時的邊框色 */
:deep(.el-checkbox.is-bordered.is-checked) {
  border-color: $color-primary;
}

/* hover 時外框色 */
:deep(.el-checkbox .el-checkbox__inner:hover) {
  border-color: $color-primary;
}

/* focus 狀態外框色（鍵盤導航） */
:deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  border-color: $color-primary;
}
</style>
