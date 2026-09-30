<script setup lang="ts">
import type { SwitchProps } from "element-plus";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<Partial<SwitchProps>>(), {
  activeValue: true,
  inactiveValue: false,
});
</script>

<template>
  <span class="hc-switch">
    <el-switch v-bind="{ ...$props, ...$attrs }" />
  </span>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-switch {
  display: contents;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: $color-primary;
  border-color: $color-primary;
}

:deep(.el-switch .el-switch__core:hover) {
  border-color: $color-primary-700;
}
</style>
