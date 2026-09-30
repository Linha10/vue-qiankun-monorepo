<script setup lang="ts">
import { computed } from "vue";
import type { ButtonProps } from "element-plus";

/**
 * HcButton — 主題化 el-button 包裝元件
 *
 * 完整繼承 ElButton 所有 props，所有 El Plus 原生屬性均可直接使用。
 * 事件透過 $attrs 自動轉發至內部 el-button。
 *
 * ── 功能性擴充 props（預留，非樣式）───────────────────────────────
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<
  Partial<ButtonProps> & {
    /**
     * 點擊節流間隔（ms）。
     * 設定後連續點擊在此時間內只觸發一次 click 事件。（預留）
     */
    throttle?: number;
    /**
     * 點擊前顯示確認提示文字。
     * 設定後 click 在使用者確認後才觸發。（預留）
     */
    confirm?: string;
  }
>();

/** 傳給 el-button 的 props：排除 HcButton 自有的功能欄位 */
const elProps = computed(() => {
  const { throttle: _throttle, confirm: _confirm, ...rest } = props;
  return rest;
});
</script>

<template>
  <el-button v-bind="{ ...elProps, ...$attrs }">
    <slot />
  </el-button>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

/* ─── primary 按鈕完整色系覆蓋 ──────────────────────────────── */
:deep(.el-button--primary) {
  background-color: $color-primary;
  border-color: $color-primary;
  color: $color-neutral-0;

  &:hover:not(.is-disabled):not(.is-loading) {
    background-color: $color-primary-700;
    border-color: $color-primary-700;
    color: $color-neutral-0;
  }

  &:active:not(.is-disabled) {
    background-color: $color-primary-900;
    border-color: $color-primary-900;
    color: $color-neutral-0;
  }

  &:focus-visible {
    outline-color: $color-primary;
  }

  /* disabled 狀態 */
  &.is-disabled,
  &.is-disabled:hover {
    background-color: $color-primary-100;
    border-color: $color-primary-100;
    color: $color-neutral-0;
    opacity: 0.7;
  }

  /* plain 模式：底色淡、邊框與文字用主色 */
  &.is-plain {
    background-color: $color-primary-50;
    border-color: $color-primary;
    color: $color-primary;

    &:hover:not(.is-disabled) {
      background-color: $color-primary;
      border-color: $color-primary;
      color: $color-neutral-0;
    }
  }
}

/* ─── default 按鈕：hover 時顯示淡色主題色 ──────────────────────────────── */
:deep(.el-button--default) {
  &:hover:not(.is-disabled):not(.is-loading) {
    background-color: $color-primary-50;
    border-color: $color-primary;
    color: $color-primary;
  }
}

/* text / link 按鈕的 primary 色 */
:deep(.el-button--primary.is-text),
:deep(.el-button--primary.is-link) {
  color: $color-primary;
  background-color: transparent;
  border-color: transparent;

  &:hover:not(.is-disabled) {
    color: $color-primary-700;
    background-color: $color-primary-50;
  }
}
</style>
