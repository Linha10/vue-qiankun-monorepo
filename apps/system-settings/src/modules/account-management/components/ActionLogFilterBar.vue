<script setup lang="ts">
import { ref, watch } from "vue";
import type { RequestMethod } from "@monorepo/types";
import { useI18n } from "@monorepo/composables";
import {
  HcButton,
  HcInput,
  HcInputNumber,
  HcSelect,
  HcDatePicker,
} from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  accountName: string;
  requestMethod: RequestMethod | undefined;
  errorCode: number | undefined;
  dateRange: string[];
}>();

const emit = defineEmits<{
  "update:accountName": [val: string];
  "update:requestMethod": [val: RequestMethod | undefined];
  "update:errorCode": [val: number | undefined];
  "update:dateRange": [val: string[]];
  search: [];
  reset: [];
}>();

const { $t } = useI18n();

// ── 帳號名稱模糊搜尋 debounce ────────────────────────────────
const localAccountName = ref(props.accountName);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.accountName,
  (val) => {
    if (val !== localAccountName.value) localAccountName.value = val;
  },
);

function onAccountNameInput(val: string) {
  localAccountName.value = val;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("update:accountName", val);
    emit("search");
  }, 400);
}

function onRequestMethodChange(val: unknown) {
  emit("update:requestMethod", val as RequestMethod | undefined);
  emit("search");
}

function onErrorCodeChange(val: unknown) {
  emit("update:errorCode", (val as number) ?? undefined);
  emit("search");
}

function onDateRangeChange(val: unknown) {
  emit("update:dateRange", (val as string[]) ?? []);
  emit("search");
}
</script>

<template>
  <div
    class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm"
  >
    <!-- 帳號名稱 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.actionLogs.filter.accountNamePlaceholder")
      }}</span>
      <HcInput
        :model-value="localAccountName"
        :placeholder="
          $t('accountManagement.actionLogs.filter.accountNamePlaceholder')
        "
        clearable
        style="width: 200px"
        @update:model-value="onAccountNameInput"
      />
    </div>

    <!-- Request Method -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.actionLogs.filter.requestMethod")
      }}</span>
      <HcSelect
        :model-value="requestMethod"
        :placeholder="$t('accountManagement.actionLogs.filter.all')"
        clearable
        style="width: 140px"
        @update:model-value="onRequestMethodChange"
      >
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </HcSelect>
    </div>

    <!-- 錯誤代碼 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.actionLogs.filter.errorCode")
      }}</span>
      <HcInputNumber
        :model-value="errorCode"
        :placeholder="
          $t('accountManagement.actionLogs.filter.errorCodePlaceholder')
        "
        :controls="false"
        style="width: 140px"
        @update:model-value="onErrorCodeChange"
      />
    </div>

    <!-- 日期範圍 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.actionLogs.filter.dateRange")
      }}</span>
      <HcDatePicker
        :model-value="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="—"
        style="width: 240px"
        @update:model-value="onDateRangeChange"
      />
    </div>

    <!-- 按鈕群組（無 CRUD，僅重置） -->
    <div class="tw-flex tw-gap-2 tw-ml-auto">
      <HcButton plain @click="emit('reset')">{{
        $t("accountManagement.actionLogs.filter.reset")
      }}</HcButton>
    </div>
  </div>
</template>
