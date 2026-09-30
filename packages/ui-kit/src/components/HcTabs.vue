<script setup lang="ts">
import { computed } from "vue";
import type { TabsProps } from "element-plus";

/**
 * HcTabs — 主題化 el-tabs 包裝元件
 *
 * 完整繼承 ElTabs 所有 props，slots（default）與事件均透過 $attrs 自動轉發。
 * 注意：el-tab-pane 必須直接放入 HcTabs 的 default slot，
 *       不可再包一層，否則 tab 系統無法識別 pane。
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<Partial<TabsProps>>();

const elProps = computed(() => ({ ...props }));
</script>

<template>
  <el-tabs v-bind="{ ...elProps, ...$attrs }" class="hc-tabs">
    <slot />
  </el-tabs>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

/* ─── active bar（底線）主題色 ─────────────────────────── */
:deep(.el-tabs__active-bar) {
  background-color: $color-primary;
}

/* ─── 選中 tab 文字色 ──────────────────────────────────── */
:deep(.el-tabs__item.is-active) {
  color: $color-primary;
}

/* ─── hover tab 文字色 ─────────────────────────────────── */
:deep(.el-tabs__item:hover) {
  color: $color-primary-700;
}
</style>
