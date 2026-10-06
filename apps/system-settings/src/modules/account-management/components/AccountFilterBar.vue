<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcButton, HcInput, HcSelect } from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  search: string;
  status: 0 | 1 | undefined;
}>();

const emit = defineEmits<{
  "update:search": [val: string];
  "update:status": [val: 0 | 1 | undefined];
  search: [];
  reset: [];
  create: [];
}>();

const { $t } = useI18n();
const { canPerformAction } = usePermission();

// ── Search debounce ────────────────────────────────────────────
const localSearch = ref(props.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.search,
  (val) => {
    if (val !== localSearch.value) localSearch.value = val;
  },
);

function onSearchInput(val: string) {
  localSearch.value = val;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("update:search", val);
    emit("search");
  }, 400);
}

function onStatusChange(val: unknown) {
  emit("update:status", val as 0 | 1 | undefined);
  emit("search");
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 狀態篩選 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.filter.status")
      }}</span>
      <HcSelect
        :model-value="status"
        :placeholder="$t('accountManagement.filter.all')"
        clearable
        style="width: 140px"
        @update:model-value="onStatusChange"
      >
        <el-option :label="$t('accountManagement.filter.active')" :value="1" />
        <el-option
          :label="$t('accountManagement.filter.inactive')"
          :value="0"
        />
      </HcSelect>
    </div>

    <!-- 搜尋 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("common.search")
      }}</span>
      <HcInput
        :model-value="localSearch"
        :placeholder="$t('accountManagement.filter.searchPlaceholder')"
        clearable
        style="width: 220px"
        @update:model-value="onSearchInput($event as string)"
        @clear="onSearchInput('')"
      />
    </div>

    <!-- 按鈕群組 -->
    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton plain @click="emit('reset')">{{
        $t("accountManagement.filter.reset")
      }}</HcButton>
      <HcButton
        type="primary"
        :disabled="!canPerformAction('/account-management', 'create')"
        @click="emit('create')"
      >
        <i class="fa-solid fa-plus tw-mr-1" />
        {{ $t("accountManagement.filter.create") }}
      </HcButton>
    </div>
  </div>
</template>
