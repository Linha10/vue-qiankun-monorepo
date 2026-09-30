<script setup lang="ts">
import { ref, watch } from "vue";
import type { Provider, LogAction } from "@monorepo/types";
import { useI18n } from "@monorepo/composables";
import { HcButton, HcInput, HcSelect, HcDatePicker } from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  loginId: string;
  action: LogAction | undefined;
  provider: Provider | undefined;
  dateRange: string[];
}>();

const emit = defineEmits<{
  "update:loginId": [val: string];
  "update:action": [val: LogAction | undefined];
  "update:provider": [val: Provider | undefined];
  "update:dateRange": [val: string[]];
  search: [];
  reset: [];
}>();

const { $t } = useI18n();

// ── 帳號ID模糊搜尋 debounce ──────────────────────────────────
const localLoginId = ref(props.loginId);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.loginId,
  (val) => {
    if (val !== localLoginId.value) localLoginId.value = val;
  },
);

function onLoginIdInput(val: string) {
  localLoginId.value = val;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("update:loginId", val);
    emit("search");
  }, 400);
}

function onActionChange(val: unknown) {
  emit("update:action", val as LogAction | undefined);
  emit("search");
}

function onProviderChange(val: unknown) {
  emit("update:provider", val as Provider | undefined);
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
    <!-- 登入帳號 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.loginLogs.filter.loginIdPlaceholder")
      }}</span>
      <HcInput
        :model-value="localLoginId"
        :placeholder="
          $t('accountManagement.loginLogs.filter.loginIdPlaceholder')
        "
        clearable
        style="width: 200px"
        @update:model-value="onLoginIdInput"
      />
    </div>

    <!-- 動作類型 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.loginLogs.filter.action")
      }}</span>
      <HcSelect
        :model-value="action"
        :placeholder="$t('accountManagement.loginLogs.filter.all')"
        clearable
        style="width: 140px"
        @update:model-value="onActionChange"
      >
        <el-option
          :label="$t('accountManagement.loginLogs.action.login')"
          value="login"
        />
        <el-option
          :label="$t('accountManagement.loginLogs.action.logout')"
          value="logout"
        />
      </HcSelect>
    </div>

    <!-- 來源 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.loginLogs.filter.provider")
      }}</span>
      <HcSelect
        :model-value="provider"
        :placeholder="$t('accountManagement.loginLogs.filter.all')"
        clearable
        style="width: 140px"
        @update:model-value="onProviderChange"
      >
        <el-option
          :label="$t('accountManagement.loginLogs.provider.backend')"
          value="backend"
        />
        <el-option
          :label="$t('accountManagement.loginLogs.provider.system')"
          value="system"
        />
      </HcSelect>
    </div>

    <!-- 日期範圍 -->
    <div class="tw-flex tw-flex-col tw-gap-1">
      <span class="tw-text-xs tw-text-slate-500">{{
        $t("accountManagement.loginLogs.filter.dateRange")
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
        $t("accountManagement.loginLogs.filter.reset")
      }}</HcButton>
    </div>
  </div>
</template>
