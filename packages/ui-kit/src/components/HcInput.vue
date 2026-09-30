<script setup lang="ts">
import { computed } from "vue";
import type { InputProps } from "element-plus";

/**
 * HcInput — 主題化 el-input 包裝元件
 *
 * 完整繼承 ElInput 所有 props，slots（prefix / suffix / prepend / append）
 * 與事件均透過 $attrs 自動轉發。
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<Partial<InputProps>>();

const elProps = computed(() =>
  Object.fromEntries(
    Object.entries(props).filter(([k, v]) => {
      if (v === undefined) return false;
      if (k === "inputStyle" && v === false) return false;
      return true;
    }),
  ),
);
</script>

<template>
  <span class="hc-input">
    <el-input v-bind="{ ...elProps, ...$attrs }">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </el-input>
  </span>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-input {
  display: contents;
}

/* ─── focus 狀態 border ──────────────────────────────────── */
:deep(.el-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

:deep(.el-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

/* ─── textarea 模式 ──────────────────────────────────────── */
:deep(.el-textarea .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px $color-primary inset;
}

:deep(.el-textarea .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px $color-primary inset;
}
</style>
