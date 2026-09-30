<script setup lang="ts">
import { computed } from "vue";
import { ElSelect } from "element-plus";
import type { SelectProps } from "element-plus";

/**
 * HcSelect — 主題化 el-select 包裝元件
 *
 * 完整繼承 ElSelect 所有 props，slots（default / prefix / empty / tag / loading）
 * 與事件均透過 $attrs 自動轉發。
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<Partial<SelectProps>>();

const elProps = computed(() =>
  Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)),
);
</script>

<template>
  <span class="hc-select">
    <el-select v-bind="{ ...elProps, ...$attrs }">
      <!-- default slot（放 el-option）不能再包一層動態 template，
           el-select 內部要直接拿到 el-option 的 vnode 才能正確 inject -->
      <slot />
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-if="$slots.tag" #tag="tagProps">
        <slot name="tag" v-bind="tagProps ?? {}" />
      </template>
      <template v-if="$slots.loading" #loading>
        <slot name="loading" />
      </template>
    </el-select>
  </span>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-select {
  display: contents;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

:deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px $color-primary inset;
}
</style>
