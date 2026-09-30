<script setup lang="ts">
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /**
   * 附加到 picker panel 上的 CSS class；
   * 會與 hc-date-picker-panel 合併後傳給 el-date-picker 的 popper-class。
   */
  popperClass?: string;
}>();

const mergedPopperClass = computed(() =>
  ["hc-date-picker-panel", props.popperClass].filter(Boolean).join(" "),
);
</script>

<template>
  <el-date-picker v-bind="$attrs" :popper-class="mergedPopperClass" />
</template>

<!--
  非 scoped：panel 透過 teleport 掛載在 body，
  scoped 選擇器穿透不到，必須用全域樣式搭配 popper-class 作用域限定。
-->
<style lang="scss">
@use "../styles/variables" as *;

.hc-date-picker-panel {
  // 選中起始 / 結束格：主題色背景
  .el-date-table td.start-date .el-date-table-cell__text,
  .el-date-table td.end-date .el-date-table-cell__text {
    background-color: $color-primary !important;
  }

  // 滑鼠懸停時的暫時選中格
  .el-date-table td.end-date.hover-end .el-date-table-cell__text {
    background-color: $color-primary !important;
  }

  // 區間格：淡主題色背景
  .el-date-table td.in-range .el-date-table-cell {
    background-color: $color-primary-50 !important;
  }

  // 今天的日期標記（未被選中時）
  .el-date-table
    td.today:not(.start-date):not(.end-date)
    .el-date-table-cell__text {
    color: $color-primary;
    font-weight: 700;
    border-color: $color-primary;
  }

  // 確認按鈕主題色
  .el-button--default.is-plain:focus,
  .el-button--default.is-plain:hover {
    color: $color-primary;
    border-color: $color-primary;
  }
}
</style>
