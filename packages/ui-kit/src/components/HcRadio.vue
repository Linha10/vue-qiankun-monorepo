<script setup lang="ts">
import { computed } from "vue";
import type { RadioProps } from "element-plus";

/**
 * HcRadio — 主題化 el-radio 包裝元件
 *
 * 完整繼承 ElRadio 所有 props，可直接放入 el-radio-group。
 * inject 機制完全不受影響（el-radio 仍是直接子元素）。
 *
 * ── 功能性擴充 props（預留，非樣式）───────────────────────────────
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<
  Partial<RadioProps> & {
    /**
     * 是否可反選（點擊已選中的 radio 將清除選擇）。
     * 適用於非必填篩選條件情境。（預留）
     */
    deselectable?: boolean;
  }
>();

const elProps = computed(() => {
  const { deselectable: _d, ...rest } = props;
  return rest;
});
</script>

<template>
  <!-- el-radio 本身即根元素（<label>），:deep() 可直接穿透至其子元素 -->
  <el-radio v-bind="{ ...elProps, ...$attrs }">
    <slot />
  </el-radio>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

/* ─── radio checked 狀態色系覆蓋 ────────────────────────────── */

/* 選中：外圓框 + 填色 */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: $color-primary;
  background-color: $color-primary;
}

/* 選中：內圓點（保持白色，明確宣告防止被其他規則覆蓋） */
:deep(.el-radio__input.is-checked .el-radio__inner::after) {
  background-color: $color-neutral-0;
}

/* 選中：標籤文字色 */
:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: $color-primary;
}

/* 帶外框模式（border prop）選中時的邊框色 */
:deep(.el-radio.is-bordered.is-checked) {
  border-color: $color-primary;
}

/* hover 時外圓框顏色 */
:deep(.el-radio .el-radio__inner:hover) {
  border-color: $color-primary;
}

/* focus 狀態外框色（鍵盤導航） */
:deep(.el-radio__input.is-focus .el-radio__inner) {
  border-color: $color-primary;
}
</style>
