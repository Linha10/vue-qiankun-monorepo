<script setup lang="ts">
import { computed } from "vue";
import type { ImageProps } from "element-plus";

/**
 * HcImage — 主題化 el-image 包裝元件
 *
 * 完整繼承 ElImage 所有 props（fit / preview-src-list / lazy 等）。
 * 與事件、slots 均透過 $attrs 自動轉發。
 * 預設 fit='cover'。
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Partial<ImageProps>>(), {
  fit: "contain",
});

const elProps = computed(() =>
  Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)),
);
</script>

<template>
  <span class="hc-image">
    <el-image v-bind="{ ...elProps, ...$attrs }">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </el-image>
  </span>
</template>

<style scoped lang="scss">
@use "../styles/variables" as *;

.hc-image {
  display: contents;
}

:deep(.el-image) {
  display: block;
  width: 100%;
  height: 100%;
}

:deep(.el-image__error) {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-neutral-100;
  color: $color-neutral-400;
  font-size: 13px;
  height: 100%;
}
</style>
