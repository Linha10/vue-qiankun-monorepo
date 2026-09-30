<script setup lang="ts">
import { computed } from "vue";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcInput, HcButton } from "@monorepo/ui-kit";
import type { EnableStatus } from "@monorepo/types";

defineProps<{
  search: string;
  status: EnableStatus | undefined;
}>();

const emit = defineEmits<{
  "update:search": [val: string];
  "update:status": [val: EnableStatus | undefined];
  search: [];
  reset: [];
  create: [];
}>();

const { $t } = useI18n();
const { canPerformAction } = usePermission();

const statusOptions = computed(() => [
  { label: $t("roleManagement.filter.all"), value: "" },
  { label: $t("roleManagement.filter.active"), value: 1 },
  { label: $t("roleManagement.filter.inactive"), value: 0 },
]);
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("common.search")
      }}</span>
      <HcInput
        :model-value="search"
        :placeholder="$t('roleManagement.filter.searchPlaceholder')"
        clearable
        style="width: 220px"
        @update:model-value="emit('update:search', $event as string)"
        @keyup.enter="emit('search')"
      />
    </div>

    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("roleManagement.filter.status")
      }}</span>
      <el-select
        :model-value="status"
        style="width: 140px"
        clearable
        @update:model-value="
          emit('update:status', $event as EnableStatus | undefined)
        "
      >
        <el-option
          v-for="opt in statusOptions"
          :key="String(opt.value)"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton @click="emit('reset')">{{
        $t("roleManagement.filter.reset")
      }}</HcButton>
      <HcButton type="primary" @click="emit('search')">{{
        $t("common.search")
      }}</HcButton>
      <HcButton
        type="primary"
        plain
        v-if="canPerformAction('/role-management', 'create')"
        @click="emit('create')"
      >
        {{ $t("roleManagement.filter.create") }}
      </HcButton>
    </div>
  </div>
</template>
